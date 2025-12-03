import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import styles from './Form.module.css';
import colornames from 'colornames';

const fetcher = (url: string) => fetch(url).then((res => res.json()));

// Basit bir Türkçe-İngilizce renk haritası
const turkishToEnglish: { [key: string]: string } = {
  'kırmızı': 'red',
  'mavi': 'blue',
  'yeşil': 'green',
  'sarı': 'yellow',
  'siyah': 'black',
  'beyaz': 'white',
  'turuncu': 'orange',
  'mor': 'purple',
  'pembe': 'pink',
  'gri': 'gray',
  'kahverengi': 'brown',
  'lacivert': 'navy',
  'bordo': 'maroon',
  'turkuaz': 'turquoise',
  'bej': 'beige',
};

const ColorForm = () => {
  const { data: colors, error } = useSWR('/api/colors', fetcher);
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('');
  const [editingColor, setEditingColor] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const lowerCaseName = name.toLowerCase().trim();
    if (lowerCaseName) {
      const englishName = turkishToEnglish[lowerCaseName] || lowerCaseName;
      const code = colornames(englishName);
      if (code) {
        setHexCode(code);
      } else {
        setHexCode(''); // Renk bulunamazsa hex'i temizle
      }
    } else {
      setHexCode('');
    }
  }, [name]);

  const handleEditClick = (color: any) => {
    setEditingColor(color);
    setName(color.name);
    setHexCode(color.hex_code);
  };

  const handleCancelEdit = () => {
    setEditingColor(null);
    setName('');
    setHexCode('');
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    if (!hexCode) {
      setFormError('Geçerli bir renk adı giriniz.');
      setIsLoading(false);
      return;
    }

    const url = '/api/colors';
    const method = editingColor ? 'PUT' : 'POST';
    const body = JSON.stringify(editingColor ? { id: editingColor.id, name, hex_code: hexCode } : { name, hex_code: hexCode });

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (res.ok) {
      handleCancelEdit(); // Formu temizle ve düzenleme modundan çık
      mutate('/api/colors');
    } else {
      const err = await res.json();
      setFormError(err.error || 'Bir hata oluştu.');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (editingColor && editingColor.id === id) {
      handleCancelEdit();
    }
    if (!confirm('Bu rengi silmek istediğinizden emin misiniz?')) return;

    const res = await fetch('/api/colors', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      mutate('/api/colors');
    } else {
      alert('Renk silinirken bir hata oluştu.');
    }
  };

  return (
    <div>
      <h1>{editingColor ? 'Renk Düzenle' : 'Renk Yönetimi'}</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Renk Adı (Kırmızı, Mavi...)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading || !hexCode}>
            {isLoading ? (editingColor ? 'Güncelleniyor...' : 'Ekleniyor...') : (editingColor ? 'Güncelle' : 'Ekle')}
          </button>
          {editingColor && (
            <button type="button" onClick={handleCancelEdit} className={styles.cancelButton}>
              Vazgeç
            </button>
          )}
        </div>
        {formError && <p className={styles.formError}>{formError}</p>}
      </form>

      <div className={styles.listContainer}>
        <h2>Mevcut Renkler</h2>
        {error && <p>Renkler yüklenemedi.</p>}
        {!colors && !error && <p>Yükleniyor...</p>}
        {colors && (
          <ul className={styles.list}>
            {colors.map((color: any) => (
              <li key={color.id} className={styles.listItem}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <span style={{ 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: color.hex_code || '#ccc',
                    borderRadius: '50%',
                    border: '1px solid var(--color-border)' // CSS değişkeni kullan
                  }}></span>
                  {color.name}
                </span>
                <div className={styles.buttonGroup}>
                  <button onClick={() => handleEditClick(color)} className={styles.editButton}>
                    Düzenle
                  </button>
                  <button onClick={() => handleDelete(color.id)} className={styles.deleteButton}>
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

export default ColorForm;