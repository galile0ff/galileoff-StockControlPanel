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
              sale_type,
              variant:product_variants (
                id,
                product:products(name),
                size:sizes(name),
                color:colors(name, hex_code)
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

    case 'DELETE':
      try {
        const { saleId, variantId, saleType } = req.body;

        if (!saleId || !variantId || !saleType) {
          return res.status(400).json({ error: 'Satış ID, Varyant ID ve Satış Tipi zorunludur' });
        }

        if (saleType !== 'sound' && saleType !== 'defective') {
          return res.status(400).json({ error: 'Geçersiz Satış Tipi' });
        }
        
        // 1. Mevcut stokları al
        const { data: variant, error: fetchError } = await supabaseAdmin
          .from('product_variants')
          .select('stock_sound, stock_defective')
          .eq('id', variantId)
          .single();

        if (fetchError || !variant) {
          console.error('Varyant getirme hatası:', fetchError);
          return res.status(404).json({ error: 'İade edilecek ürün varyantı bulunamadı.' });
        }

        // 2. Satış tipine göre doğru stoğu artır
        const updatePayload = saleType === 'sound'
          ? { stock_sound: variant.stock_sound + 1 }
          : { stock_defective: variant.stock_defective + 1 };

        const { error: stockError } = await supabaseAdmin
          .from('product_variants')
          .update(updatePayload)
          .eq('id', variantId);
        
        if (stockError) {
          console.error('Stok artırma hatası:', stockError);
          throw new Error('Stok güncellenirken bir hata oluştu.');
        }

        // 3. Satışı sil
        const { error: deleteError } = await supabaseAdmin
          .from('sales')
          .delete()
          .match({ id: saleId });

        if (deleteError) {
          console.error('Satış silme hatası:', deleteError);
          // Hata durumunda, az önce yapılan stok artışını geri al
          const rollbackPayload = saleType === 'sound'
            ? { stock_sound: variant.stock_sound }
            : { stock_defective: variant.stock_defective };
          await supabaseAdmin.from('product_variants').update(rollbackPayload).eq('id', variantId);
          
          throw new Error('Satış kaydı silinirken bir hata oluştu, stok değişikliği geri alındı.');
        }
        
        res.status(200).json({ message: 'İade işlemi başarıyla tamamlandı.' });

      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
