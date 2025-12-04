import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import styles from '../styles/Form.module.css';
import { Layers, Edit2, Trash2, Plus, Loader2, Save, X, Sparkles } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CategoryForm = () => {
  const { data: categories, error } = useSWR('/api/categories', fetcher);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, name } : { name };

    const res = await fetch('/api/categories', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      mutate('/api/categories');
      setName('');
      setEditingId(null);
    } else {
      const errorData = await res.json();
      setApiError(errorData.error || 'Bir hata oluştu.');
    }
    setIsLoading(false);
  };

  const handleEdit = (cat: any) => { 
    setApiError(null);
    setName(cat.name); 
    setEditingId(cat.id); 
  };
  
  const handleDelete = async (id: string) => {
    setApiError(null);
    const res = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    
    if (res.ok) {
      mutate('/api/categories');
    } else {
      const errorData = await res.json();
      setApiError(errorData.error || 'Bir hata oluştu.');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientLight1}></div>
      <div className={styles.ambientLight2}></div>

      <div className={styles.contentContainer}>
        <header className={styles.glassHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBox}><Layers size={24} /></div>
            <div>
              <h1 className={styles.pageTitle}>Kategoriler</h1>
              <p className={styles.pageSubtitle}>Ürün kategorilerini düzenle/ekle.</p>
            </div>
          </div>
          <div className={styles.statBadge}>
            <Sparkles size={14} style={{color:'#fbbf24'}} />
            <span>Toplam Kategori: <strong>{categories?.length || 0}</strong></span>
          </div>
        </header>

        {apiError && (
          <div className={styles.errorBanner}>
            <span>{apiError}</span>
            <button onClick={() => setApiError(null)} className={styles.closeBtn}>
              <X size={18} />
            </button>
          </div>
        )}

        <div className={styles.splitGrid}>
          <div className={styles.formCard}>
            <h3 className={styles.listTitle} style={{marginBottom:'20px'}}>
              {editingId ? <><Edit2 size={18} /> Düzenle</> : <><Plus size={18} /> Yeni Ekle</>}
            </h3>
            <form onSubmit={handleSubmit} className={styles.formContent}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Kategori Adı</label>
                <input 
                  className={styles.glassInput} 
                  value={name} 
                  onChange={(e) => {
                    setName(e.target.value);
                    setApiError(null);
                  }} 
                  placeholder="Örn: T-Shirt" 
                  required 
                />
              </div>
              <div className={styles.buttonGroup}>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setName(''); setApiError(null); }} className={styles.btnCancel}><X size={18} /> İptal</button>}
                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  {isLoading ? <Loader2 className={styles.spin} size={18} /> : <Save size={18} />}
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>

          <div className={styles.listCard}>
            <div className={styles.listHeader}>
              <h3 className={styles.listTitle}>Kategori Listesi</h3>
            </div>
            <div className={styles.listContent}>
              {!categories && <p className={styles.loadingState}>Yükleniyor...</p>}
              {categories?.map((cat: any) => (
                <div key={cat.id} className={styles.listItem}>
                  <div className={styles.itemInfo}><Layers size={16} style={{opacity:0.5}} /> {cat.name}</div>
                  <div className={styles.itemActions}>
                    <button onClick={() => handleEdit(cat)} className={styles.actionBtnEdit}>
                        <Edit2 size={14} /> Düzenle
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className={styles.actionBtnDelete}>
                        <Trash2 size={14} /> Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;