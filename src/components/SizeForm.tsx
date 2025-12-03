import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import styles from './Form.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Size {
  id: string;
  name: string;
}

const SizeForm = () => {
  const { data: sizes, error } = useSWR<Size[]>('/api/sizes', fetcher);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingSize, setEditingSize] = useState<Size | null>(null);

  useEffect(() => {
    if (editingSize) {
      setName(editingSize.name);
    } else {
      setName('');
    }
  }, [editingSize]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const method = editingSize ? 'PUT' : 'POST';
    const body = editingSize ? JSON.stringify({ id: editingSize.id, name }) : JSON.stringify({ name });

    const res = await fetch('/api/sizes', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (res.ok) {
      setName('');
      setEditingSize(null);
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

  const handleEdit = (size: Size) => {
    setEditingSize(size);
  };

  const cancelEdit = () => {
    setEditingSize(null);
    setName('');
  }

  return (
    <div>
      <h1>{editingSize ? 'Beden Düzenle' : 'Beden Yönetimi'}</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder={editingSize ? 'Beden Adını Düzenle' : 'Yeni Beden Adı (S, M, L...)'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? (editingSize ? 'Güncelleniyor...' : 'Ekleniyor...') : (editingSize ? 'Güncelle' : 'Ekle')}
          </button>
          {editingSize && (
            <button type="button" onClick={cancelEdit} className={styles.cancelButton}>
              İptal
            </button>
          )}
        </div>
        {formError && <p className={styles.formError}>{formError}</p>}
      </form>

      <div className={styles.listContainer}>
        <h2>Mevcut Bedenler</h2>
        {error && <p>Bedenler yüklenemedi.</p>}
        {!sizes && !error && <p>Yükleniyor...</p>}
        {sizes && (
          <ul className={styles.list}>
            {sizes.map((size) => (
              <li key={size.id} className={styles.listItem}>
                <span>{size.name}</span>
                <div className={styles.buttonGroup}>
                  <button onClick={() => handleEdit(size)} className={styles.editButton}>
                    Düzenle
                  </button>
                  <button onClick={() => handleDelete(size.id)} className={styles.deleteButton}>
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SizeForm;
