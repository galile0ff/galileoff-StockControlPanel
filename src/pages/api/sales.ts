import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const { startDate, endDate, page = '1', limit = '10' } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const offset = (pageNum - 1) * limitNum;

        let query = supabaseAdmin
            .from('sales')
            .select(`
              id,
              quantity,
              sale_date,
              variant:product_variants (
                id,
                product:products(name),
                size:sizes(name),
                color:colors(name)
              )
            `, { count: 'exact' });

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
      try {
        const { variant_id, quantity, sale_type } = req.body;
        if (!variant_id || !quantity || !sale_type) {
          return res.status(400).json({ error: 'Varyant ID, miktar ve satış türü zorunludur' });
        }
        if (quantity <= 0) {
          return res.status(400).json({ error: 'Miktar sıfırdan büyük olmalıdır' });
        }
        if (sale_type !== 'sound' && sale_type !== 'defective') {
          return res.status(400).json({ error: 'Geçersiz satış türü' });
        }

        const { data, error } = await supabaseAdmin.rpc('create_sale_and_update_stock', {
          p_variant_id: variant_id,
          p_quantity: quantity,
          p_sale_type: sale_type
        });

        if (error) throw error;

        res.status(200).json({ 
          message: 'Satış başarıyla oluşturuldu',
          remaining_stock: data 
        });

      } catch (error: any) {
        // Fonksiyondan gelen 'RAISE EXCEPTION' hatalarını yakalamak için
        if (error.message.includes('Not enough stock')) {
          return res.status(409).json({ error: 'Bu varyant için yeterli stok yok.' });
        }
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
