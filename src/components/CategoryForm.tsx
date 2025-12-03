import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import styles from './Form.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Category {
  id: string;
  name: string;
}

const CategoryForm = () => {
  const { data: categories, error } = useSWR<Category[]>('/api/categories', fetcher);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
    } else {
      setName('');
    }
  }, [editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const method = editingCategory ? 'PUT' : 'POST';
    const body = editingCategory ? JSON.stringify({ id: editingCategory.id, name }) : JSON.stringify({ name });

    const res = await fetch('/api/categories', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (res.ok) {
      setName('');
      setEditingCategory(null);
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

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setName('');
  }

  return (
    <div>
      <h1>{editingCategory ? 'Kategori Düzenle' : 'Kategori Yönetimi'}</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder={editingCategory ? 'Kategori Adını Düzenle' : 'Yeni Kategori Adı'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? (editingCategory ? 'Güncelleniyor...' : 'Ekleniyor...') : (editingCategory ? 'Güncelle' : 'Ekle')}
          </button>
          {editingCategory && (
            <button type="button" onClick={cancelEdit} className={styles.cancelButton}>
              İptal
            </button>
          )}
        </div>
        {formError && <p className={styles.formError}>{formError}</p>}
      </form>

      <div className={styles.listContainer}>
        <h2>Mevcut Kategoriler</h2>
        {error && <p>Kategoriler yüklenemedi.</p>}
        {!categories && !error && <p>Yükleniyor...</p>}
        {categories && (
          <ul className={styles.list}>
            {categories.map((cat) => (
              <li key={cat.id} className={styles.listItem}>
                <span>{cat.name}</span>
                <div className={styles.buttonGroup}>
                  <button onClick={() => handleEdit(cat)} className={styles.editButton}>
                    Düzenle
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className={styles.deleteButton}>
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

export default CategoryForm;
