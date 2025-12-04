import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Table.module.css';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Edit, 
  ShoppingCart,
  Loader2,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Category { id: string; name: string; }
interface Size { id: string; name: string; }
interface Color { id: string; name: string; hex_code: string; }
interface ProductVariant {
  id: string;
  stock: number;
  image_url: string | null;
  is_defective: boolean;
  size: Size;
  color: Color;
}
interface Product {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  category: Category;
  ignore_low_stock: boolean;
  is_low_stock: boolean;
  image_url: string | null;
  product_variants: ProductVariant[];
}

const ProductList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [defectFilter, setDefectFilter] = useState<'all' | 'defective' | 'non-defective'>('all');
  const [showCritical, setShowCritical] = useState(router.query.show === 'critical');
  const [sellError, setSellError] = useState<Record<string, string>>({});


  useEffect(() => {
    setShowCritical(router.query.show === 'critical');
  }, [router.query.show]);

  const swrKey = showCritical ? '/api/products?show=critical' : '/api/products';
  const { data: products, error } = useSWR<Product[]>(swrKey, fetcher);

  const handleCriticalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setShowCritical(isChecked);
    // Update URL without reloading the page
    if (isChecked) {
      router.push('/manage/products?show=critical', undefined, { shallow: true });
    } else {
      router.push('/manage/products', undefined, { shallow: true });
    }
  };

  const handleDelete = async (variantId: string) => {
    
    const res = await fetch('/api/product-variants', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId }),
    });
    if (res.ok) mutate(swrKey);
    else alert('Hata oluştu.');
  };

  const handleDeleteProduct = async (productId: string) => {
    
    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId }),
    });
    if (res.ok) mutate(swrKey);
    else {
      const errorData = await res.json();
      alert(`Hata: ${errorData.error || 'Bilinmeyen hata.'}`);
    }
  };

  const handleSold = async (variantId: string, currentStock: number) => {
    if (currentStock <= 0) {
      setSellError(prev => ({ ...prev, [variantId]: 'Stok yok!' }));
      setTimeout(() => {
        setSellError(prev => {
          const newState = { ...prev };
          delete newState[variantId];
          return newState;
        });
      }, 3000);
      return;
    }
    

    const salesRes = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
    });

    if (salesRes.ok) mutate(swrKey);
    else {
      const salesError = await salesRes.json();
      setSellError(prev => ({ ...prev, [variantId]: `Hata: ${salesError.error}` }));
       setTimeout(() => {
        setSellError(prev => {
          const newState = { ...prev };
          delete newState[variantId];
          return newState;
        });
      }, 3000);
    }
  };

  // --- Filtreleme ---
  const filteredProducts = (products || [])
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((product) => {
      let variants = product.product_variants;

      if (defectFilter !== 'all') {
        variants = variants.filter(v => defectFilter === 'defective' ? v.is_defective : !v.is_defective);
      }

      if (showCritical) {
        variants = variants.filter(v => v.stock <= 1);
      }

      return { ...product, product_variants: variants };
    });

  return (
    <div className={styles.pageWrapper}>
      
      {/* Arka Plan */}
      <div className={styles.ambientLight1} style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}></div>
      <div className={styles.ambientLight2} style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}></div>

      <div className={styles.contentContainer}>
        
        {/* Header */}
        <header className={styles.glassHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBox}>
              <Package className={styles.headerIcon} size={28} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>Ürün Listesi</h1>
              <p className={styles.pageSubtitle}>Tüm ürünleri görüntüleyin ve uygun işlemleri yapın.</p>
            </div>
          </div>
          
          <div className={styles.headerActions}>
             <div className={styles.statBadge}>
                <Sparkles size={14} className={styles.statIcon} />
                <span>Toplam Ürün: <strong>{products?.length || 0}</strong></span>
             </div>
             <Link href="/manage/add-product" legacyBehavior>
                <a className={styles.addProductBtn}>
                  <Plus size={18} /> <span>Yeni Ürün</span>
                </a>
             </Link>
          </div>
        </header>

        {/* Kontrol Paneli */}
        <div className={styles.controlsBar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Ürün adı ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.glassInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterWrapper}>
              <Filter size={18} className={styles.filterIcon} />
              <select
                value={defectFilter}
                onChange={(e) => setDefectFilter(e.target.value as any)}
                className={styles.glassSelect}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="defective">Sadece Defolular</option>
                <option value="non-defective">Sadece Sağlamlar</option>
              </select>
            </div>

            <div className={styles.switchContainer}>
              <span className={styles.switchLabel}>
                  <AlertTriangle size={14} />
                  Kritik Stok
              </span>
              <label className={styles.switch}>
                  <input 
                      type="checkbox" 
                      checked={showCritical} 
                      onChange={handleCriticalFilterChange}
                      id="critical-stock-filter"
                  />
                  <span className={styles.slider}></span>
              </label>
            </div>
          </div>

        </div>

        {/* Tablo Kartı */}
        <div className={styles.glassCard}>
          {!products && !error && (
            <div className={styles.loadingState}>
              <Loader2 className={styles.spin} size={32} />
              <p>Ürünler yükleniyor...</p>
            </div>
          )}

          {products && filteredProducts.length === 0 && (
            <div className={styles.emptyState}>
              <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
            </div>
          )}

          {filteredProducts && filteredProducts.length > 0 && (
            <div className={styles.tableResponsive}>
              <table className={`${styles.glassTable} ${styles.productTable}`}>
                <thead>
                  <tr>
                    <th>Ürün Detayı</th>
                    <th style={{ textAlign: 'center' }}>Varyant</th>
                    <th style={{ textAlign: 'center' }}>Stok</th>
                    <th style={{ textAlign: 'center' }}>Durum</th>
                    <th style={{ textAlign: 'right' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <React.Fragment key={product.id}>
                      {/* ÜRÜN ANA SATIRI */}
                      <tr className={styles.productRow}>
                        <td colSpan={5}>
                          <div className={styles.productHeader}>
                            <div className={styles.productTitleGroup}>
                              <img 
                                src={(product.image_url && product.image_url.trim()) ? product.image_url : '/assets/placeholder.svg'}
                                alt={product.name} 
                                className={styles.productThumb} 
                                style={{ objectFit: (product.image_url && product.image_url.trim()) ? 'cover' : 'contain' }}
                              />
                              <div>
                                <span className={styles.productName}>{product.name}</span>
                                <span className={styles.categoryBadge}>{product.category?.name || 'Genel'}</span>
                              </div>
                            </div>
                            
                            <div className={styles.productHeaderRight}>
                               {product.is_low_stock && (
                                 <div className={styles.lowStockBadge} title="Stoklar kontrol ediliyor!">
                                   <CheckCircle2 size={14} /> Stok Takibi Açık
                                 </div>
                               )}
                               <button 
                                 onClick={() => handleDeleteProduct(product.id)} 
                                 className={styles.actionBtnDelete}
                                 title="Ürünü ve tüm varyantları sil"
                               >
                                 <Trash2 size={16} /> <span>Ürünü Sil</span>
                               </button>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* VARYANT SATIRLARI */}
                      {product.product_variants.map((variant) => (
                        <tr key={variant.id} className={styles.variantRow}>
                          <td className={styles.indentCell}>
                            <ChevronRight size={14} className={styles.indentIcon} />
                          </td>
                          <td>
                            <div className={styles.variantInfo}>
                               <span className={styles.sizeBadge}>{variant.size?.name || '-'}</span>
                               <div className={styles.colorInfo}>
                                  <span 
                                    className={styles.colorDot} 
                                    style={{ backgroundColor: variant.color?.hex_code || '#ccc' }}
                                  ></span>
                                  {variant.color?.name || '-'}
                               </div>
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.stockBadge} ${variant.stock <= 3 ? styles.stockLow : styles.stockNormal}`}>
                              {variant.stock} Adet
                            </span>
                          </td>
                          <td>
                             {variant.is_defective ? (
                               <span className={`${styles.statusBadge} ${styles.defective}`}>
                                 <AlertTriangle size={12} /> Defolu
                               </span>
                             ) : (
                               <span className={`${styles.statusBadge} ${styles.normal}`}>
                                 <CheckCircle2 size={12} /> Sağlam
                               </span>
                             )}
                          </td>
                          <td>
                            <div className={styles.actionsCell}>
                               {sellError[variant.id] && <div className={styles.stockErrorMessage}>{sellError[variant.id]}</div>}
                              <Link href={`/manage/products/${product.id}`} legacyBehavior>
                                <a className={styles.actionBtnEdit} title="Düzenle">
                                  <Edit size={16} /> 
                                  <span className={styles.btnText}>Düzenle</span>
                                </a>
                              </Link>
                              
                              <button 
                                onClick={() => handleSold(variant.id, variant.stock)} 
                                className={styles.actionBtnSold}
                                title="Satış Yap"
                              >
                                <ShoppingCart size={16} /> 
                                <span className={styles.btnText}>Sat</span>
                              </button>

                              <button 
                                onClick={() => handleDelete(variant.id)} 
                                className={styles.actionBtnDeleteVariant}
                                title="Varyantı Sil"
                              >
                                <Trash2 size={16} />
                                <span className={styles.btnText}>Sil</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {product.product_variants.length === 0 && (
                        <tr className={styles.variantRow}>
                          <td colSpan={5} className={styles.noVariantMsg}>
                            Varyant bulunamadı.
                          </td>
                        </tr>
                      )}
                      
                      <tr className={styles.spacerRow}><td colSpan={5}></td></tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;