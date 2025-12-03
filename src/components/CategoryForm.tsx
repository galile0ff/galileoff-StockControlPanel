import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import styles from './Form.module.css';

// SWR için genel bir fetcher fonksiyonu
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CategoryForm = () => {
  const { data: categories, error } = useSWR('/api/categories', fetcher);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      setName('');
      // Yerel SWR önbelleğini güncelle ve yeniden veri çek.
      mutate('/api/categories');
    } else {
      const err = await res.json();
      setFormError(err.error || 'Bir hata oluştu.');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    const res = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      mutate('/api/categories');
    } else {
      alert('Kategori silinirken bir hata oluştu.');
    }
  };

  return (
    <div>
      <h1>Kategori Yönetimi</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Yeni Kategori Adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Ekleniyor...' : 'Ekle'}
          </button>
        </div>
        {formError && <p className={styles.formError}>{formError}</p>}
      </form>

      <div className={styles.listContainer}>
        <h2>Mevcut Kategoriler</h2>
        {error && <p>Kategoriler yüklenemedi.</p>}
        {!categories && !error && <p>Yükleniyor...</p>}
        {categories && (
          <ul className={styles.list}>
            {categories.map((cat: any) => (
              <li key={cat.id} className={styles.listItem}>
                <span>{cat.name}</span>
                <button onClick={() => handleDelete(cat.id)} className={styles.deleteButton}>
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoryForm;
