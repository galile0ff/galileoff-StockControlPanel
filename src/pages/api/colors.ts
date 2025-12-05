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
      try {
        const { data, error } = await supabaseAdmin
          .from('colors')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'POST':
      try {
        const { name, hex_code } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Renk adı zorunludur' });
        }

        const { data, error } = await supabaseAdmin
          .from('colors')
          .insert([{ name, hex_code }])
          .select()
          .single();

        if (error) throw error;
        res.status(201).json(data);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id, name, hex_code } = req.body;
        if (!id || !name) {
          return res.status(400).json({ error: 'Renk ID ve adı zorunludur' });
        }

        const { data, error } = await supabaseAdmin
          .from('colors')
          .update({ name, hex_code })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Renk bulunamadı' });

        res.status(200).json(data);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

          case 'DELETE':
            try {
              const { id } = req.body;
              if (!id) {
                return res.status(400).json({ error: 'Renk ID zorunludur' });
              }
      
              const { error } = await supabaseAdmin
                .from('colors')
                .delete()
                .eq('id', id);
      
              if (error) throw error;
      
              res.status(200).json({ message: 'Renk başarıyla silindi' });
            } catch (error: any) {
              if (error.code === '23503') {
                return res.status(409).json({ 
                  error: 'Bu renk, bir veya daha fazla ürün tarafından kullanıldığı için silinemez.' 
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
