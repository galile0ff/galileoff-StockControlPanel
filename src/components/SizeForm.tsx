import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import styles from './Form.module.css';
import { Ruler, Edit2, Trash2, Plus, Loader2, Save, X, Sparkles } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SizeForm = () => {
  const { data: sizes, error } = useSWR('/api/sizes', fetcher);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, name } : { name };

    await fetch('/api/sizes', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    mutate('/api/sizes');
    setName('');
    setEditingId(null);
    setIsLoading(false);
  };

  const handleEdit = (s: any) => { setName(s.name); setEditingId(s.id); };
  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğine emin misin?')) return;
    await fetch('/api/sizes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    mutate('/api/sizes');
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientLight1}></div>
      <div className={styles.ambientLight2}></div>

      <div className={styles.contentContainer}>
        <header className={styles.glassHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBox}><Ruler size={24} /></div>
            <div>
              <h1 className={styles.pageTitle}>Bedenler</h1>
              <p className={styles.pageSubtitle}>Ürün bedenlerini düzenle/ekle.</p>
            </div>
          </div>
          {/* TOPLAM */}
          <div className={styles.statBadge}>
            <Sparkles size={14} style={{color:'#fbbf24'}} />
            <span>Toplam Beden: <strong>{sizes?.length || 0}</strong></span>
          </div>
        </header>

        <div className={styles.splitGrid}>
          <div className={styles.formCard}>
            <h3 className={styles.listTitle} style={{marginBottom:'20px'}}>
              {editingId ? <><Edit2 size={18} /> Düzenle</> : <><Plus size={18} /> Yeni Ekle</>}
            </h3>
            <form onSubmit={handleSubmit} className={styles.formContent}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Beden Adı</label>
                <input className={styles.glassInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn: XL, 42, Standart" required />
              </div>
              <div className={styles.buttonGroup}>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setName(''); }} className={styles.btnCancel}><X size={18} /> İptal</button>}
                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  {isLoading ? <Loader2 className={styles.spin} size={18} /> : <Save size={18} />}
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>

          <div className={styles.listCard}>
            <div className={styles.listHeader}>
              <h3 className={styles.listTitle}>Beden Listesi</h3>
            </div>
            <div className={styles.listContent}>
              {!sizes && <p className={styles.loadingState}>Yükleniyor...</p>}
              {sizes?.map((s: any) => (
                <div key={s.id} className={styles.listItem}>
                  <div className={styles.itemInfo}><Ruler size={16} style={{opacity:0.5}} /> {s.name}</div>
                  <div className={styles.itemActions}>
                    <button onClick={() => handleEdit(s)} className={styles.actionBtnEdit}>
                        <Edit2 size={14} /> Düzenle
                    </button>
                    <button onClick={() => handleDelete(s.id)} className={styles.actionBtnDelete}>
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

export default SizeForm;