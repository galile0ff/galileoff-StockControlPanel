galileoff-StockControlPanel

Premium Giyim Stok Takip Paneli – modern ve hızlı bir web paneli ile ürünlerini, stoklarını, beden ve renk seçeneklerini yönet. Dashboard’da stoku azalan ve çok satan ürünleri anlık olarak görüntüle.

🚀 Özellikler

Ürün Yönetimi: Fotoğraf, ad, kategori, beden, renk, stok girişi

Kategori / Beden / Renk Yönetimi: Tüm seçenekleri dinamik olarak ekle, düzenle ve sil

Dashboard:

Stoku azalan ürünler

Çok satan ürünler

Toplam ürün adedi ve istatistikler

Kullanıcı Yönetimi: Admin kullanıcı ekleme ve yetkilendirme

Veri Tabanı: Supabase (PostgreSQL)

Frontend: Next.js + React + TypeScript

Backend: Next.js API Routes (serverless functions)

Host: Vercel – hem frontend hem backend tek projede

Hızlı ve Modern UI – minimal, responsive ve performans odaklı

📦 Kurulum
# Projeyi klonla
git clone https://github.com/username/galileoff-StockControlPanel.git
cd galileoff-StockControlPanel

# Paketleri yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev


.env.local dosyanı oluştur ve Supabase bilgilerini ekle:

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

🛠 Teknolojiler

Next.js + React + TypeScript

Supabase (DB ve storage)

Vercel (host ve serverless functions)

SWR (data fetching)

⚡ Kullanım

index.tsx → Dashboard

add-product.tsx → Ürün ekleme formu

pages/api/ → Backend CRUD API endpoint’leri (products, categories, sizes, colors, auth)

src/lib/supabaseClient.ts → Supabase client bağlantısı

Frontend, backend üzerinden API’yi çağırır; veri güvenliği ve tip güvenliği sağlar.

🎨 UI Mockup’ları




Not: Gerçek mockup görsellerini buraya eklenecek.

👤 Demo Kullanıcı

Demo ortamı için Supabase üzerinde test kullanıcıları oluşturabilirsin.

📄 API Dokümantasyonu
Endpoint	Açıklama
GET /api/products	Tüm ürünleri listeler
POST /api/products	Yeni ürün ekler
PUT /api/products	Ürün stok günceller
DELETE /api/products	Ürün siler
GET /api/categories	Kategorileri listeler
POST /api/categories	Yeni kategori ekler
GET /api/sizes	Bedenleri listeler
GET /api/colors	Renkleri listeler
POST /api/auth	Kullanıcı ekleme / giriş
📦 Vercel Deploy

Tek tıkla deploy, panelin hemen canlıya çıksın.

☕ Bana Kahve Al

Bu projeyi beğendiysen GitHub’da bir ⭐ bırak!

Eğer projeyi desteklemek ve geliştirilmesini sağlamak istiyorsan bana bir kahve ısmarlayabilirsin!

Her kahve, galileoff-StockControlPanel ve diğer açık kaynak projelerimi geliştirmeme yardımcı olur! 🙏
