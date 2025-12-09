<div align="center">
  <br/>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/user-attachments/assets/b80951d3-3543-4993-9d10-0925d15c1d68/logo-dark.svg">
    <img src="https://raw.githubusercontent.com/user-attachments/assets/b333a82e-9d1c-4217-9008-2c28669528d9/logo-light.svg" alt="Project Logo" width="120" />
  </picture>
  <br/>
  <br/>
  <h1>
    <b>Galileoff Stock Control Panel</b>
  </h1>
  <p>
    Gelişmiş Giyim Stok ve Satış Yönetim Paneli
  </p>
</div>

<div align="center">
  <!-- CI/CD Durumu -->
  <a href="https://github.com/galile0ff/galileoff-StockControlPanel/actions/workflows/ci.yml">
    <img src="https://github.com/galile0ff/galileoff-StockControlPanel/actions/workflows/ci.yml/badge.svg" alt="CI Status"/>
  </a>
  <!-- Vercel Deploy -->
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgalile0ff%2Fgalileoff-StockControlPanel">
    <img src="https://vercel.com/button" alt="Deploy with Vercel"/>
  </a>
  <!-- Lisans -->
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/galile0ff/galileoff-StockControlPanel?style=flat-square&color=blue" alt="License">
  </a>
</div>
<br>

---

### 🖼️ Proje Galerisi
*İpucu: Kendi ekran görüntülerinizi GitHub "Issues" bölümüne sürükleyip bırakarak kalıcı URL'ler alabilir ve aşağıdaki `src` adreslerini güncelleyebilirsiniz.*

<table width="100%">
  <tr>
    <td width="50%" align="center"><b>Dashboard</b></td>
    <td width="50%" align="center"><b>Ürün Listesi</b></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/user-attachments/assets/de31bca3-718c-4f7f-a18d-1941785f29d2/01-dashboard.png" alt="Dashboard" width="100%"></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/user-attachments/assets/75654c6e-c6e6-4279-81f1-309a4d876a4a/02-product-list.png" alt="Product List" width="100%"></td>
  </tr>
  <tr>
    <td width="50%" align="center"><b>Ürün Ekleme Formu</b></td>
    <td width="50%" align="center"><b>Satış Ekranı</b></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/user-attachments/assets/65b161c2-8703-49a6-ac33-14574cc4061a/03-add-product.png" alt="Add Product Form" width="100%"></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/user-attachments/assets/d01066c0-6323-41a4-b040-69279589d81d/04-sales-screen.png" alt="Sales Screen" width="100%"></td>
  </tr>
</table>

---

### ✨ Temel Özellikler

- **📊 Gelişmiş Dashboard:** Kritik stok seviyeleri, en çok satan ürünler, toplam kâr ve satış trendleri gibi önemli metrikleri anlık ve görsel olarak takip edin.
- **📦 Kapsamlı Ürün Yönetimi:** Ürünleri zengin detaylarla (fotoğraf, kategori, fiyat, stok vb.) ve sınırsız varyasyonla (renk, beden) yönetin.
- **📈 Otomatik Stok Takibi:** Yapılan her satış ve iade işlemiyle stok adetleri (sağlam/defolu) otomatik olarak güncellenir.
- **🎨 Dinamik Varyasyonlar:** Projenize özel Kategori, Renk ve Beden tanımlamaları yaparak ürünlerinizi kolayca sınıflandırın.
- **🔐 Güvenli Kimlik Doğrulama:** Supabase Auth ile modern ve güvenli kullanıcı yönetimi.
- **🌙 Modern ve Duyarlı Arayüz:** Açık ve Koyu Tema desteği sunan, tüm cihazlarla uyumlu (responsive) minimalist ve şık tasarım.

---

### 🛠️ Teknoloji Yığını

- **Framework**: `Next.js 13` (App Router)
- **Dil**: `TypeScript`
- **Backend & Veritabanı**: `Supabase` (PostgreSQL, Auth, Storage)
- **Veri Çekme**: `SWR`
- **Grafik & Raporlama**: `Recharts`, `ApexCharts`
- **Form Yönetimi**: `React Hook Form`
- **UI & Stil**: `CSS Modules`, `Lucide Icons`

---

### 🚀 Yerelde Çalıştırma

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/galile0ff/galileoff-StockControlPanel.git
    cd galileoff-StockControlPanel
    ```

2.  **Supabase Ayarları:**
    - [Supabase](https://supabase.com/)'de yeni bir proje oluşturun.
    - Projenizin `SQL Editor`'üne gidin ve `supabase_schema.sql` ile `supabase_storage_policies.sql` dosyalarının içeriklerini çalıştırın.
    - `Settings > API` bölümünden gerekli `URL` ve `Key` değerlerini alın.

3.  **Ortam Değişkenleri (`.env.local`):**
    <details>
      <summary>👉 Değişkenleri görmek için tıklayın</summary>
      
      ```env
      # Genel istemci tarafı erişim için
      NEXT_PUBLIC_SUPABASE_URL=BURAYA_SUPABASE_PROJE_URL_GIRIN
      NEXT_PUBLIC_SUPABASE_ANON_KEY=BURAYA_SUPABASE_ANON_KEY_GIRIN

      # API rotalarında yönetici işlemleri için (DİKKATLİ KULLANIN)
      SUPABASE_SERVICE_ROLE_KEY=BURAYA_SUPABASE_SERVICE_ROLE_KEY_GIRIN
      ```
    </details>
    <br>

4.  **Bağımlılıkları Yükleyin ve Çalıştırın:**
    ```bash
    npm install
    npm run dev
    ```
    Proje artık [http://localhost:3000](http://localhost:3000) adresinde çalışıyor olmalı!

---
<br>
<div align="center">
  Bu proje <a href="LICENSE">MIT</a> lisansı altında dağıtılmaktadır.
</div>
