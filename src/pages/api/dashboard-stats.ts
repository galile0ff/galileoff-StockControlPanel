import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Stoku azalan olarak kabul edilecek eşik değeri
const LOW_STOCK_THRESHOLD = 10;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // 1. Toplam ürün, kategori, renk ve beden sayısı
    const { count: product_count } = await supabaseAdmin.from('products').select('*', { count: 'exact', head: true });
    const { count: category_count } = await supabaseAdmin.from('categories').select('*', { count: 'exact', head: true });
    const { count: color_count } = await supabaseAdmin.from('colors').select('*', { count: 'exact', head: true });
    const { count: size_count } = await supabaseAdmin.from('sizes').select('*', { count: 'exact', head: true });

    // 2. Stoku azalan ürünler
    const { data: low_stock_items } = await supabaseAdmin
      .from('product_variants')
      .select(`
        id,
        stock,
        product:products(name),
        size:sizes(name),
        color:colors(name)
      `)
      .lt('stock', LOW_STOCK_THRESHOLD)
      .order('stock', { ascending: true })
      .limit(5);

    // 3. En çok satan ürün varyantları
    const { data: best_selling_items } = await supabaseAdmin
      .rpc('get_best_selling_variants', { limit_count: 5 });


    res.status(200).json({
      product_count,
      category_count,
      color_count,
      size_count,
      low_stock_items,
      best_selling_items
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
