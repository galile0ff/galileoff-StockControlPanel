import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// !!formidable'ın çalışması için Next.js body parser'ını devre dışı bırak
export const config = {
  api: {
    bodyParser: false,
  },
};

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
        // bodyParser devre dışı olduğundan JSON gövdesini manuel olarak ayrıştır
        let id: string;
        if (req.headers['content-type'] === 'application/json') {
          const body = await new Promise<string>((resolve) => {
            let data = '';
            req.on('data', (chunk) => {
              data += chunk;
            });
            req.on('end', () => {
              resolve(data);
            });
          });
          id = JSON.parse(body).id;
        } else {
          return res.status(400).json({ error: 'Desteklenmeyen içerik türü' });
        }

        if (!id) {
            return res.status(400).json({ error: 'Ürün ID zorunludur' });
        }

        // 1. Ürünü silmeden önce ürünün resim URL'sini al
        const { data: productData, error: fetchError } = await supabaseAdmin
            .from('products')
            .select('image_url')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        if (productData?.image_url) {
            // Resim URL'sinden dosya yolunu çıkar
            // URL formatının şu şekilde olduğunu varsayıyorum: https://[proje_ref].supabase.co/storage/v1/object/public/product-images/dosyaadi.uzanti
            const fullPathInBucket = productData.image_url.split('/public/product-images/')[1]; // bucket içindeki yol, örn: product_images/1764784111927.jpg

            if (fullPathInBucket) {
                const { error: deleteImageError } = await supabaseAdmin.storage
                    .from('product-images')
                    .remove([fullPathInBucket]);

                if (deleteImageError) {
                    console.error('Error deleting image from storage:', deleteImageError);
                } 
            }
        }

        // Supabase'de 'product_variants' tablosunda 'products' tablosuna
        // 'ON DELETE CASCADE' ayarı olduğunu varsayıyorum.
        // Bu sayede ürün silindiğinde ilişkili tüm varyantlar da otomatik siliniyo.
        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.status(200).json({ message: 'Ürün başarıyla silindi' });
    } catch (error: any) {
        console.error('API Error in handleDelete:', error);
        return res.status(500).json({ error: error.message });
    }
}


async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm();

  try {
    const { fields, files } = await new Promise<{ fields: any, files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const id = Array.isArray(fields.id) ? fields.id[0] : fields.id;
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const category_id = Array.isArray(fields.category_id) ? fields.category_id[0] : fields.category_id;
    const ignore_low_stock_str = Array.isArray(fields.ignore_low_stock) ? fields.ignore_low_stock[0] : fields.ignore_low_stock;
    const ignore_low_stock = ignore_low_stock_str === 'true';

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!id || !name) {
      return res.status(400).json({ error: 'Ürün ID ve adı zorunludur' });
    }

    const updateData: {
      name: string;
      description: string;
      category_id: string | null;
      ignore_low_stock?: boolean;
      image_url?: string | null;
    } = {
      name,
      description,
      category_id: category_id || null,
    };

    if (typeof ignore_low_stock === 'boolean') {
      updateData.ignore_low_stock = ignore_low_stock;
    }

    let imageUrl: string | null = null;

    if (imageFile) {
      const fileContent = await fs.readFile(imageFile.filepath);
      const fileExt = imageFile.originalFilename?.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `product_images/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(filePath, fileContent, {
          contentType: imageFile.mimetype || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error('Görsel yüklemesi başarısız oldu');
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
      updateData.image_url = imageUrl;
    }
    
    // Yeni bir görsel sağlanmazsa, mevcut resim URL'si değiştirilmez.
    // Kullanıcının bir resmi kaldırmasını sağlamak için ayrı bir mekanizma gerekir.
    // Bu mekanizmaya bu projede yer verilmemiştir.

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Ürün bulunamadı' });

    return res.status(200).json(data);

  } catch (error: any) {
    console.error('API Error in handlePut:', error);
    return res.status(500).json({ error: error.message || 'Sunucu Hatası' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, show } = req.query;

          if (id) {
            const { data: product, error } = await supabaseAdmin
              .from('products')
              .select(`
                id,
                name,
                description,
                created_at,
                image_url,
                ignore_low_stock,
                category:categories(id, name),
                product_variants (
                  id,
                  stock,
                  image_url,
                  is_defective,
                  size:sizes(id, name),
                  color:colors(id, name, hex_code)
                )
              `)
              .eq('id', id)
              .single();
            if (error) throw error;
            if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
            
            let isLowStock = false;
            if (!product.ignore_low_stock) {
                isLowStock = product.product_variants.some(variant => variant.stock <= 1);
            }
            
            return res.status(200).json({ ...product, is_low_stock: isLowStock });
    
          } else {
            const { data, error } = await supabaseAdmin
              .from('products')
              .select(`
                id,
                name,
                description,
                created_at,
                image_url,
                ignore_low_stock,
                category:categories(id, name),
                product_variants (
                  id,
                  stock,
                  image_url,
                  is_defective,
                  size:sizes(id, name),
                  color:colors(id, name, hex_code)
                )
              `)
              .order('name', { ascending: true });
    
            if (error) throw error;
    
            let productsWithLowStockStatus = data.map(product => {
                let isLowStock = false;
                if (!product.ignore_low_stock) {
                    isLowStock = product.product_variants.some(variant => variant.stock <= 1);
                }
                return { ...product, is_low_stock: isLowStock };
            });

            if (show === 'critical') {
              productsWithLowStockStatus = productsWithLowStockStatus.filter(p => p.is_low_stock);
            }
    
            return res.status(200).json(productsWithLowStockStatus);
          }  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm();

  try {
    const { fields, files } = await new Promise<{ fields: any, files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const category_id = Array.isArray(fields.category_id) ? fields.category_id[0] : fields.category_id;
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!name || !category_id) {
      return res.status(400).json({ error: 'Ürün adı ve kategorisi zorunludur' });
    }

    let imageUrl: string | null = null;

    if (imageFile) {
      const fileContent = await fs.readFile(imageFile.filepath);
      const fileExt = imageFile.originalFilename?.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `product_images/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(filePath, fileContent, {
          contentType: imageFile.mimetype || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([
        { name, description, category_id, image_url: imageUrl },
      ])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Sunucu Hatası' });
  }
}

