import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      // Tüm satışları listele (varyant ve ürün bilgileriyle birlikte)
      try {
        const { startDate, endDate, page = '1', limit = '10', defectStatus = 'all' } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const offset = (pageNum - 1) * limitNum;

        let query;

        if (defectStatus !== 'all') {
          query = supabaseAdmin
            .from('sales')
            .select(`
              id,
              quantity,
              sale_date,
              variant:product_variants!inner (
                id,
                is_defective,
                product:products(name),
                size:sizes(name),
                color:colors(name)
              )
            `, { count: 'exact' })
            .eq('variant.is_defective', defectStatus === 'defective');
        } else {
          query = supabaseAdmin
            .from('sales')
            .select(`
              id,
              quantity,
              sale_date,
              variant:product_variants (
                id,
                is_defective,
                product:products(name),
                size:sizes(name),
                color:colors(name)
              )
            `, { count: 'exact' });
        }

        if (startDate) {
          query = query.gte('sale_date', `${startDate}T00:00:00Z`);
        }
        if (endDate) {
          query = query.lte('sale_date', `${endDate}T23:59:59Z`);
        }

        const { data, error, count } = await query
          .order('sale_date', { ascending: false })
          .range(offset, offset + limitNum - 1);

        if (error) throw error;
        
        res.status(200).json({ sales: data, totalCount: count });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'POST':
      // Yeni bir satış oluştur (veritabanı fonksiyonunu kullanarak)
      try {
        const { variant_id, quantity } = req.body;
        if (!variant_id || !quantity) {
          return res.status(400).json({ error: 'Variant ID and quantity are required' });
        }
        if (quantity <= 0) {
          return res.status(400).json({ error: 'Quantity must be greater than zero' });
        }

        // 'create_sale_and_update_stock' adlı veritabanı fonksiyonunu çağırıyoruz
        const { data, error } = await supabaseAdmin.rpc('create_sale_and_update_stock', {
          p_variant_id: variant_id,
          p_quantity: quantity,
        });

        if (error) throw error;

        res.status(200).json({ 
          message: 'Sale created successfully',
          remaining_stock: data 
        });

      } catch (error: any) {
        // Fonksiyondan gelen 'RAISE EXCEPTION' hatalarını yakala
        if (error.message.includes('Not enough stock')) {
          return res.status(409).json({ error: 'Not enough stock for this variant.' });
        }
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
