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
        const { product_id, size_id, color_id, stock, price, image_url } = req.body;
        if (!product_id || !size_id || !color_id || stock === undefined || price === undefined) {
          return res.status(400).json({ error: 'Product ID, size, color, stock, and price are required.' });
        }

        const { data, error } = await supabaseAdmin
          .from('product_variants')
          .insert([{ product_id, size_id, color_id, stock, price, image_url }])
          .select()
          .single();

        if (error) {
          // '23505' unique constraint violation (aynı ürün, beden, renk kombinasyonu zaten var)
          if (error.code === '23505') {
            return res.status(409).json({ error: 'Bu boyut ve renk zaten var, yeni bir şey sanma.' });
          }
          throw error;
        }
        res.status(201).json(data);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      // Mevcut bir ürün varyantını güncelle (stok/fiyat/resim)
      try {
        const { id, stock, price, image_url } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Variant ID is required' });
        }

        const updateData: { stock?: number, price?: number, image_url?: string } = {};
        if (stock !== undefined) updateData.stock = stock;
        if (price !== undefined) updateData.price = price;
        if (image_url !== undefined) updateData.image_url = image_url;
        
        const { data, error } = await supabaseAdmin
          .from('product_variants')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Variant not found' });

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
          return res.status(400).json({ error: 'Variant ID is required' });
        }

        const { error, count } = await supabaseAdmin
          .from('product_variants')
          .delete({ count: 'exact' })
          .eq('id', id);

        if (error) throw error;
        if (count === 0) return res.status(404).json({ error: 'Variant not found' });

        res.status(200).json({ message: 'Variant deleted successfully' });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
