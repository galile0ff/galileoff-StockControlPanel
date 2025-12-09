<div align="center">
  <img src="./public/assets/logo.svg" alt="Project Logo" width="120" />
  <h1>Galileoff Stock Control Panel</h1>
  <p>
    <strong>Gelişmiş Giyim Stok ve Satış Yönetim Paneli</strong>
  </p>
  <p>
    Modern ve hızlı bir web paneli ile ürünlerinizi, stoklarınızı, satışlarınızı ve iadelerinizi yönetin. Dashboard üzerinden kritik stok seviyelerini, en çok satan ürünleri ve satış performansını anlık olarak takip edin.
  </p>

  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgalile0ff%2Fgalileoff-StockControlPanel)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![GitHub stars](https://img.shields.io/github/stars/galile0ff/galileoff-StockControlPanel?style=social)](https://github.com/galile0ff/galileoff-StockControlPanel/stargazers)

</div>

---

## 🚀 Temel Özellikler

- **📦 Ürün Yönetimi:** Ürünleri fotoğraf, kategori, sağlam/defolu stok adedi gibi detaylarla yönetin.
- **🎨 Dinamik Varyasyonlar:** Sınırsız sayıda kategori, beden ve renk seçeneği tanımlayın.
- **📈 Satış ve İade Takibi:** Yapılan satışları ve iadeleri kaydedin, stok durumunu otomatik olarak güncelleyin.
- **📊 Akıllı Dashboard:**
  - **Kritik Stok Uyarıları:** Stoğu belirli bir seviyenin altına düşen ürünleri anında görün.
  - **En Çok Satanlar:** Performanslarına göre en popüler ürünleri listeleyin.
  - **Finansal Özet:** Toplam satış geliri ve iade maliyetleri gibi önemli metrikleri takip edin.
  - **Görsel Raporlar:** Satış trendleri, stok dağılımı gibi verileri grafiklerle analiz edin.
- **🔐 Güvenlik:** Supabase Auth ile güvenli kullanıcı girişi ve admin rol yetkilendirmesi.
- **🌙 Modern Arayüz:** Açık ve koyu tema desteği ile kullanıcı dostu, tamamen responsive tasarım.

---

## 💻 Teknoloji Yığını

Proje, performans ve ölçeklenebilirlik için modern ve güçlü teknolojilerle geliştirilmiştir.

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Framework** | **Next.js 13** (App Router) | React tabanlı, sunucu taraflı render ve statik site oluşturma. |
| **Dil** | **TypeScript** | JavaScript'e tip güvenliği ekler, büyük projelerde hataları azaltır. |
| **Veritabanı & Backend** | **Supabase** | PostgreSQL veritabanı, kimlik doğrulama, depolama ve anlık API'ler. |
| **Veri Çekme** | **SWR** | Vercel tarafından geliştirilen, yeniden doğrulama stratejisine sahip data-fetching kütüphanesi. |
| **Grafik & Raporlama** | **Recharts, ApexCharts** | İnteraktif ve özelleştirilebilir grafik bileşenleri. |
| **Form Yönetimi** | **React Hook Form** | Performanslı ve esnek form yönetimi. |
| **İkonlar** | **Lucide React** | Hafif ve özelleştirilebilir ikon kütüphanesi. |
| **Hosting** | **Vercel** | Next.js projeleri için optimize edilmiş, hızlı ve kolay dağıtım platformu. |

---

## ⚡ Yerelde Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/galile0ff/galileoff-StockControlPanel.git
cd galileoff-StockControlPanel
```

### 2. Supabase Projesini Ayarlayın

Bu proje, altyapı olarak tamamen **Supabase** üzerine kuruludur.

1.  [Supabase](https://supabase.com/)'e kaydolun ve yeni bir proje oluşturun.
2.  Proje panelinizdeki **SQL Editor** bölümüne gidin.
3.  `supabase_schema.sql` dosyasının içeriğini kopyalayıp editörde çalıştırarak veritabanı şemanızı kurun.
4.  Ardından `supabase_storage_policies.sql` içeriğini de aynı şekilde çalıştırarak depolama (storage) kurallarını ayarlayın.
5.  **Settings > API** bölümünden projenize ait şu üç bilgiyi kopyalayın:
    *   `Project URL`
    *   `anon public` Key
    *   `service_role` Secret Key

### 3. Ortam Değişkenlerini Oluşturun

Proje kök dizininde `.env.local` adında bir dosya oluşturun ve Supabase'den aldığınız bilgileri aşağıdaki gibi içine ekleyin.

```bash
# Genel istemci tarafı erişim için
NEXT_PUBLIC_SUPABASE_URL=SUPABASE_PROJE_URL'İNİZ
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY'İNİZ

# API rotalarında yönetici işlemleri (ürün ekleme, silme vb.) için
SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY'İNİZ
```

### 4. Bağımlılıkları Yükleyin ve Çalıştırın

```bash
npm install
npm run dev
```

Uygulama artık [http://localhost:3000](http://localhost:3000) adresinde çalışmaya hazır!

---

## 🗄️ Veritabanı Mimarisi

Veritabanı, `supabase_schema.sql` dosyasında tanımlanmıştır ve Supabase'in güçlü özelliklerinden yararlanır.

-   **Row-Level Security (RLS):** Tüm tablolarda RLS aktif edilmiştir. Veri okuma işlemleri herkese açıkken, yazma, güncelleme ve silme işlemleri yalnızca `admin` rolüne sahip doğrulanmış kullanıcılar tarafından yapılabilir.
-   **Transactional Functions (RPC):** `create_sale_and_update_stock` ve `create_return_and_update_stock` gibi PostgreSQL fonksiyonları, bir satış veya iade işlemi sırasında birden fazla tabloyu (örn: `sales` ve `product_variants`) tek bir atomik işlemde günceller. Bu, veri tutarlılığını garanti eder ve yarış koşullarını (race conditions) önler.
-   **Depolama (Storage):** Ürün resimleri, `product-images` adlı bir Supabase Storage bucket'ında saklanır. Erişim politikaları `supabase_storage_policies.sql` dosyasında tanımlanmıştır.

---

## 📄 API Uç Noktaları (Endpoints)

Uygulama, veri yönetimi için aşağıdaki RESTful API rotalarını kullanır. Bu rotalar, yönetici yetkisi gerektiren eylemler için `SUPABASE_SERVICE_ROLE_KEY`'i kullanır.

| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| `GET, POST, PUT, DELETE` | `/api/products` | Ürünleri ve ürün varyantlarını yönetir. |
| `GET, POST, PUT, DELETE` | `/api/categories` | Kategorileri yönetir. |
| `GET, POST, PUT, DELETE` | `/api/colors` | Renkleri yönetir. |
| `GET, POST, PUT, DELETE` | `/api/sizes` | Bedenleri yönetir. |
| `GET, POST` | `/api/sales` | Satış kayıtlarını listeler ve oluşturur. |
| `GET, POST` | `/api/returns` | İade kayıtlarını listeler ve oluşturur. |
| `GET` | `/api/dashboard-stats` | Dashboard için tüm istatistiksel verileri toplar. |

---

## ☕ Destek Olun

Bu proje işinize yaradıysa ve geliştirmemi desteklemek istiyorsanız, bana bir kahve ısmarlayabilirsiniz! Ayrıca projeyi beğendiysen **GitHub'da yıldız (⭐)** vererek de destek olabilirsin. Destekleriniz, projeyi daha ileri taşımam için büyük bir motivasyon kaynağı. 🚀

<a href="https://www.buymeacoffee.com/galileoff" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

---

## 📝 Lisans

Bu proje [MIT](LICENSE) lisansı ile lisanslanmıştır.
