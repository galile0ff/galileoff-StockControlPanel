import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import React, { useState, useEffect } from 'react';
import styles from '../../../components/Form.module.css';
import tableStyles from '../../../styles/Table.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// #region Alt Componentler (Sub-components)

// Ürünün ana bilgilerini (ad, kategori vb.) düzenleyen form
function EditProductDetails({ product }: { product: any }) {
  const { data: categories } = useSWR('/api/categories', fetcher);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [categoryId, setCategoryId] = useState(product.category?.id || '');
  const [ignoreLowStock, setIgnoreLowStock] = useState(product.ignore_low_stock || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, name, description, category_id: categoryId, ignore_low_stock: ignoreLowStock }),
    });
    if (res.ok) {
        alert('Ürün bilgileri güncellendi.');
        mutate(`/api/products?id=${product.id}`);
    } else {
        alert('Hata: Bilgiler güncellenemedi.');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleUpdateDetails} className={styles.form}>
        <h2>Ürün Bilgileri</h2>
        <div className={styles.formGrid}>
            {/* Form alanları... */}
            <div className={styles.formField}>
                <label>Ürün Adı</label>
                <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className={styles.formField}>
                <label>Kategori</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    <option value="">Kategori Seç</option>
                    {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div className={`${styles.formField} ${styles.fullWidth}`}>
                <label>Açıklama</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>
            <div className={styles.formField}>
                <label className={styles.checkboxLabel}>
                    <input 
                        type="checkbox" 
                        checked={ignoreLowStock} 
                        onChange={(e) => setIgnoreLowStock(e.target.checked)} 
                    />
                    Düşük Stok Uyarısını Yoksay
                </label>
            </div>
        </div>
        <div className={styles.formActions}>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Kaydediliyor...' : 'Bilgileri Güncelle'}</button>
        </div>
    </form>
  );
}

// Yeni varyant ekleme formu
function AddVariantForm({ productId }: { productId: string }) {
    const { data: sizes } = useSWR('/api/sizes', fetcher);
    const { data: colors } = useSWR('/api/colors', fetcher);
    const [sizeId, setSizeId] = useState('');
    const [colorId, setColorId] = useState('');
    const [stock, setStock] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [variantError, setVariantError] = useState<string | null>(null);
  
    const handleAddVariant = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setVariantError(null);
  
      const res = await fetch('/api/product-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            product_id: productId, 
            size_id: sizeId, 
            color_id: colorId, 
            stock: parseInt(stock, 10) || 0,
        }),
      });
  
      if (res.ok) {
        setSizeId(''); setColorId(''); setStock('');
        mutate(`/api/products?id=${productId}`);
      } else {
        const err = await res.json();
        setVariantError(err.error || 'Varyant eklenemedi.');
      }
      setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleAddVariant} className={styles.form} style={{ marginTop: '2rem' }}>
            <h2>Yeni Varyant Ekle</h2>
            <div className={styles.formGrid}>
                {/* Form alanları... */}
                <div className={styles.formField}>
                    <label>Beden</label>
                    <select value={sizeId} onChange={e => setSizeId(e.target.value)} required>
                        <option value="">Seç</option>
                        {sizes?.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className={styles.formField}>
                    <label>Renk</label>
                    <select value={colorId} onChange={e => setColorId(e.target.value)} required>
                        <option value="">Seç</option>
                        {colors?.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className={styles.formField}>
                    <label>Stok</label>
                    <input type="text" inputMode="numeric" value={stock} onChange={e => setStock(e.target.value.replace(/[^0-9]/g, ''))} required />
                </div>
            </div>
            {variantError && <p className={styles.formError}>{variantError}</p>}
            <div className={styles.formActions}>
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Ekleniyor...' : 'Varyant Ekle'}</button>
            </div>
      </form>
    )
}

// #endregion

// Ana Sayfa Component'i
const ProductDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: product, error } = useSWR(id ? `/api/products?id=${id}` : null, fetcher);

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Bu varyantı silmeye cidden kararlı mısın, yoksa sadece tık oyunu mu bu?')) return;
    const res = await fetch('/api/product-variants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId }),
    });
    if (res.ok) {
        mutate(`/api/products?id=${id}`);
    } else {
        alert('Hata: Varyant silinemedi.');
    }
  }

  const handleUpdateVariant = async (variantId: string, stock: number) => {
    const res = await fetch('/api/product-variants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, stock }),
    });
    if (res.ok) {
        alert('Varyant güncellendi.');
        mutate(`/api/products?id=${id}`);
    } else {
        alert('Hata: Varyant güncellenemedi.');
    }
  }

  if (error) return <div>Veri yüklenemedi.</div>;
  if (!product) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h1>Ürün Düzenle</h1>
      
      <EditProductDetails product={product} />

      <div className={tableStyles.tableContainer} style={{ marginTop: '2rem' }}>
        <h2>Ürün Varyantları</h2>
        <table className={tableStyles.table}>
            <thead>
                <tr><th>Beden</th><th>Renk</th><th>Stok</th><th>İşlemler</th></tr>
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
                    <tr><td colSpan={4}>Bu ürüne ait varyant bulunamadı.</td></tr>
                )}
            </tbody>
        </table>
      </div>
      
      <AddVariantForm productId={product.id} />
    </div>
  );
};

// Her bir varyant satırını temsil eden component
function VariantRow({ variant, onDelete, onUpdate }: { variant: any, onDelete: (id: string) => void, onUpdate: (id: string, stock: number) => void }) {
    const [stock, setStock] = useState(String(variant.stock));
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setStock(String(variant.stock));
    }, [variant]);

    const handleSave = () => {
        const stockAsNumber = parseInt(stock, 10) || 0;
        onUpdate(variant.id, stockAsNumber);
        setIsEditing(false);
    }
    
    return (
        <tr>
            <td>{variant.size?.name || '-'}</td>
            <td>{variant.color?.name || '-'}</td>
            <td>
                {isEditing ? (
                    <input className={styles.tableInput} type="text" inputMode="numeric" value={stock} onChange={e => setStock(e.target.value.replace(/[^0-9]/g, ''))} />
                ) : (
                    stock
                )}
            </td>
            <td>
                {isEditing ? (
                    <button onClick={handleSave} className={tableStyles.actionButton} style={{backgroundColor: '#38A169'}}>Kaydet</button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className={tableStyles.actionButton}>Düzenle</button>
                )}
                <button onClick={() => onDelete(variant.id)} className={tableStyles.actionButton} style={{backgroundColor: '#E53E3E', marginLeft: '10px'}}>Sil</button>
            </td>
        </tr>
    )
}

export default ProductDetailPage;
