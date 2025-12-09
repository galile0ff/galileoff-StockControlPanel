<div align="center">
  <img src="./public/assets/logo.svg" alt="Project Logo" width="120" />
  <h1>Galileoff Stock Control Panel</h1>
  <p><strong>Gelişmiş Giyim Stok ve Satış Yönetim Paneli</strong></p>
</div>

<p align="center">
  Modern ve hızlı bir web paneli ile ürünlerinizi, stoklarınızı, satışlarınızı ve iadelerinizi yönetin. Dashboard üzerinden kritik stok seviyelerini, en çok satan ürünleri ve satış performansını anlık olarak takip edin.
</p>

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgalile0ff%2Fgalileoff-StockControlPanel" target="_blank">
    <img src="https://vercel.com/button" alt="Deploy with Vercel"/>
  </a>
  <a href="LICENSE" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"/>
  </a>
  <a href="https://github.com/galile0ff/galileoff-StockControlPanel/stargazers" target="_blank">
    <img src="https://img.shields.io/github/stars/galile0ff/galileoff-StockControlPanel?style=social" alt="GitHub Stars"/>
  </a>
</p>

---

## 🖼️ Proje Galerisi

*Ekran görüntülerini `docs/images` klasörüne eklediğinizde burada görüneceklerdir.*

| Dashboard | Ürün Listesi | Ürün Ekleme |
| :---: | :---: | :---: |
| ![Dashboard Ekranı](./docs/images/01-dashboard.png) | ![Ürün Listesi](./docs/images/02-product-list.png) | ![Ürün Ekleme Formu](./docs/images/03-add-product.png) |

---

## ✨ Temel Özellikler

-   **📦 Kapsamlı Ürün Yönetimi:** Ürünleri fotoğraf, kategori, tedarikçi, alış fiyatı, satış fiyatı, sağlam/defolu stok adedi gibi zengin detaylarla yönetin.
-   **🎨 Sınırsız Varyasyon:** Projenize özel sınırsız sayıda Kategori, Renk ve Beden tanımlayın ve bunları ürünlerle ilişkilendirin.
-   **📈 Akıllı Satış ve İade Takibi:** Yapılan satışları ve iadeleri kaydederek stok durumunu anlık ve otomatik olarak güncelleyin.
-   **📊 Gelişmiş Dashboard:**
    -   **Kritik Stok Uyarıları:** Stoğu azalan ürünleri anında tespit edin.
    -   **En Çok Satanlar:** Performanslarına göre en popüler ürünleri ve kategorileri listeleyin.
    -   **Finansal Analiz:** Toplam satış geliri, iade maliyetleri ve potansiyel kâr gibi metrikleri izleyin.
    -   **Görsel Raporlar:** Satış trendleri, stok dağılımı gibi verileri interaktif grafiklerle analiz edin.
-   **🔐 Güvenli Kimlik Doğrulama:** Supabase Auth ile modern ve güvenli kullanıcı girişi. Rol tabanlı yetkilendirme ile yönetim paneline sadece adminler erişebilir.
-   **🌙 Modern ve Duyarlı Arayüz:** Kullanıcı tercihine göre Açık ve Koyu Tema desteği sunan, tüm cihazlarla uyumlu (responsive) minimalist tasarım.

---

## 🏗️ Teknik Mimari

Bu proje, modern web geliştirme standartlarına uygun, ölçeklenebilir ve bakımı kolay bir mimari üzerine inşa edilmiştir.

```
┌───────────────────┐      ┌─────────────────────────┐      ┌────────────────────────┐
│   İstemci (Browser) │ ────▶│   Next.js (Web Sunucusu)  │ ────▶│   Supabase (Backend)   │
│ (React Components)│      │   (API Routes)          │      │    (PostgreSQL DB)   │
└───────────────────┘      └─────────────────────────┘      └────────────────────────┘
         │                          │                          ▲
         │                          │                          │
         └──────────────────────────▼──────────────────────────┘
                  (SWR ile Veri Çekme ve Önbellekleme)
```

-   **Frontend:** Kullanıcı arayüzü, **Next.js** üzerinde çalışan **React** bileşenlerinden oluşur. Sayfalar sunucu tarafında oluşturulur (SSR) veya istemci tarafında dinamik olarak güncellenir.
-   **Backend API:** Next.js'in **API Routes** özelliği, projenin backend'i olarak hizmet verir. Gelen istekleri doğrular ve Supabase ile iletişim kurar.
-   **Veritabanı (Database):** **Supabase**, PostgreSQL veritabanını, kimlik doğrulamayı (Auth), dosya depolamayı (Storage) ve güvenlik kurallarını (RLS) yöneten merkezi BaaS (Backend as a Service) platformudur.

