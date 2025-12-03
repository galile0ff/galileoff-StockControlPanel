import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { IncomingForm } from 'formidable'; // Import formidable
import { promises as fs } from 'fs'; // Import file system promises

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Disable Next.js body parser for formidable to work
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
        // Manually parse the JSON body as bodyParser is disabled
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
          // Fallback for other content types if necessary, or throw an error
          return res.status(400).json({ error: 'Unsupported content type' });
        }

        if (!id) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        // 1. Get the product's image_url before deleting the product
        const { data: productData, error: fetchError } = await supabaseAdmin
            .from('products')
            .select('image_url')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        if (productData?.image_url) {
            // Extract the file path from the image_url
            // Assuming URL format like: https://[project_ref].supabase.co/storage/v1/object/public/product-images/filename.ext
            const fullPathInBucket = productData.image_url.split('/public/product-images/')[1]; // bucket içindeki yol, örn: product_images/1764784111927.jpg

            if (fullPathInBucket) {
                const { error: deleteImageError } = await supabaseAdmin.storage
                    .from('product-images')
                    .remove([fullPathInBucket]);

                if (deleteImageError) {
                    console.error('Error deleting image from storage:', deleteImageError);
                } // Eksik olan kapanış süslü parantezi buraya eklendi
            }
        } // Bu süslü parantez 'if (productData?.image_url)' bloğunu kapatıyor

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
    const ignore_low_stock = ignore_low_stock_str === 'true'; // Convert string to boolean

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!id || !name) {
      return res.status(400).json({ error: 'Product ID and name are required' });
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
      const filePath = `product_images/${fileName}`; // Görselleri product_images klasörüne kaydet

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(filePath, fileContent, {
          contentType: imageFile.mimetype || 'image/jpeg',
          upsert: true, // Upsert to overwrite if exists (though file name is unique)
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error('Image upload failed');
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
      updateData.image_url = imageUrl;
    }
    // If no new image is provided, and imageFile is not present in form,
    // we don't change the existing image_url.
    // If the user wants to remove an image, a separate mechanism would be needed.


    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });

    return res.status(200).json(data);

  } catch (error: any) {
    console.error('API Error in handlePut:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
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
            if (!product) return res.status(404).json({ error: 'Product not found' });
            
            let isLowStock = false;
            if (!product.ignore_low_stock) {
                isLowStock = product.product_variants.some(variant => variant.stock <= 10);
            }
            
            return res.status(200).json({ ...product, is_low_stock: isLowStock });
    
          } else {
            // Tüm ürünlerin listesini getir (varyantları ile birlikte)
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
    
            const productsWithLowStockStatus = data.map(product => {
                let isLowStock = false;
                if (!product.ignore_low_stock) {
                    isLowStock = product.product_variants.some(variant => variant.stock <= 10);
                }
                return { ...product, is_low_stock: isLowStock };
            });
    
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
      return res.status(400).json({ error: 'Product name and category are required' });
    }

    let imageUrl: string | null = null;

    if (imageFile) {
      const fileContent = await fs.readFile(imageFile.filepath);
      const fileExt = imageFile.originalFilename?.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `product_images/${fileName}`; // Görselleri product_images klasörüne kaydet

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('product-images') // Ensure you have a bucket named 'product-images'
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
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

