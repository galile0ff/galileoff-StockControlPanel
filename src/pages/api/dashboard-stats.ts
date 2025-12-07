import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Stoku azalan olarak kabul edilecek eşik değer
const LOW_STOCK_THRESHOLD = 1;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // 1. Toplam ürün çeşidi (benzersiz ürün sayısı)
    const { count: total_unique_products, error: uniqueProductsError } = await supabaseAdmin.from('products').select('*', { count: 'exact', head: true });
    if (uniqueProductsError) throw uniqueProductsError;

    // 2. Toplam ürün (sağlam ve defolu stokların toplamı)
    const { data: totalStockData, error: totalStockError } = await supabaseAdmin
      .from('product_variants')
      .select('stock_sound, stock_defective');

    if (totalStockError) throw totalStockError;
    const total_product_stock = totalStockData ? totalStockData.reduce((sum, variant) => sum + variant.stock_sound + variant.stock_defective, 0) : 0;

    // 3. Toplam satış (adet bazında)
    const { data: totalSalesQuantityData, error: totalSalesQuantityError } = await supabaseAdmin
      .from('sales')
      .select('quantity');

    if (totalSalesQuantityError) throw totalSalesQuantityError;
    const total_sales_quantity = totalSalesQuantityData ? totalSalesQuantityData.reduce((sum, sale) => sum + sale.quantity, 0) : 0;

    // 4. Toplam defolu ürün (adet bazında)
    const { data: defectiveStockData, error: defectiveStockError } = await supabaseAdmin
      .from('product_variants')
      .select('stock_defective')
      .gt('stock_defective', 0);

    if (defectiveStockError) throw defectiveStockError;
    const total_defective_stock = defectiveStockData ? defectiveStockData.reduce((sum, variant) => sum + variant.stock_defective, 0) : 0;

    // --- KRİTİK STOK VE ÇOK SATANLAR ---
    const { data: ignoredProducts, error: ignoredProductsError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('ignore_low_stock', true);

    if (ignoredProductsError) {
      console.error("Error fetching ignored products:", ignoredProductsError);
      throw ignoredProductsError;
    }

    const ignoredProductIds = ignoredProducts?.map(p => p.id) || [];

    let lowStockQuery = supabaseAdmin
      .from('product_variants')
      .select(`
        id,
        stock_sound,
        product:products(id, name, image_url),
        size:sizes(name),
        color:colors(name)
      `)
      .lte('stock_sound', LOW_STOCK_THRESHOLD)
      .gt('stock_sound', 0);

    if (ignoredProductIds.length > 0) {
      lowStockQuery = lowStockQuery.not('product_id', 'in', `(${ignoredProductIds.join(',')})`);
    }
    
    const { data: low_stock_items, error: lowStockError } = await lowStockQuery
      .order('stock_sound', { ascending: true })
      .limit(5);

    if (lowStockError) {
      console.error("Error fetching low stock items:", lowStockError);
      throw lowStockError;
    }

    // Çok satan ürün varyantları
    const { data: best_selling_items_raw } = await supabaseAdmin
      .rpc('get_best_selling_variants', { limit_count: 5 });

    let best_selling_items = best_selling_items_raw || [];

    // Eğer RPC'den gelen veride product_image yoksa veya eksikse, buradan tamamla
    if (best_selling_items.length > 0 && best_selling_items.some(item => !item.product_image)) {
      const productIds = best_selling_items.map(item => item.product_id).filter(id => id);

      if (productIds.length > 0) {
        const { data: products, error: productsError } = await supabaseAdmin
          .from('products')
          .select('id, image_url')
          .in('id', productIds);

        if (productsError) throw productsError;

        const productImages = new Map(products.map(p => [p.id, p.image_url]));
        
        best_selling_items = best_selling_items.map(item => ({
          ...item,
          product_image: item.product_image || productImages.get(item.product_id)
        }));
      }
    }

    // --- SON 30 GÜNLÜK SATIŞ VERİSİ (ÇİZGİ GRAFİĞİ İÇİN) --- //
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    const { data: dailySalesData, error: dailySalesError } = await supabaseAdmin
      .from('sales')
      .select('sale_date, quantity')
      .gte('sale_date', thirtyDaysAgoISO);

    if (dailySalesError) throw dailySalesError;

    // Günlük satışları özetle
    const salesSummary: { [key: string]: number } = {};
    dailySalesData.forEach(sale => {
      const saleDate = sale.sale_date.split('T')[0];
      salesSummary[saleDate] = (salesSummary[saleDate] || 0) + sale.quantity;
    });

    // Son 30 gün için tarih aralığını doldur ve eksik günler için 0 ata
    const last30DaysSales = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const formattedDate = d.toISOString().split('T')[0];
      last30DaysSales.push({
        date: formattedDate,
        sales: salesSummary[formattedDate] || 0
      });
    }

    // Sağlam stok hesaplaması
    const total_sound_stock = total_product_stock - total_defective_stock;

    res.status(200).json({
      total_unique_products,
      total_product_stock,
      total_sales_quantity,
      total_defective_stock,
      total_sound_stock,
      low_stock_items,
      best_selling_items,
      daily_sales_data: last30DaysSales
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
