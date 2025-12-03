import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import styles from './Form.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SizeForm = () => {
  const { data: sizes, error } = useSWR('/api/sizes', fetcher);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const res = await fetch('/api/sizes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      setName('');
      mutate('/api/sizes');
    } else {
      const err = await res.json();
      setFormError(err.error || 'Bir hata oluştu.');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu bedeni silmek istediğinizden emin misiniz?')) return;

    const res = await fetch('/api/sizes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      mutate('/api/sizes');
    } else {
      alert('Beden silinirken bir hata oluştu.');
    }
  };

  return (
    <div>
      <h1>Beden Yönetimi</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Yeni Beden Adı (S, M, L...)"
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
        <h2>Mevcut Bedenler</h2>
        {error && <p>Bedenler yüklenemedi.</p>}
        {!sizes && !error && <p>Yükleniyor...</p>}
        {sizes && (
          <ul className={styles.list}>
            {sizes.map((size: any) => (
              <li key={size.id} className={styles.listItem}>
                <span>{size.name}</span>
                <button onClick={() => handleDelete(size.id)} className={styles.deleteButton}>
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

export default SizeForm;
