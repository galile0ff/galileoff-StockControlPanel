import React, { useState, useEffect, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import Link from 'next/link';

// CSS Modülleri
import styles from '../../../components/Form.module.css'; // Form stilleri
import tableStyles from '../../../styles/Table.module.css'; // Tablo stilleri

// İkonlar
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Plus, 
  Package, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  UploadCloud, 
  Loader2,
  Edit3,
  Check,
  AlertTriangle
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// #region 1. Component: Ürün Detay Düzenleme Formu
function EditProductDetails({ product, setNotification }: { product: any, setNotification: (notification: { message: string; type: 'success' | 'error' } | null) => void }) {
  const { data: categories } = useSWR('/api/categories', fetcher);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [categoryId, setCategoryId] = useState(product.category?.id || '');
  const [ignoreLowStock, setIgnoreLowStock] = useState(product.ignore_low_stock || false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product.image_url || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageFile) {
        setImagePreview(product.image_url || null);
    }
  }, [product.image_url]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        let res;
        if (imageFile) {
          const formData = new FormData();
          formData.append('id', product.id);
          formData.append('name', name);
          formData.append('description', description);
          formData.append('category_id', categoryId || '');
          formData.append('ignore_low_stock', String(ignoreLowStock));
          formData.append('image', imageFile);

          res = await fetch('/api/products', { method: 'PUT', body: formData });
        } else {
          res = await fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: product.id,
              name,
              description,
              category_id: categoryId,
              ignore_low_stock: ignoreLowStock,
              image_url: imagePreview === null ? null : undefined,
            }),
          });
        }

        if (res.ok) {
          mutate(`/api/products?id=${product.id}`);
          setNotification({ message: 'Ürün güncellendi.', type: 'success' });
        } else {
          const errorData = await res.json();
          setNotification({ message: `Hata: ${errorData.error}`, type: 'error' });
        }
    } catch (error) {
        setNotification({ message: 'Bir ağ hatası oluştu.', type: 'error' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className={styles.glassCard}>
      <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
         <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
            <Package size={20} color="#6366f1" /> Temel Bilgiler
         </h2>
      </div>

      <form onSubmit={handleUpdateDetails} className={styles.formContent}>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}><Package size={14} /> Ürün Adı</label>
            <input className={styles.glassInput} value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}><Layers size={14} /> Kategori</label>
            <select className={styles.glassSelect} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              <option value="">Kategori Seç</option>
              {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><FileText size={14} /> Açıklama</label>
          <textarea className={styles.glassTextarea} value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>

        <div className={styles.formGroup}>
            <label className={styles.label}><ImageIcon size={14} /> Ürün Görseli</label>
            <div className={styles.imageUploadWrapper}>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className={styles.hiddenFileInput} id="edit-product-image" />
                
                {!imagePreview ? (
                     <label htmlFor="edit-product-image" className={styles.uploadBox}>
                        <div className={styles.uploadIconCircle}><UploadCloud size={24} /></div>
                        <span className={styles.uploadText}>Görsel Yükle</span>
                     </label>
                ) : (
                    <div className={styles.previewContainer} style={{ height: '200px' }}>
                        <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                        <button type="button" onClick={handleRemoveImage} className={styles.removeImageBtn}>
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div className={`${styles.formGroup} ${styles.switchContainer}`}>
             <span className={styles.switchLabel} style={{ color: '#cbd5e1' }}>
                Düşük Stok Uyarısını Yoksay
             </span>
             <label className={styles.switch}>
                <input 
                    type="checkbox" 
                    checked={ignoreLowStock} 
                    onChange={(e) => setIgnoreLowStock(e.target.checked)} 
                />
                <span className={styles.slider}></span>
            </label>
        </div>

        <div className={styles.formFooter}>
             <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                 {isLoading ? <Loader2 className={styles.spin} size={18} /> : <Save size={18} />} 
                 Bilgileri Güncelle
             </button>
        </div>
      </form>
    </div>
  );
}
// #endregion

// #region 2. Component: Yeni Varyant Ekleme Formu
function AddVariantForm({ productId, setNotification }: { productId: string, setNotification: (notification: { message: string; type: 'success' | 'error' } | null) => void }) {
    const { data: sizes } = useSWR('/api/sizes', fetcher);
    const { data: colors } = useSWR('/api/colors', fetcher);
    const [sizeId, setSizeId] = useState('');
    const [colorId, setColorId] = useState('');
    const [stock, setStock] = useState('');
    const [isDefective, setIsDefective] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const handleAddVariant = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
  
      try {
        const res = await fetch('/api/product-variants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              product_id: productId,
              size_id: sizeId,
              color_id: colorId,
              stock: parseInt(stock, 10) || 0,
              is_defective: isDefective,
          }),
        });
    
        if (res.ok) {
          setSizeId(''); setColorId(''); setStock(''); setIsDefective(false);
          mutate(`/api/products?id=${productId}`);
          setNotification({ message: 'Yeni varyant eklendi.', type: 'success' });
        } else {
          const errorData = await res.json();
          setNotification({ message: `Hata: ${errorData.error}`, type: 'error' });
        }
      } catch (error) {
        setNotification({ message: 'Bir ağ hatası oluştu.', type: 'error' });
      }
      setIsSubmitting(false);
    };

    return (
        <div className={styles.glassCard}>
            <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                    <Plus size={20} color="#6366f1" /> Yeni Varyant Ekle
                </h2>
            </div>
            
            <form onSubmit={handleAddVariant} className={styles.formContent}>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Beden</label>
                        <select className={styles.glassSelect} value={sizeId} onChange={e => setSizeId(e.target.value)} required>
                            <option value="">Seç</option>
                            {sizes?.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Renk</label>
                        <select className={styles.glassSelect} value={colorId} onChange={e => setColorId(e.target.value)} required>
                            <option value="">Seç</option>
                            {colors?.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Stok</label>
                        <input className={styles.glassInput} type="text" inputMode="numeric" value={stock} onChange={e => setStock(e.target.value.replace(/[^0-9]/g, ''))} required />
                    </div>
                </div>

                <div className={`${styles.formGroup} ${styles.switchContainer}`}>
                    <span className={styles.switchLabel} style={{ color: '#fca5a5' }}>
                        <AlertTriangle size={16} /> 
                        Defolu Ürün Olarak İşaretle
                    </span>
                    <label className={styles.switch}>
                        <input 
                            type="checkbox" 
                            checked={isDefective} 
                            onChange={(e) => setIsDefective(e.target.checked)} 
                        />
                        <span className={`${styles.slider} ${styles.defectiveSlider}`}></span>
                    </label>
                </div>

                <div className={styles.formFooter}>
                     <button type="submit" className={styles.submitBtn} disabled={isSubmitting} style={{ background: '#22c55e' }}>
                        {isSubmitting ? <Loader2 className={styles.spin} size={18} /> : <Plus size={18} />} 
                        Varyantı Ekle
                     </button>
                </div>
            </form>
        </div>
    )
}
// #endregion

// #region 3. Component: Varyant Satırı
function VariantRow({ variant, onDelete, onUpdate }: { variant: any, onDelete: (id: string) => void, onUpdate: (id: string, stock: number, isDefective: boolean) => void }) {
    const [stock, setStock] = useState(String(variant.stock));
    const [isDefective, setIsDefective] = useState(variant.is_defective || false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setStock(String(variant.stock));
        setIsDefective(variant.is_defective || false);
    }, [variant]);

    const handleSave = () => {
        const stockAsNumber = parseInt(stock, 10) || 0;
        onUpdate(variant.id, stockAsNumber, isDefective);
        setIsEditing(false);
    }
    
    return (
        <tr className={tableStyles.variantRow}>
            <td>{variant.size?.name || '-'}</td>
            <td>
                <div style={{display:'flex', alignItems:'center', justifyContent: 'flex-end', gap:'6px'}}> 
                   {variant.color?.name || '-'}
                   <span style={{width: 12, height: 12, borderRadius: '50%', background: variant.color?.hex_code, border: '1px solid #fff'}}></span>
                </div>
            </td>
            <td>
                {isEditing ? (
                    <input 
                        type="text" 
                        value={stock} 
                        onChange={e => setStock(e.target.value.replace(/[^0-9]/g, ''))} 
                        style={{ background:'#000', border:'1px solid #444', color:'#fff', padding:'4px', borderRadius:'6px', width:'60px', textAlign:'right' }}
                    />
                ) : (
                    <span className={tableStyles.stockBadge} style={{background: 'rgba(255,255,255,0.1)'}}>{stock}</span>
                )}
            </td>
            <td>
                {isEditing ? (
                    <input type="checkbox" checked={isDefective} onChange={(e) => setIsDefective(e.target.checked)} />
                ) : (
                    isDefective ? 
                    <span className={`${tableStyles.statusBadge} ${tableStyles.defective}`}>Defolu</span> : 
                    <span className={`${tableStyles.statusBadge} ${tableStyles.normal}`}>Normal</span>
                )}
            </td>
            <td>
                <div className={tableStyles.actionsCell}>
                    {isEditing ? (
                         <button onClick={handleSave} className={tableStyles.actionBtnSold} title="Kaydet"><Check size={16} /></button>
                    ) : (
                         <button onClick={() => setIsEditing(true)} className={tableStyles.actionBtnEdit} title="Düzenle"><Edit3 size={16} /></button>
                    )}
                    <button onClick={() => onDelete(variant.id)} className={tableStyles.actionBtnDelete} title="Sil"><Trash2 size={16} /></button>
                </div>
            </td>
        </tr>
    )
}
// #endregion

const ProductDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: product, error: productError } = useSWR(id ? `/api/products?id=${id}` : null, fetcher);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000); // 4 saniyeye çıkarıldı
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Bu varyantı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;
    
    try {
        const res = await fetch('/api/product-variants', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: variantId }),
        });
        if (res.ok) {
            mutate(`/api/products?id=${id}`);
            setNotification({ message: 'Varyant silindi.', type: 'success' });
        } else {
            const errorData = await res.json();
            setNotification({ message: `Hata: ${errorData.error}`, type: 'error' });
        }
    } catch (error) {
        setNotification({ message: 'Bir ağ hatası oluştu.', type: 'error' });
    }
  }

  const handleUpdateVariant = async (variantId: string, stock: number, isDefective: boolean) => {
    try {
        const res = await fetch('/api/product-variants', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: variantId, stock, is_defective: isDefective }),
        });
        if (res.ok) {
            mutate(`/api/products?id=${id}`);
            setNotification({ message: 'Varyant güncellendi.', type: 'success' });
        } else {
            const errorData = await res.json();
            setNotification({ message: `Hata: ${errorData.error}`, type: 'error' });
        }
    } catch (error) {
        setNotification({ message: 'Bir ağ hatası oluştu.', type: 'error' });
    }
  }

  if (productError) return <div style={{color:'#fff', padding:'40px', textAlign:'center'}}>Veri yüklenemedi.</div>;
  if (!product) return <div style={{color:'#fff', padding:'40px', textAlign:'center'}}>Yükleniyor...</div>;

  return (
    <div className={styles.pageWrapper}>
        {/* === BİLDİRİM ALANI === */}
        {notification && (
            <div style={{
                position: 'fixed',
                top: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '12px 24px',
                borderRadius: '8px',
                color: '#fff',
                backgroundColor: notification.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${notification.type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)'}`,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                zIndex: 1000,
                textAlign: 'center',
                minWidth: '250px',
                maxWidth: '90%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                {notification.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
                {notification.message}
            </div>
      )}

      <div className={styles.ambientLight1}></div>
      <div className={styles.ambientLight2}></div>

      <div className={styles.contentContainer}>
          
          <header className={styles.glassHeader}>
            <div className={styles.headerLeft}>
                <Link href="/manage/products" legacyBehavior>
                    <a className={styles.iconBox} style={{cursor:'pointer'}}><ArrowLeft size={24} /></a>
                </Link>
                <div>
                    <h1 className={styles.pageTitle}>{product.name}</h1>
                    <p className={styles.pageSubtitle}>Ürün detaylarını ve varyantlarını yönet</p>
                </div>
            </div>
          </header>

          <EditProductDetails product={product} setNotification={setNotification} />

          <div className={tableStyles.glassCard}>
              <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                 <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                    <Layers size={20} color="#6366f1" /> Mevcut Varyantlar
                 </h2>
              </div>

              <div className={tableStyles.tableResponsive}>
                  <table className={tableStyles.glassTable}>
                      <thead>
                          <tr>
                              <th style={{textAlign:'left'}}>Beden</th>
                              <th style={{textAlign:'right'}}>Renk</th>
                              <th style={{textAlign:'right'}}>Stok</th>
                              <th style={{textAlign:'right'}}>Durum</th>
                              <th style={{textAlign:'right'}}>İşlemler</th>
                          </tr>
                      </thead>
                      <tbody>
                          {product.product_variants && product.product_variants.length > 0 ? (
                            product.product_variants.map((variant: any) => (
                              <VariantRow 
                                  key={variant.id} 
                                  variant={variant}
                                  onDelete={handleDeleteVariant}
                                  onUpdate={handleUpdateVariant}
                              />
                            ))
                          ) : (
                              <tr className={tableStyles.variantRow}>
                                <td colSpan={5} style={{textAlign:'center', padding:'30px', color:'#64748b'}}>
                                    Henüz varyant eklenmemiş.
                                </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
          
          <AddVariantForm productId={product.id} setNotification={setNotification} />

      </div>
    </div>
  );
};

export default ProductDetailPage;