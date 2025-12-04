import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      // Yeni bir ürün varyantı ekle
      try {
        const { product_id, size_id, color_id, stock, image_url, is_defective } = req.body;
        if (!product_id || !size_id || !color_id || stock === undefined) {
          return res.status(400).json({ error: 'Ürün ID, beden, renk ve stok zorunludur.' });
        }

        const { data, error } = await supabaseAdmin
          .from('product_variants')
          .insert([{ product_id, size_id, color_id, stock, image_url, is_defective }])
          .select()
          .single();

        if (error) {
          // '23505' unique constraint violation (aynı ürün, beden, renk kombinasyonu zaten var)
          if (error.code === '23505') {
            return res.status(409).json({ error: 'Bu ürün için aynı beden ve renk kombinasyonuna sahip bir varyant zaten mevcut.' });
          }
          throw error;
        }
        res.status(201).json(data);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      // Mevcut bir ürün varyantını güncelle (stok/resim)
      try {
        const { id, stock, image_url, is_defective } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Varyant ID zorunludur' });
        }

        const updateData: { stock?: number, image_url?: string, is_defective?: boolean } = {};
        if (stock !== undefined) updateData.stock = stock;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (is_defective !== undefined) updateData.is_defective = is_defective;
        
        const { data, error } = await supabaseAdmin
          .from('product_variants')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Varyant bulunamadı' });

        res.status(200).json(data);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'DELETE':
      // Bir ürün varyantını sil
      try {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Varyant ID zorunludur' });
        }

        const { error, count } = await supabaseAdmin
          .from('product_variants')
          .delete({ count: 'exact' })
          .eq('id', id);

        if (error) throw error;
        if (count === 0) return res.status(404).json({ error: 'Varyant bulunamadı' });

        res.status(200).json({ message: 'Varyant başarıyla silindi' });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
