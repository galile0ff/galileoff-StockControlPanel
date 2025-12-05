-- Bu şema, bir giyim stok yönetimi uygulaması için veritabanı yapısını tanımlar.
-- Supabase (PostgreSQL) üzerinde çalışmak üzere tasarlanmıştır.

-- 1. KATEGORİLER TABLOSU
-- Ürünlerin ait olduğu kategorileri (T-shirt, Gömlek, Pantolon vb.) tutar.
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BEDENLER TABLOSU
-- Ürün bedenlerini (S, M, L, XL vb.) tutar.
CREATE TABLE sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RENKLER TABLOSU
-- Ürün renklerini (Kırmızı, Mavi, Siyah vb.) ve renk kodlarını tutar.
CREATE TABLE colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  hex_code TEXT, -- Opsiyonel, UI'da renkleri göstermek için kullanılabilir.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ÜRÜNLER TABLOSU (ANA ÜRÜN BİLGİLERİ)
-- Her bir ürünün ana bilgilerini (adı, açıklaması, kategorisi) tutar.
-- Beden, renk ve stok gibi değişken bilgiler `product_variants` tablosundadır.
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
  ignore_low_stock BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ÜRÜN VARYANTLARI TABLOSU
-- Bir ürünün farklı beden, renk, stok ve fiyat kombinasyonlarını tutar.
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id UUID REFERENCES sizes(id) ON DELETE RESTRICT,
  color_id UUID REFERENCES colors(id) ON DELETE RESTRICT,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT, -- Varyanta özel resim
  is_defective BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, size_id, color_id) -- Bir ürünün aynı beden ve renkteki varyantı benzersiz olmalıdır.
);

-- 6. SATIŞLAR TABLOSU
-- Yapılan her satışı kaydeder. Hangi varyantın, ne kadar ve ne zaman satıldığını tutar.
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  sale_date TIMESTAMPTZ DEFAULT now()
);

-- 7. KULLANICI PROFİLLERİ TABLOSU
-- Supabase'in kendi `auth.users` tablosunu uygulama özelindeki rollerle (admin, viewer) genişletir.
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer'))
);


-- GÜVENLİK (ROW LEVEL SECURITY - RLS)
-- Tablolar için Satır Seviyesi Güvenliği'ni (RLS) aktifleştiriyoruz.
-- Bu, varsayılan olarak tüm verilere erişimi engeller. Erişim sadece politikalarla (policy) sağlanır.
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Örnek RLS Politikaları
-- Bu politikalar, herkesin verileri okumasına izin verirken,
-- sadece 'admin' rolüne sahip kullanıcıların veri eklemesine/değiştirmesine/silmesine olanak tanır.
-- Gerçek bir uygulamada bu kuralları ihtiyacınıza göre daha da sıkılaştırabilirsiniz.

-- Kategoriler için politikalar
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow admin to manage categories" ON categories FOR ALL USING (auth.role() = 'service_role' OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Bedenler için politikalar
CREATE POLICY "Allow public read access to sizes" ON sizes FOR SELECT USING (true);
CREATE POLICY "Allow admin to manage sizes" ON sizes FOR ALL USING (auth.role() = 'service_role' OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Renkler için politikalar
CREATE POLICY "Allow public read access to colors" ON colors FOR SELECT USING (true);
CREATE POLICY "Allow admin to manage colors" ON colors FOR ALL USING (auth.role() = 'service_role' OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Ürünler için politikalar
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow admin to manage products" ON products FOR ALL USING (auth.role() = 'service_role' OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Ürün Varyantları için politikalar
CREATE POLICY "Allow public read access to product variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Allow admin to manage product variants" ON product_variants FOR ALL USING (auth.role() = 'service_role' OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Satışlar için politikalar (Sadece adminler yönetebilir)
CREATE POLICY "Allow admin to manage sales" ON sales FOR ALL USING (auth.role() = 'service_role' OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Profiller için politikalar (Herkes kendi profilini yönetir, admin herkesi)
CREATE POLICY "Allow users to view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow admin to manage all profiles" ON profiles FOR ALL USING (auth.role() = 'service_role' OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Not: Ürün resimleri için Supabase Storage'da 'product_images' adında bir bucket oluşturmanız gerekmektedir.
-- Bu işlemi Supabase arayüzündeki 'Storage' bölümünden yapabilirsiniz.

-- SATIŞ İŞLEMİ İÇİN VERİTABANI FONKSİYONU (RPC)
-- Bu fonksiyon, bir satışı kaydederken aynı anda stok düşürme işlemini tek bir işlemde (transaction) birleştirir.
-- Bu, veri tutarlılığını garanti altına alır.
CREATE OR REPLACE FUNCTION create_sale_and_update_stock(
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS INTEGER -- Kalan yeni stoku döndürür
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock INTEGER;
  new_stock INTEGER;
BEGIN
  -- 1. İşlem anındaki stoku al ve satırı kilitle (FOR UPDATE)
  SELECT stock INTO current_stock
  FROM public.product_variants
  WHERE id = p_variant_id
  FOR UPDATE;

  -- 2. Yeterli stok olup olmadığını kontrol et
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Variant with ID % not found', p_variant_id;
  END IF;

  IF current_stock < p_quantity THEN
    RAISE EXCEPTION 'Not enough stock for variant %. Available: %, Required: %', p_variant_id, current_stock, p_quantity;
  END IF;

  -- 3. Stoku güncelle
  new_stock := current_stock - p_quantity;
  UPDATE public.product_variants
  SET stock = new_stock
  WHERE id = p_variant_id;

  -- 4. Satışlar tablosuna kaydı ekle
  INSERT INTO public.sales (variant_id, quantity)
  VALUES (p_variant_id, p_quantity);

  -- 5. Kalan stoku döndür
  RETURN new_stock;
END;
$$;

-- EN ÇOK SATAN ÜRÜNLERİ GETİRMEK İÇİN VERİTABANI FONKSİYONU (RPC)
-- Bu fonksiyon, satış verilerini analiz ederek en çok satan ürün varyantlarını listeler.
CREATE OR REPLACE FUNCTION get_best_selling_variants(limit_count INTEGER)
RETURNS TABLE (
  variant_id UUID,
  product_id UUID, 
  product_name TEXT,
  product_image TEXT, 
  size_name TEXT,
  color_name TEXT,
  total_quantity_sold BIGINT
)
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    pv.id AS variant_id,
    p.id as product_id, 
    p.name AS product_name,
    p.image_url as product_image,
    s.name AS size_name,
    c.name AS color_name,
    SUM(sa.quantity) AS total_quantity_sold
  FROM sales sa
  JOIN product_variants pv ON sa.variant_id = pv.id
  JOIN products p ON pv.product_id = p.id
  JOIN sizes s ON pv.size_id = s.id
  JOIN colors c ON pv.color_id = c.id
  GROUP BY pv.id, p.id, p.name, p.image_url, s.name, c.name
  ORDER BY total_quantity_sold DESC
  LIMIT limit_count;
$$;
