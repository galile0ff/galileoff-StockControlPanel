import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      await handleGet(req, res);
      break;
    case 'POST':
      await handlePost(req, res);
      break;
    case 'PUT':
      await handlePut(req, res);
      break;
    case 'DELETE':
      await handleDelete(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        // Supabase'de 'product_variants' tablosunda 'products' tablosuna
        // 'ON DELETE CASCADE' ayarı olduğunu varsayıyoruz. 
        // Bu sayede ürün silindiğinde ilişkili tüm varyantlar da otomatik silinir.
        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}


async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, name, description, category_id } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'Product ID and name are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        name,
        description,
        category_id: category_id || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });

    return res.status(200).json(data);

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (id) {
      // Belirli bir ürünü ve tüm varyantlarını getir
      const { data: product, error } = await supabaseAdmin
        .from('products')
        .select(`
          id,
          name,
          description,
          created_at,
          category:categories(id, name),
          product_variants (
            id,
            stock,
            price,
            image_url,
            size:sizes(id, name),
            color:colors(id, name, hex_code)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!product) return res.status(404).json({ error: 'Product not found' });
      
      return res.status(200).json(product);

    } else {
      // Tüm ürünlerin listesini getir
      const { data, error } = await supabaseAdmin
        .from('products')
        .select(`
          id,
          name,
          description,
          category:categories(id, name)
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      return res.status(200).json(data);
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, description, category_id } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({ error: 'Product name and category are required' });
    }

    // Şimdilik sadece ana ürün oluşturuluyor. 
    // Varyantlar (stok, beden, renk) ayrı bir işlemle eklenecek.
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([
        { name, description, category_id },
      ])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
