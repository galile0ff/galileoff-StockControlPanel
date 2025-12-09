<div align="center">
  <br/>
  <!-- 
    TAVSİYE: Projenizin logosu ve adıyla birlikte "glassmorphism" tarzında bir banner görseli oluşturup 
    buraya ekleyerek tasarımı bir üst seviyeye taşıyabilirsiniz. (Örnek boyut: 1280x400)
    <img src="URL_ADRESİNİZ" alt="Proje Banner">
  -->
  <h1>Galileoff Stock Control Panel</h1>
  <p>
    <b>Modern, hızlı ve estetik bir arayüze sahip gelişmiş stok ve satış yönetim paneli.</b>
  </p>
  <br/>
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
  <!-- GitHub Stars -->
  <a href="https://github.com/galile0ff/galileoff-StockControlPanel/stargazers">
    <img src="https://img.shields.io/github/stars/galile0ff/galileoff-StockControlPanel?style=flat-square&logo=github&label=Yıldızla" alt="GitHub stars">
  </a>
</div>

---

> ✨ **Proje Galerisi**
> 
> *İpucu: Projenizin ekran görüntülerini (örneğin .png veya .gif formatında) bu reponun "Issues" bölümüne sürükleyip bırakarak kalıcı URL'ler elde edebilir ve aşağıdaki `src` adreslerini bu URL'lerle güncelleyebilirsiniz.*

<table width="100%">
  <tr>
    <td width="33%" align="center"><b>Dashboard</b></td>
    <td width="33%" align="center"><b>Ürün Listesi</b></td>
    <td width="33%" align="center"><b>Ürün Ekleme</b></td>
  </tr>
  <tr>
    <td width="33%"><img src="https://raw.githubusercontent.com/user-attachments/assets/de31bca3-718c-4f7f-a18d-1941785f29d2" alt="Dashboard" width="100%"></td>
    <td width="33%"><img src="https://raw.githubusercontent.com/user-attachments/assets/75654c6e-c6e6-4279-81f1-309a4d876a4a" alt="Product List" width="100%"></td>
    <td width="33%"><img src="https://raw.githubusercontent.com/user-attachments/assets/65b161c2-8703-49a6-ac33-14574cc4061a" alt="Add Product Form" width="100%"></td>
  </tr>
</table>

---

> 🚀 **Temel Özellikler**

- **📊 Gelişmiş Dashboard:** Kritik stok seviyeleri, en çok satan ürünler, toplam kâr ve satış trendleri gibi önemli metrikleri anlık ve görsel olarak takip edin.
- **📦 Kapsamlı Ürün Yönetimi:** Ürünleri zengin detaylarla (fotoğraf, kategori, fiyat, stok vb.) ve sınırsız varyasyonla (renk, beden) yönetin.
- **📈 Otomatik Stok Takibi:** Yapılan her satış ve iade işlemiyle stok adetleri (sağlam/defolu) otomatik olarak güncellenir.
- **🎨 Dinamik Varyasyonlar:** Projenize özel Kategori, Renk ve Beden tanımlamaları yaparak ürünlerinizi kolayca sınıflandırın.
- **🔐 Güvenli Kimlik Doğrulama:** Supabase Auth ile modern ve güvenli kullanıcı yönetimi.
- **🌙 Modern ve Duyarlı Arayüz:** Açık ve Koyu Tema desteği sunan, tüm cihazlarla uyumlu (responsive) minimalist ve şık tasarım.

---

> 🛠️ **Teknoloji Yığını**

<table>
  <tr>
    <td valign="top"><b>Framework</b></td>
    <td>Next.js 13 (App Router)</td>
  </tr>
  <tr>
    <td valign="top"><b>Dil</b></td>
    <td>TypeScript</td>
  </tr>
  <tr>
    <td valign="top"><b>Backend & Veritabanı</b></td>
    <td>Supabase (PostgreSQL, Auth, Storage)</td>
  </tr>
  <tr>
    <td valign="top"><b>Veri Çekme</b></td>
    <td>SWR (Stale-While-Revalidate)</td>
  </tr>
  <tr>
    <td valign="top"><b>Grafik & Raporlama</b></td>
    <td>Recharts, ApexCharts</td>
  </tr>
  <tr>
    <td valign="top"><b>Form Yönetimi</b></td>
    <td>React Hook Form</td>
  </tr>
  <tr>
    <td valign="top"><b>UI & Stil</b></td>
    <td>CSS Modules, Lucide Icons</td>
  </tr>
</table>

---

> ⚙️ **Yerelde Kurulum ve Çalıştırma**

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/galile0ff/galileoff-StockControlPanel.git
    cd galileoff-StockControlPanel
    ```

2.  **Supabase Ayarları:**
    - [Supabase](https://supabase.com/)'de yeni bir proje oluşturun.
    - Proje panelindeki `SQL Editor`'e gidin ve `supabase_schema.sql` dosyasının içeriğini çalıştırın.
    - `supabase_storage_policies.sql` içeriğini de aynı şekilde çalıştırın.
    - `Settings > API` bölümünden gerekli `URL` ve `Key` değerlerini kopyalayın.

3.  **Ortam Değişkenleri:**
    - Proje kök dizininde `.env.local` adında bir dosya oluşturun.
    - Aşağıdaki içeriği kopyalayıp kendi Supabase bilgilerinizle doldurun:
      ```env
      # Genel istemci tarafı erişim için
      NEXT_PUBLIC_SUPABASE_URL=BURAYA_SUPABASE_PROJE_URL_GIRIN
      NEXT_PUBLIC_SUPABASE_ANON_KEY=BURAYA_SUPABASE_ANON_KEY_GIRIN

      # API rotalarında yönetici işlemleri için (DİKKATLİ KULLANIN)
      SUPABASE_SERVICE_ROLE_KEY=BURAYA_SUPABASE_SERVICE_ROLE_KEY_GIRIN
      ```

4.  **Bağımlılıkları Yükleyin ve Çalıştırın:**
    ```bash
    npm install
    npm run dev
    ```
    Artık proje [http://localhost:3000](http://localhost:3000) adresinde hazır!

---

> 🤝 **Katkıda Bulunma**

Projeye katkıda bulunmak isterseniz, lütfen `Pull Request` açmaktan çekinmeyin. Her türlü geliştirme ve öneriye açığım.

1.  Projeyi `fork`'layın.
2.  Yeni bir özellik dalı oluşturun: `git checkout -b feature/yeni-harika-ozellik`
3.  Değişikliklerinizi `commit`'leyin: `git commit -m 'feat: Yeni harika bir özellik eklendi'`
4.  Dalınızı `push`'layın: `git push origin feature/yeni-harika-ozellik`
5.  Bir `Pull Request` oluşturun.

<br>
<div align="center">
  Bu proje <a href="LICENSE">MIT</a> lisansı ile lisanslanmıştır.
</div>