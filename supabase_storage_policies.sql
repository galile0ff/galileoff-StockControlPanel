-- storage.buckets tablosuna, yeni bir 'product-images' bucket ekleyin.
-- Eğer bu bucket zaten varsa, bu komutu çalıştırmayın.
-- Genellikle bucket'lar Supabase Dashboard üzerinden oluşturulur.
-- Bu komut, bucket'a erişim izinlerini ayarlamak içindir.

-- 1. 'product-images' bucket için public okuma izni veren politika oluştur.
-- Bu, herkesin bu bucket'taki dosyalara erişmesine izin verir.
CREATE POLICY "Public access to product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 2. 'product-images' bucket'ına dosya yükleme izni veren politika oluştur.
-- Bu, kimliği doğrulanmış kullanıcıların dosya yüklemesine izin verir.
-- Eğer sadece adminlerin yüklemesini isterseniz, 'auth.uid() IS NOT NULL' kısmını değiştirmeniz gerekir.
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- 3. Opsiyonel: 'product-images' bucket'ına dosya güncelleme izni veren politika oluştur.
CREATE POLICY "Authenticated users can update their own product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'product-images' AND auth.uid() = owner);

-- 4. Opsiyonel: 'product-images' bucket'ından dosya silme izni veren politika oluştur.
CREATE POLICY "Authenticated users can delete their own product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.uid() = owner);

-- ÖNEMLİ NOT:
-- Bu politikaları uygulamadan önce, Supabase Dashboard'daki "Storage" bölümünden
-- "product-images" adında bir bucket oluşturmanız GEREKMEKTEDİR.
-- Bu SQL komutları SADECE oluşturulmuş bir bucket'ın RLS (Row Level Security)
-- ayarlarını yapar, bucket'ı KENDİSİ oluşturmaz.
