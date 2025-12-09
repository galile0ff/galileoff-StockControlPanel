# galileoff-StockControlPanel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgalile0ff%2Fgalileoff-StockControlPanel)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/galile0ff/galileoff-StockControlPanel?style=social)](https://github.com/galile0ff/galileoff-StockControlPanel/stargazers)

**galileoff Giyim Stok Takip Paneli**
<br>
Modern ve hızlı bir web paneli ile ürünlerini, stoklarını, beden ve renk seçeneklerini yönet.
<br>
Dashboard üzerinden kritik stok seviyelerini ve satış performansını anlık takip et.

---

## 🚀 Özellikler

- **🛍 Ürün Yönetimi:** Fotoğraf, ad, kategori, beden, renk ve stok girişi ile detaylı ürün yönetimi.
- **📦 Dinamik Varyasyonlar:** Kategori, beden ve renk seçeneklerini sınırsız ekle, düzenle ve sil.
- **📊 Akıllı Dashboard:**
  - Kritik stok uyarıları (Stoku azalan ürünler).
  - Çok satanlar listesi.
  - Toplam envanter değeri ve ürün adetleri.
- **👤 Kullanıcı Yönetimi:** Admin yetkilendirme ve güvenli giriş sistemi.
- **🎨 Modern UI:** Minimalist tasarım, tamamen responsive ve mobil uyumlu.
- **🌙 Açık ve Koyu Tema Desteği:** Kullanıcı tercihine göre arayüz temasını değiştirme özelliği.

---

## 💻 Teknolojiler

Proje, performans ve ölçeklenebilirlik için en güncel teknolojilerle geliştirilmiştir.

| Katman | Teknoloji | Badge |
| :--- | :--- | :--- |
| **Frontend** | Next.js + React + TypeScript | ![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white) |
| **Backend** | Next.js API Routes | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) |
| **Veritabanı** | Supabase (PostgreSQL + Auth) | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white) |
| **Data Fetch** | SWR (Stale-While-Revalidate) | ![SWR](https://img.shields.io/badge/SWR-000000?style=flat&logo=vercel&logoColor=white) |
| **Hosting** | Vercel | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white) |

---

## ⚡ Başlarken

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/galile0ff/galileoff-StockControlPanel.git
cd galileoff-StockControlPanel
```

### 2. Supabase Ayarları

Bu proje, veritabanı ve kimlik doğrulama için **Supabase** kullanır.

-   [Supabase](https://supabase.com/)'e kaydolun ve yeni bir proje oluşturun.
-   Proje kontrol panelinizdeki **SQL Editor** bölümüne gidin.
-   `supabase_schema.sql` dosyasının içeriğini kopyalayıp editörde çalıştırarak veritabanı şemanızı oluşturun.
-   **Settings > API** bölümünden `Project URL` ve `anon public` anahtarınızı alın.

### 3. Ortam Değişkenlerini Ayarlayın

Proje kök dizininde `.env.local` adında bir dosya oluşturun ve Supabase'den aldığınız bilgileri içine ekleyin.

```bash
NEXT_PUBLIC_SUPABASE_URL=SUPABASE_PROJE_URL'İNİZ
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY'İNİZ
```

### 4. Bağımlılıkları Yükleyin ve Çalıştırın

```bash
npm install
npm run dev
```

Uygulama artık [http://localhost:3000](http://localhost:3000) adresinde çalışıyor olacaktır.

---

## 🗂 Proje Yapısı

```text
galileoff-StockControlPanel/
├── components/           # UI Bileşenleri (Formlar, Listeler, Layout)
│   ├── CategoryForm.tsx
│   ├── ProductList.tsx
│   ├── SalesList.tsx
│   └── ...
├── lib/                  # Yardımcı kütüphaneler
│   └── supabaseClient.ts # Supabase bağlantı ayarları
├── pages/                # Next.js Sayfaları ve Route yapısı
│   ├── index.tsx         # Dashboard
│   ├── api/              # Backend API Endpoint'leri
│   │   ├── products.ts
│   │   ├── sales.ts
│   │   └── ...
│   ├── manage/           # Yönetim sayfaları (Ekle/Düzenle)
│   └── sales.tsx
└── styles/               # CSS Modülleri ve Global stiller
```
---

## 📄 API Dokümantasyonu

Uygulama, veri yönetimi için aşağıdaki RESTful API rotalarını kullanır.

### 🛍 Ürünler (Products)

| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Tüm ürünleri listeler. |
| `POST` | `/api/products` | Yeni bir ürün oluşturur. |
| `PUT` | `/api/products` | Ürün stok veya bilgilerini günceller. |
| `DELETE` | `/api/products` | Bir ürünü siler. |
| `GET` | `/api/product-variants` | Ürüne ait varyantları (beden/renk) getirir. |

### 🏷 Kategoriler ve Varyasyonlar

| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| `GET` | `/api/categories` | Mevcut kategorileri listeler. |
| `POST` | `/api/categories` | Yeni kategori ekler. |
| `GET` | `/api/colors` | Renk seçeneklerini listeler. |
| `POST` | `/api/colors` | Yeni renk tanımlar. |
| `GET` | `/api/sizes` | Beden seçeneklerini listeler. |

### 📈 Satış ve İstatistikler

| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| `GET` | `/api/sales` | Geçmiş satış kayıtlarını listeler. |
| `POST` | `/api/sales` | Yeni bir satış işlemi kaydeder. |
| `GET` | `/api/dashboard-stats` | Dashboard için özet verileri (toplam stok, ciro vb.) getirir. |

---

## 🎨 UI Mockup’ları

Arayüz tasarımı minimal ve kullanıcı odaklıdır.
*(Ekran görüntüleri buraya gelecek)*

| Dashboard | Ürün Ekleme |
| :---: | :---: |
| ![Dashboard Screenshot](https://via.placeholder.com/600x400?text=Dashboard+Ekrani) | ![Add Product Screenshot](https://via.placeholder.com/600x400?text=Urun+Ekleme+Ekrani) |

---

## ☕ Bana Kahve Ismarla

Bu proje işine yaradıysa ve geliştirmemi desteklemek istiyorsan, bana bir kahve ısmarlayabilirsin! Ayrıca projeyi beğendiysen **GitHub'da yıldız (⭐)** vererek de destek olabilirsin. Desteklerin projeyi daha ileri taşımam için motive ediyor. 🚀

[![Buy Me a Coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=☕&slug=galileoff&button_colour=FF5F5F&font_colour=ffffff&font_family=Bree&outline_colour=000000&coffee_colour=FFDD00)](https://www.buymeacoffee.com/galileoff)
<div>
  <a href="https://github.com/galile0ff/galileoff-StockControlPanel/stargazers">
    <img src="https://img.shields.io/github/stars/galile0ff/galileoff-StockControlPanel?style=social&label=Star&height=40" alt="GitHub Star" height="40" />
  </a>
</div>

---

## 📝 Lisans

Bu proje [MIT](LICENSE) lisansı ile lisanslanmıştır.