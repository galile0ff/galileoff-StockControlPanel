# galileoff-StockControlPanel

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fusername%2Fgalileoff-StockControlPanel)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/username/galileoff-StockControlPanel?style=social)](https://github.com/username/galileoff-StockControlPanel/stargazers)

**Premium Giyim Stok Takip Paneli**
<br>
Modern ve hızlı bir web paneli ile ürünlerini, stoklarını, beden ve renk seçeneklerini yönet.<br>
Dashboard üzerinden kritik stok seviyelerini ve satış performansını anlık takip et.

[Canlı Demo Görüntüle](https://galileoff-stock-control.vercel.app) </div>

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

---

## ⚡ Kullanım

Proje ayağa kalktıktan sonra temel dosya yapısı ve işlevleri aşağıdaki gibidir. Frontend, `pages/api` altındaki serverless fonksiyonlar ile haberleşir.

| Sayfa / Yol | Açıklama |
| :--- | :--- |
| `pages/index.tsx` | **Dashboard:** Özet istatistikler, azalan stoklar ve çok satanlar. |
| `pages/manage/add-product.tsx` | **Ürün Yönetimi:** Yeni ürün ekleme formu. |
| `pages/api/*` | **Backend:** Veritabanı ile konuşan CRUD endpoint'leri. |
| `lib/supabaseClient.ts` | **Config:** Supabase istemci bağlantı ayarları. |

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

### 🔐 Yetkilendirme (Auth)

| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| `POST` | `/api/auth` | Kullanıcı girişi ve token yönetimi. |

---

## 🎨 UI Mockup’ları

Arayüz tasarımı minimal ve kullanıcı odaklıdır.
*(Ekran görüntülerini buraya sürükleyip bırakarak güncelleyebilirsin)*

| Dashboard | Ürün Ekleme |
| :---: | :---: |
| ![Dashboard Screenshot](https://via.placeholder.com/600x400?text=Dashboard+Ekrani) | ![Add Product Screenshot](https://via.placeholder.com/600x400?text=Urun+Ekleme+Ekrani) |

---

## 👤 Demo Kullanıcı

Demo ortamını test etmek için Supabase panelinizden `auth` tablosuna manuel kullanıcı ekleyebilir veya aşağıdaki varsayılan yapıyı kullanabilirsiniz (Geliştirme aşaması için).

> **Not:** Üretim ortamında (Production) Supabase Auth politikalarını (RLS) aktif ettiğinizden emin olun.

---

## 📦 Vercel Deploy

Bu projeyi **Vercel** üzerine tek tıkla deploy edebilirsiniz.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fusername%2Fgalileoff-StockControlPanel)

---

## ☕ Bana Kahve Ismarla

Bu proje işine yaradıysa ve geliştirmemi desteklemek istiyorsan, bana bir kahve ısmarlayabilirsin! Desteklerin projeyi daha ileri taşımam için motive ediyor. 🚀

<a href="https://www.buymeacoffee.com/username" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" width="217">
</a>

---

## 📝 Lisans

Bu proje [MIT](LICENSE) lisansı ile lisanslanmıştır.
