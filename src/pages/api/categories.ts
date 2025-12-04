import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Sunucu tarafında çalışacak, tam yetkili bir Supabase istemcisi oluşturuyoruz.
// Bu istemci, RLS (Row Level Security) kurallarını atlayarak işlem yapabilir.
// Asla istemci tarafı (frontend) kodunda service_role anahtarını kullanmayın!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      // Tüm kategorileri getir
      try {
        const { data, error } = await supabaseAdmin
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'POST':
      // Yeni bir kategori oluştur
      try {
        const { name } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Category name is required' });
        }

        const { data, error } = await supabaseAdmin
          .from('categories')
          .insert([{ name }])
          .select()
          .single(); // Oluşturulan veriyi geri döndür

        if (error) throw error;
        res.status(201).json(data);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      // Mevcut bir kategoriyi güncelle
      try {
        const { id, name } = req.body;
        if (!id || !name) {
          return res.status(400).json({ error: 'Category ID and name are required' });
        }

        const { data, error } = await supabaseAdmin
          .from('categories')
          .update({ name })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Category not found' });

        res.status(200).json(data);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

          case 'DELETE':
            // Bir kategoriyi sil
            try {
              const { id } = req.body;
              if (!id) {
                return res.status(400).json({ error: 'Category ID is required' });
              }
      
              const { error } = await supabaseAdmin
                .from('categories')
                .delete()
                .eq('id', id);
      
              if (error) throw error;
      
              res.status(200).json({ message: 'Category deleted successfully' });
            } catch (error: any) {
              // Foreign key violation (ilişkili veri var)
              if (error.code === '23503') {
                return res.status(409).json({ 
                  error: 'Bu kategori, bir veya daha fazla ürün tarafından kullanıldığı için silinemez.' 
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
