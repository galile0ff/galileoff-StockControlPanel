import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      try {
        const { product_id, size_id, color_id, stock_sound, stock_defective, image_url } = req.body;
        if (!product_id || !size_id || !color_id) {
          return res.status(400).json({ error: 'Ürün ID, beden ve renk zorunludur.' });
        }

        const insertData = {
          product_id,
          size_id,
          color_id,
          stock_sound: stock_sound ?? 0,
          stock_defective: stock_defective ?? 0,
          image_url
        };

        const { data, error } = await supabaseAdmin
          .from('product_variants')
          .insert([insertData])
          .select()
          .single();

        if (error) {
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
      try {
        const { id, stock_sound, stock_defective, image_url } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Varyant ID zorunludur' });
        }

        const updateData: { stock_sound?: number, stock_defective?: number, image_url?: string } = {};
        if (stock_sound !== undefined) updateData.stock_sound = stock_sound;
        if (stock_defective !== undefined) updateData.stock_defective = stock_defective;
        if (image_url !== undefined) updateData.image_url = image_url;
        
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
