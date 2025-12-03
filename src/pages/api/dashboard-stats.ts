import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Stoku azalan olarak kabul edilecek eşik değeri
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

    // 2. Toplam ürün (varyasyonlarla birlikte - tüm varyantların toplam stoğu)
    const { data: totalStockData, error: totalStockError } = await supabaseAdmin
      .from('product_variants')
      .select('stock')
      .neq('stock', 0); // Sadece stokta olanları dahil et

    if (totalStockError) throw totalStockError;
    const total_product_stock = totalStockData ? totalStockData.reduce((sum, variant) => sum + variant.stock, 0) : 0;

    // 3. Toplam satış (adet bazında)
    const { data: totalSalesQuantityData, error: totalSalesQuantityError } = await supabaseAdmin
      .from('sales')
      .select('quantity');

    if (totalSalesQuantityError) throw totalSalesQuantityError;
    const total_sales_quantity = totalSalesQuantityData ? totalSalesQuantityData.reduce((sum, sale) => sum + sale.quantity, 0) : 0;

    // 4. Toplam defolu ürün (adet bazında)
    const { data: defectiveStockData, error: defectiveStockError } = await supabaseAdmin
      .from('product_variants')
      .select('stock')
      .eq('is_defective', true)
      .neq('stock', 0);

    if (defectiveStockError) throw defectiveStockError;
    const total_defective_stock = defectiveStockData ? defectiveStockData.reduce((sum, variant) => sum + variant.stock, 0) : 0;

    // Düşük stoklu ürünler ve En çok satan ürün varyantları kısmı (değişmeden kalacak)
    // 2. Stoku azalan ürünler
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
        stock,
        product:products(id, name),
        size:sizes(name),
        color:colors(name)
      `)
      .lt('stock', LOW_STOCK_THRESHOLD);

    if (ignoredProductIds.length > 0) {
      for (const productId of ignoredProductIds) {
        lowStockQuery = lowStockQuery.neq('product_id', productId);
      }
    }
    
    const { data: low_stock_items, error: lowStockError } = await lowStockQuery
      .order('stock', { ascending: true })
      .limit(5);

    if (lowStockError) {
      console.error("Error fetching low stock items:", lowStockError);
      throw lowStockError;
    }

    // 3. En çok satan ürün varyantları
    const { data: best_selling_items } = await supabaseAdmin
      .rpc('get_best_selling_variants', { limit_count: 5 });

    // 4. Son 30 gündeki günlük satış toplamları (Çizgi Grafik için)
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
      const saleDate = sale.sale_date.split('T')[0]; // Sadece tarihi al (YYYY-MM-DD)
      salesSummary[saleDate] = (salesSummary[saleDate] || 0) + sale.quantity;
    });

    // Son 30 gün için tarih aralığını doldur ve eksik günler için 0 ata
    const last30DaysSales = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i)); // 29 gün öncesinden bugüne
      const formattedDate = d.toISOString().split('T')[0];
      last30DaysSales.push({
        date: formattedDate,
        sales: salesSummary[formattedDate] || 0
      });
    }

    res.status(200).json({
      total_unique_products,
      total_product_stock,
      total_sales_quantity,
      total_defective_stock,
      low_stock_items,
      best_selling_items,
      daily_sales_data: last30DaysSales
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
