import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Sunucu tarafı, tam yetkili Supabase istemcisi
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      // Tüm bedenleri getir
      try {
        const { data, error } = await supabaseAdmin
          .from('sizes')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'POST':
      // Yeni bir beden oluştur
      try {
        const { name } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Size name is required' });
        }

        const { data, error } = await supabaseAdmin
          .from('sizes')
          .insert([{ name }])
          .select()
          .single();

        if (error) throw error;
        res.status(201).json(data);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      // Mevcut bir bedeni güncelle
      try {
        const { id, name } = req.body;
        if (!id || !name) {
          return res.status(400).json({ error: 'Size ID and name are required' });
        }

        const { data, error } = await supabaseAdmin
          .from('sizes')
          .update({ name })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Size not found' });

        res.status(200).json(data);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

          case 'DELETE':
            // Bir bedeni sil
            try {
              const { id } = req.body;
              if (!id) {
                return res.status(400).json({ error: 'Size ID is required' });
              }
      
              const { error } = await supabaseAdmin
                .from('sizes')
                .delete()
                .eq('id', id);
      
              if (error) throw error;
      
              res.status(200).json({ message: 'Size deleted successfully' });
            } catch (error: any) {
              // Foreign key violation
              if (error.code === '23503') {
                return res.status(409).json({ 
                  error: 'Bu beden, bir veya daha fazla ürün tarafından kullanıldığı için silinemez.' 
                });
              }
              res.status(500).json({ error: error.message || 'Bir sunucu hatası oluştu.' });
            }
            break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
