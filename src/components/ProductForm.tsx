import React, { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import styles from './Form.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Bu component sadece yeni ürün oluşturmanın ilk adımı içindir.
const ProductForm = () => {
  const router = useRouter();
  const { data: categories, error: categoriesError } = useSWR('/api/categories', fetcher);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null); // State for the image file
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State for image preview
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Create a URL for preview
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category_id', categoryId || ''); // Send empty string if null
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const res = await fetch('/api/products', {
      method: 'POST',
      // Do NOT set Content-Type header when sending FormData; browser sets it automatically
      body: formData,
    });

    if (res.ok) {
      const newProduct = await res.json();
      // Başarılı olursa, kullanıcıyı varyant ekleyebileceği
      // ürün düzenleme sayfasına yönlendir.
      router.push(`/manage/products/${newProduct.id}`);
    } else {
      const err = await res.json();
      setFormError(err.error || 'Bir hata oluştu.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Yeni Ürün Ekle</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="name">Ürün Adı</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formField}>
            <label htmlFor="category">Kategori</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Kategori Seçin</option>
              {categoriesError && <option disabled>Kategoriler yüklenemedi</option>}
              {!categories && <option disabled>Yükleniyor...</option>}
              {categories &&
                categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
          <div className={`${styles.formField} ${styles.fullWidth}`}>
            <label htmlFor="description">Açıklama</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className={`${styles.formField} ${styles.fullWidth}`}>
            <label htmlFor="image">Ürün Görseli</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div style={{ marginTop: 'var(--spacing-sm)' }}> {/* Margin top için değişken kullanıldı */}
                <img src={imagePreview} alt="Ürün Önizleme" className={styles.productImage} />
              </div>
            )}
          </div>

        </div>

        {formError && <p className={styles.formError}>{formError}</p>}

        <div className={styles.formActions}>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet ve Varyant Ekle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;