---

## 💻 Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Framework** | **Next.js 13** | React tabanlı, sunucu taraflı render ve statik site oluşturma. |
| **Dil** | **TypeScript** | Büyük projelerde tip güvenliği ve daha kolay bakım sağlar. |
| **Veritabanı & Backend** | **Supabase** | PostgreSQL, Auth, Storage ve anlık API'ler sunan açık kaynaklı Firebase alternatifi. |
| **Veri Çekme** | **SWR** | Vercel tarafından geliştirilen, yeniden doğrulama stratejisine sahip data-fetching kütüphanesi. |
| **Grafik & Raporlama**| **Recharts, ApexCharts**| İnteraktif ve özelleştirilebilir grafik bileşenleri. |
| **Form Yönetimi** | **React Hook Form**| Performanslı ve esnek form doğrulama ve yönetimi. |
| **UI & İkonlar** | **CSS Modules, Lucide** | Bileşen bazlı stil yönetimi ve hafif, özelleştirilebilir ikonlar. |

---

## 🚀 Yerelde Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### Adım 1: Projeyi Klonlayın

```bash
git clone https://github.com/galile0ff/galileoff-StockControlPanel.git
cd galileoff-StockControlPanel
```

### Adım 2: Supabase Projesini Ayarlayın

Bu proje, altyapı olarak tamamen **Supabase** üzerine kuruludur.

1.  [Supabase](https://supabase.com/)'e kaydolun ve yeni bir proje oluşturun.
2.  Proje panelinizdeki **SQL Editor** bölümüne gidin.
3.  `supabase_schema.sql` dosyasının içeriğini kopyalayıp çalıştırarak veritabanı şemanızı kurun.
4.  Ardından `supabase_storage_policies.sql` içeriğini de aynı şekilde çalıştırarak depolama (storage) kurallarını ayarlayın.
5.  **Settings > API** bölümünden projenize ait şu üç bilgiyi kopyalayın:
    *   `Project URL`
    *   `anon public` Key
    *   `service_role` Secret Key

### Adım 3: Ortam Değişkenlerini Oluşturun

<details>
<summary>👉 Proje kök dizininde <code>.env.local</code> adında bir dosya oluşturun ve içeriğini buraya tıklayarak kopyalayın.</summary>

Aşağıdaki içeriği oluşturduğunuz `.env.local` dosyasına yapıştırın ve Supabase'den aldığınız bilgilerle `[...]` kısımlarını doldurun.

```bash
# Genel istemci tarafı erişim için
NEXT_PUBLIC_SUPABASE_URL=[SUPABASE_PROJE_URL'İNİZ]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUPABASE_ANON_KEY'İNİZ]

# API rotalarında yönetici işlemleri (ürün ekleme, silme vb.) için
# Bu anahtarın dışarı sızdırılmamasına özellikle dikkat edin!
SUPABASE_SERVICE_ROLE_KEY=[SUPABASE_SERVICE_ROLE_KEY'İNİZ]
```

</details>

### Adım 4: Bağımlılıkları Yükleyin ve Çalıştırın

```bash
npm install
npm run dev
```

Uygulama artık [http://localhost:3000](http://localhost:3000) adresinde çalışmaya hazır!

---

## 🤝 Katkıda Bulunma

Katkılarınız projeyi daha iyi hale getirecektir!

1.  Bu repoyu fork'layın.
2.  Yeni bir özellik dalı oluşturun (`git checkout -b feature/yeni-ozellik`).
3.  Değişikliklerinizi commit'leyin (`git commit -m 'feat: Yeni bir özellik eklendi'`).
4.  Dalınızı push'layın (`git push origin feature/yeni-ozellik`).
5.  Bir Pull Request açın.

---

## ☕ Destek Olun

Bu proje işinize yaradıysa ve geliştirmemi desteklemek istiyorsanız, bana bir kahve ısmarlayabilirsiniz!

<a href="https://www.buymeacoffee.com/galileoff" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

---

## 📝 Lisans

Bu proje [MIT](LICENSE) lisansı ile lisanslanmıştır.