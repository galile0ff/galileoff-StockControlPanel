<div align="center">
  <img src="./public/assets/logo.svg" alt="Project Logo" width="120" />
  <h1>Galileoff Stock Control Panel</h1>
  <p><strong>Gelişmiş Giyim Stok ve Satış Yönetim Paneli</strong></p>
</div>

<div align="center">

[![Node.js CI](https://github.com/galile0ff/galileoff-StockControlPanel/actions/workflows/ci.yml/badge.svg)](https://github.com/galile0ff/galileoff-StockControlPanel/actions/workflows/ci.yml)
[![Oturum Aç ve Çalıştır](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/galile0ff/galileoff-StockControlPanel)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgalile0ff%2Fgalileoff-StockControlPanel)

![GitHub last commit](https://img.shields.io/github/last-commit/galile0ff/galileoff-StockControlPanel?style=for-the-badge&logo=github)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/galile0ff/galileoff-StockControlPanel?style=for-the-badge&logo=github)
![License](https://img.shields.io/github/license/galile0ff/galileoff-StockControlPanel?style=for-the-badge&color=blue)
![GitHub stars](https://img.shields.io/github/stars/galile0ff/galileoff-StockControlPanel?style=for-the-badge&logo=github&label=Yıldızla)

</div>

<p align="center">
  Modern ve hızlı bir web paneli ile ürünlerinizi, stoklarınızı, satışlarınızı ve iadelerinizi yönetin. Dashboard üzerinden kritik stok seviyelerini, en çok satan ürünleri ve satış performansını anlık olarak takip edin.
</p>

---

<br>

## 📋 İçindekiler

- [🖼️ Proje Galerisi](#️-proje-galerisi)
- [✨ Temel Özellikler](#-temel-özellikler)
- [🏗️ Teknik Mimari](#️-teknik-mimari)
- [💻 Teknoloji Yığını](#-teknoloji-yığını)
- [🚀 Yerelde Çalıştırma](#-yerelde-çalıştırma)
- [⚙️ Sürekli Entegrasyon (CI)](#️-sürekli-entegrasyon-ci)
- [🗂️ Proje Yapısı](#️-proje-yapısı)
- [📄 API Uç Noktaları](#-api-uç-noktaları)
- [🤝 Katkıda Bulunma](#-katkıda-bulunma)
- [☕ Destek Olun](#-destek-olun)
- [📝 Lisans](#-lisans)

<br>

---

### <p align="center">🖼️ Proje Galerisi</p>
<div align="center">

*Ekran görüntülerini `docs/images` klasörüne eklediğinizde burada görüneceklerdir.*

| Dashboard | Ürün Listesi | Ürün Ekleme |
| :---: | :---: | :---: |
| ![Dashboard Ekranı](./docs/images/01-dashboard.png) | ![Ürün Listesi](./docs/images/02-product-list.png) | ![Ürün Ekleme Formu](./docs/images/03-add-product.png) |

</div>

---

### <p align="center">✨ Temel Özellikler</p>
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

### <p align="center">🏗️ Teknik Mimari</p>
<p align="center">
Bu proje, modern web geliştirme standartlarına uygun, ölçeklenebilir ve bakımı kolay bir mimari üzerine inşa edilmiştir.
</p>
<div align="center">

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
</div>

---

### <p align="center">💻 Teknoloji Yığını</p>
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

### <p align="center">🚀 Yerelde Çalıştırma</p>

#### Adım 1: Projeyi Klonlayın veya Gitpod'da Açın

- **Seçenek A: Gitpod (Önerilen - Sıfır Kurulum)**<br>
  [![Oturum Aç ve Çalıştır](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/galile0ff/galileoff-StockControlPanel)<br>
  Yukarıdaki butona tıklayarak projeyi anında tarayıcınızda, tüm kurulumları yapılmış bir geliştirme ortamında açabilirsiniz.

- **Seçenek B: Yerel Makine**
  ```bash
  git clone https://github.com/galile0ff/galileoff-StockControlPanel.git
  cd galileoff-StockControlPanel
  ```

#### Adım 2: Supabase Projesini Ayarlayın
Projenin çalışması için bir Supabase projesine ihtiyacınız var.
1. [Supabase](https://supabase.com/)'e kaydolun ve yeni bir proje oluşturun.
2. Proje panelindeki **SQL Editor**'e gidin.
3. `supabase_schema.sql` dosyasının içeriğini kopyalayıp çalıştırın.
4. `supabase_storage_policies.sql` içeriğini de aynı şekilde çalıştırın.
5. **Settings > API** bölümünden `Project URL`, `anon public` Key ve `service_role` Secret Key'i kopyalayın.

#### Adım 3: Ortam Değişkenlerini Oluşturun
<details>
<summary>👉 Proje kök dizininde <code>.env.local</code> adında bir dosya oluşturun ve içeriğini buraya tıklayarak kopyalayın.</summary>

```bash
# Genel istemci tarafı erişim için
NEXT_PUBLIC_SUPABASE_URL=[SUPABASE_PROJE_URL'İNİZ]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUPABASE_ANON_KEY'İNİZ]

# API rotalarında yönetici işlemleri (ürün ekleme, silme vb.) için
# Bu anahtarın dışarı sızdırılmamasına özellikle dikkat edin!
SUPABASE_SERVICE_ROLE_KEY=[SUPABASE_SERVICE_ROLE_KEY'İNİZ]
```
</details>

#### Adım 4: Bağımlılıkları Yükleyin ve Çalıştırın
```bash
npm install
npm run dev
```
Uygulama artık [http://localhost:3000](http://localhost:3000) adresinde çalışmaya hazır!

---

### <p align="center">⚙️ Sürekli Entegrasyon (CI)</p>

Bu proje, kod kalitesini ve kararlılığını sağlamak için **GitHub Actions** üzerinde çalışan bir Sürekli Entegrasyon (CI) boru hattı (pipeline) kullanır.

[![Node.js CI](https://github.com/galile0ff/galileoff-StockControlPanel/actions/workflows/ci.yml/badge.svg)](https://github.com/galile0ff/galileoff-StockControlPanel/actions/workflows/ci.yml)

**Bu otomasyon ne yapar?**

-   `main` branch'ine her yeni kod gönderildiğinde (`push`) veya bir `pull request` açıldığında otomatik olarak tetiklenir.
-   Projeyi, Node.js'in farklı sürümleri (18.x, 20.x) üzerinde test eder.
-   Tüm `npm` bağımlılıklarını kurar (`npm install`).
-   Kod stili ve potansiyel hataları kontrol etmek için `lint` komutunu çalıştırır (`npm run lint`).
-   Projenin başarılı bir şekilde derlendiğini doğrulamak için `build` komutunu çalıştırır (`npm run build`).

Bu süreç, projenin her zaman çalışır ve kararlı durumda kalmasını sağlar, ayrıca olası hataların erken bir aşamada tespit edilmesine yardımcı olur.

---

### <p align="center">🗂️ Proje Yapısı</p>
<details>
<summary>👉 Projenin detaylı dosya ve klasör yapısını görmek için tıklayın.</summary>

```
/
├── .github/
│   └── workflows/
│       └── ci.yml              # Sürekli Entegrasyon (CI) otomasyonu
├── .gitignore
├── middleware.ts               # Next.js middleware (örn: kimlik doğrulama yönlendirmeleri)
├── next-env.d.ts               # Next.js için TypeScript tip tanımlamaları
├── package.json                # Proje bağımlılıkları ve script'leri
├── README.md                   # Bu dosya
├── supabase_schema.sql         # Supabase veritabanı şeması, tablolar ve RLS poliçeleri
├── supabase_storage_policies.sql # Supabase depolama güvenlik kuralları
├── tsconfig.json               # TypeScript derleyici ayarları
├── public/
│   └── assets/
│       └── logo.svg            # Proje logosu
└── src/
    ├── components/             # Tekrar kullanılabilir React bileşenleri (Formlar, Listeler vb.)
    │   ├── CategoryForm.tsx
    │   ├── Layout.tsx
    │   ├── ProductForm.tsx
    │   └── ...
    ├── context/                # React Context API sağlayıcıları (örn: Tema Yönetimi)
    │   └── ThemeContext.tsx
    ├── lib/                    # Yardımcı fonksiyonlar ve kütüphane ayarları
    │   └── supabaseClient.ts   # Supabase istemci bağlantı konfigürasyonu
    ├── pages/                  # Uygulama sayfaları ve API rotaları
    │   ├── _app.tsx              # Global App bileşeni
    │   ├── index.tsx             # Ana Dashboard sayfası
    │   ├── login.tsx             # Giriş sayfası
    │   ├── api/                  # Backend API uç noktaları
    │   │   ├── categories.ts
    │   │   ├── products.ts
    │   │   └── ...
    │   └── manage/               # Ürün, kategori vb. yönetim sayfaları
    │       ├── products.tsx
    │       └── ...
    └── styles/                 # Global ve modüler CSS dosyaları
        ├── globals.css
        └── Dashboard.module.css
```
</details>

---

### <p align="center">📄 API Uç Noktaları</p>

| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| `GET, POST, PUT, DELETE` | `/api/products` | Ürünleri ve ürün varyantlarını yönetir. |
| `GET, POST, PUT, DELETE` | `/api/categories` | Kategorileri yönetir. |
| `GET, POST, PUT, DELETE` | `/api/colors` | Renkleri yönetir. |
| `GET, POST, PUT, DELETE` | `/api/sizes` | Bedenleri yönetir. |
| `GET, POST` | `/api/sales` | Satış kayıtlarını listeler ve oluşturur. |
| `GET, POST` | `/api/returns` | İade kayıtlarını listeler ve oluşturur. |
| `GET` | `/api/dashboard-stats` | Dashboard için tüm istatistiksel verileri toplar. |

<details>
<summary>👉 Örnek API İstek Body'lerini görmek için tıklayın.</summary>

#### `POST /api/products`
Yeni bir ürün oluşturmak için gönderilen örnek JSON body'si.
```json
{
  "name": "Yeni Sezon T-Shirt",
  "categoryId": "c5a6b7d8-e9f0-1234-5678-9abcdef01234",
  "variants": [
    { "sizeId": "s1...", "colorId": "c1...", "stock": 10, "isDefective": 0 },
    { "sizeId": "s2...", "colorId": "c1...", "stock": 5, "isDefective": 1 }
  ]
}
```

#### `POST /api/sales`
Yeni bir satış kaydetmek için gönderilen örnek JSON body'si.
```json
{
  "items": [
    { "variantId": "pv1...", "quantity": 2, "price": 299.99 },
    { "variantId": "pv2...", "quantity": 1, "price": 349.50 }
  ],
  "totalAmount": 949.48
}
```
</details>

<br>

---

### <p align="center">🤝 Katkıda Bulunma</p>

Katkılarınız projeyi daha iyi hale getirecektir! Lütfen `CONTRIBUTING.md` dosyasını inceleyin.

1.  Bu repoyu fork'layın.
2.  Yeni bir özellik dalı oluşturun (`git checkout -b feature/yeni-ozellik`).
3.  Değişikliklerinizi commit'leyin (`git commit -m 'feat: Yeni bir özellik eklendi'`).
4.  Dalınızı push'layın (`git push origin feature/yeni-ozellik`).
5.  Bir Pull Request açın.

---

### <p align="center">☕ Destek Olun</p>
<p align="center">
Bu proje işinize yaradıysa ve geliştirmemi desteklemek istiyorsanız, bana bir kahve ısmarlayabilirsiniz!
</p>
<p align="center">
<a href="https://www.buymeacoffee.com/galileoff" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
</p>

---

### <p align="center">📝 Lisans</p>
<p align="center">
Bu proje <a href="LICENSE">MIT</a> lisansı ile lisanslanmıştır.
</p>

---

### <p align="center">🤝 Katkıda Bulunma</p>

Katkılarınız projeyi daha iyi hale getirecektir! Lütfen `CONTRIBUTING.md` dosyasını inceleyin.

1.  Bu repoyu fork'layın.
2.  Yeni bir özellik dalı oluşturun (`git checkout -b feature/yeni-ozellik`).
3.  Değişikliklerinizi commit'leyin (`git commit -m 'feat: Yeni bir özellik eklendi'`).
4.  Dalınızı push'layın (`git push origin feature/yeni-ozellik`).
5.  Bir Pull Request açın.

---

### <p align="center">☕ Destek Olun</p>
<p align="center">
Bu proje işinize yaradıysa ve geliştirmemi desteklemek istiyorsanız, bana bir kahve ısmarlayabilirsiniz!
</p>
<p align="center">
<a href="https://www.buymeacoffee.com/galileoff" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
</p>

---

### <p align="center">📝 Lisans</p>
<p align="center">
Bu proje <a href="LICENSE">MIT</a> lisansı ile lisanslanmıştır.
</p>
