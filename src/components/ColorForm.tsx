import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import styles from './Form.module.css';
import colornames from 'colornames';
import { 
  Plus, 
  Save, 
  X, 
  Edit2, 
  Trash2, 
  Palette, 
  Loader2, 
  Sparkles 
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Türkçe-İngilizce renk haritası (Genişletilebilir)
const turkishToEnglish: { [key: string]: string } = {
  'kırmızı': 'red', 'mavi': 'blue', 'yeşil': 'green', 'sarı': 'yellow',
  'siyah': 'black', 'beyaz': 'white', 'turuncu': 'orange', 'mor': 'purple',
  'pembe': 'pink', 'gri': 'gray', 'kahverengi': 'brown', 'lacivert': 'navy',
  'bordo': 'maroon', 'turkuaz': 'turquoise', 'bej': 'beige', 'lila': 'lavender',
  'altın': 'gold', 'gümüş': 'silver', 'haki': 'khaki', 'krem': 'cream',
  'antrasit': 'darkslategray', 'fuşya': 'fuchsia', 'çiyan': 'cyan', 'zümrüt': 'emerald',
  'indigo': 'indigo', 'menekşe': 'violet', 'limon': 'lime', 'zeytin': 'olive'
};

const ColorForm = () => {
  const { data: colors, error } = useSWR('/api/colors', fetcher);
  
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState(''); // Hex kodu artık sadece arka planda hesaplanıyor
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Renk ismi yazıldığında Hex kodunu otomatik bulma
  useEffect(() => {
    const lowerCaseName = name.toLowerCase().trim();
    
    if (lowerCaseName) {
      // Eğer düzenleme modundaysak ve isim değişmediyse, mevcut hex kodunu koru
      if (editingId && colors) {
         const currentEdit = colors.find((c: any) => c.id === editingId);
         if (currentEdit && currentEdit.name.toLowerCase() === lowerCaseName) {
             setHexCode(currentEdit.hex_code);
             return;
         }
      }

      // 1. Önce Türkçe sözlükten bak
      let englishName = turkishToEnglish[lowerCaseName];
      
      // 2. Türkçe karşılığı yoksa, girilen değeri direkt İngilizce gibi dene
      if (!englishName) {
        englishName = lowerCaseName;
      }

      // 3. colornames kütüphanesi ile Hex kodunu bul
      const code = colornames(englishName);
      
      if (code) {
        setHexCode(code);
        setFormError(null);
      } else {
        setHexCode(''); 
      }
    } else {
      setHexCode('');
    }
  }, [name, editingId, colors]);

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setName(c.name);
    setHexCode(c.hex_code);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setHexCode('');
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    // Kaydetmeden önce validasyon
    if (!hexCode) {
      setFormError('Bu renk adı algılanamadı. Lütfen geçerli bir renk adı giriniz (örn: Kırmızı, Navy, Zümrüt).');
      setIsLoading(false);
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, name, hex_code: hexCode } : { name, hex_code: hexCode };

    const res = await fetch('/api/colors', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      handleCancelEdit();
      mutate('/api/colors');
    } else {
      const err = await res.json();
      setFormError(err.error || 'Bir hata oluştu.');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (editingId === id) handleCancelEdit();
    if (!confirm('Bu rengi silmek istediğinize emin misiniz?')) return;

    const res = await fetch('/api/colors', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      mutate('/api/colors');
    } else {
      alert('Hata oluştu.');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientLight1} style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}></div>
      <div className={styles.ambientLight2} style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }}></div>

      <div className={styles.contentContainer}>
        
        {/* Header */}
        <header className={styles.glassHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBox}>
              <Palette size={28} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>Renk Yönetimi</h1>
              <p className={styles.pageSubtitle}>Ürün renk varyasyonlarını tanımlayın</p>
            </div>
          </div>
          
          <div className={styles.statBadge}>
            <Sparkles size={14} style={{ color:'#fbbf24' }} />
            <span>Toplam: <strong>{colors?.length || 0}</strong></span>
          </div>
        </header>

        {/* Ana Grid */}
        <div className={styles.splitGrid}>
          
          {/* Sol: Form Kartı */}
          <div className={styles.formCard}>
            <h3 className={styles.listTitle} style={{marginBottom:'20px'}}>
              {editingId ? <><Edit2 size={18} /> Rengi Düzenle</> : <><Plus size={18} /> Yeni Renk Ekle</>}
            </h3>
            
            <form onSubmit={handleSubmit} className={styles.formContent}>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Renk Adı</label>
                
                {/* Input Wrapper: İkon ve Input'u kapsar */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      className={styles.glassInput}
                      placeholder="Örn: Kırmızı, Lacivert..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{ paddingRight: '50px' }} // Sağdan ikon için boşluk bırak
                    />
                    
                    {/* Otomatik Renk Önizleme Noktası (Input içinde sağda) */}
                    {hexCode && (
                        <div 
                            title={`Algılanan Renk: ${hexCode}`}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: hexCode,
                                border: '2px solid rgba(255,255,255,0.2)',
                                boxShadow: '0 0 8px rgba(0,0,0,0.5)',
                                pointerEvents: 'none' // Tıklamayı engelle
                            }}
                        />
                    )}
                </div>

                {/* Yardımcı Mesaj */}
                {!hexCode && name.length > 2 && (
                    <span style={{ fontSize: '16px', color: '#fca5a5', marginTop: '4px', display:'block' }}>
                        Bu renk adı kütüphanede bulunamadı.
                    </span>
                )}
                {hexCode && (
                    <span style={{ fontSize: '16px', color: '#94a3b8', marginTop: '2px', display:'block' }}>
                        Algılanan Kod: <span style={{fontFamily:'monospace', color:'#fff'}}>{hexCode}</span>
                    </span>
                )}
              </div>

              {formError && <div className={styles.errorBanner}>{formError}</div>}

              <div className={styles.buttonGroup}>
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className={styles.btnCancel}>
                    <X size={18} /> İptal
                  </button>
                )}
                
                <button type="submit" className={styles.submitBtn} disabled={isLoading || !hexCode}>
                  {isLoading ? <Loader2 className={styles.spin} size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>

          {/* Sağ: Liste Kartı */}
          <div className={styles.listCard}>
            <div className={styles.listHeader}>
              <h3 className={styles.listTitle}>Mevcut Renkler</h3>
            </div>

            <div className={styles.listContent}>
              {!colors && !error && <div className={styles.loadingState}>Veriler yükleniyor...</div>}
              {colors && colors.length === 0 && <div className={styles.empty}>Henüz renk eklenmemiş.</div>}

              {colors?.map((color: any) => (
                <div key={color.id} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    {/* Liste içindeki renk topu */}
                    <span className={styles.colorDot} style={{ backgroundColor: color.hex_code || '#333' }}></span>
                    {color.name}
                  </div>
                  
                  <div className={styles.itemActions}>
                    <button onClick={() => handleEdit(color)} className={styles.actionBtnEdit}>
                      <Edit2 size={14} /> Düzenle
                    </button>
                    <button onClick={() => handleDelete(color.id)} className={styles.actionBtnDelete}>
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

export default ColorForm;