import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Table.module.css';
import formStyles from '../styles/Form.module.css';
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
  stock_sound: number;
  stock_defective: number;
  image_url: string | null;
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
  const [isSaleModalOpen, setSaleModalOpen] = useState(false);
  const [saleModalInfo, setSaleModalInfo] = useState<{ product: Product; variant: ProductVariant } | null>(null);
  const [showCritical, setShowCritical] = useState(router.query.show === 'critical');

  useEffect(() => {
    setShowCritical(router.query.show === 'critical');
  }, [router.query.show]);

  const swrKey = showCritical ? '/api/products?show=critical' : '/api/products';
  const { data: products, error } = useSWR<Product[]>(swrKey, fetcher);

  const handleCriticalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setShowCritical(isChecked);
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

  const openSaleModal = (product: Product, variant: ProductVariant) => {
    setSaleModalInfo({ product, variant });
    setSaleModalOpen(true);
  };

  const handleSold = async (variantId: string, saleType: 'sound' | 'defective') => {
    const salesRes = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant_id: variantId, quantity: 1, sale_type: saleType }),
    });

    if (salesRes.ok) {
      mutate(swrKey);
      setSaleModalOpen(false);
      setSaleModalInfo(null);
    } else {
      const salesError = await salesRes.json();
      alert(`Satış sırasında hata oluştu: ${salesError.error || 'Bilinmeyen bir hata oluştu.'}`);
      setSaleModalOpen(false);
      setSaleModalInfo(null);
    }
  };

  // --- Filtreleme --- //
  const filteredProducts = (products || [])
  .filter(product => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;

    const nameMatch = product.name.toLowerCase().includes(term);
    const categoryMatch = product.category && product.category.name.toLowerCase().includes(term);
    const variantMatch = product.product_variants.some(v => 
        (v.size && v.size.name.toLowerCase().includes(term)) ||
        (v.color && v.color.name.toLowerCase().includes(term))
    );

    return nameMatch || categoryMatch || variantMatch;
  })
  .map(product => {
    const newProduct = JSON.parse(JSON.stringify(product));
    const term = searchTerm.toLowerCase();

    if (term) {
        const isProductLevelMatch = newProduct.name.toLowerCase().includes(term) ||
                                    (newProduct.category && newProduct.category.name.toLowerCase().includes(term));
        
        if (!isProductLevelMatch) {
            newProduct.product_variants = newProduct.product_variants.filter((v: ProductVariant) => 
                (v.size && v.size.name.toLowerCase().includes(term)) ||
                (v.color && v.color.name.toLowerCase().includes(term))
            );
        }
    }
    
    let variants = newProduct.product_variants;
    if (defectFilter !== 'all') {
        variants = variants.filter((v: ProductVariant) => defectFilter === 'defective' ? v.stock_defective > 0 : v.stock_defective === 0);
    }
    if (showCritical) {
        variants = variants.filter((v: ProductVariant) => v.stock_sound <= 1);
    }
    newProduct.product_variants = variants;
    
    return newProduct;
  });

  return (
    <div className={formStyles.pageWrapper}>
      
      {/* Arka Plan */}
      <div className={formStyles.ambientLight1} style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}></div>
      <div className={formStyles.ambientLight2} style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}></div>

      <div className={formStyles.contentContainer}>
        <header className={formStyles.glassHeader}>
          <div className={formStyles.headerLeft}>
            <div className={formStyles.iconBox}>
              <Package className={formStyles.headerIcon} size={28} />
            </div>
            <div>
              <h1 className={formStyles.pageTitle}>Ürün Listesi</h1>
              <p className={formStyles.pageSubtitle}>Tüm ürünleri görüntüleyin ve uygun işlemleri yapın.</p>
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
              <p>Ürün eklemeyi deneyebilirsin.</p>
            </div>
          )}

          {filteredProducts && filteredProducts.length > 0 && (
            <div className={styles.tableResponsive}>
              <table className={`${styles.glassTable} ${styles.productTable}`}>
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'right' }}></th>
                    <th>Varyant</th>
                    <th style={{ textAlign: 'center' }}>Sağlam Stok</th>
                    <th style={{ textAlign: 'center' }}>Defolu Stok</th>
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
                                src={(product.image_url && product.image_url.trim()) ? product.image_url : '/assets/logo.svg'}
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
                            <span className={`${styles.stockBadge} ${variant.stock_sound <= 3 ? styles.stockLow : styles.stockNormal}`}>
                              {variant.stock_sound} Adet
                            </span>
                          </td>
                          <td>
                             <span className={`${styles.stockBadge} ${styles.defective}`}>
                               {variant.stock_defective} Adet
                             </span>
                          </td>
                          <td>
                            <div className={styles.actionsCell}>
                              <Link href={`/manage/products/${product.id}`} legacyBehavior>
                                <a className={styles.actionBtnEdit} title="Düzenle">
                                  <Edit size={16} /> 
                                  <span className={styles.btnText}>Düzenle</span>
                                </a>
                              </Link>
                              
                              <button 
                                onClick={() => openSaleModal(product, variant)} 
                                className={styles.actionBtnSold}
                                title="Satış Yap"
                                disabled={variant.stock_sound <= 0 && variant.stock_defective <= 0}
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
      
      {isSaleModalOpen && saleModalInfo && (
        <div className={formStyles.modalOverlay} onClick={() => setSaleModalOpen(false)}>
          <div className={formStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            <div className={formStyles.modalHeader}>
              <div className={formStyles.modalProductImage}>
                <img 
                  src={(saleModalInfo.product.image_url || '/assets/logo.svg')}
                  alt={saleModalInfo.product.name} 
                />
              </div>
              <div className={formStyles.modalProductDetails}>
                <h3 className={formStyles.modalTitle}>Satış Yap</h3>
                <p className={formStyles.modalProductName}>{saleModalInfo.product.name}</p>
                <div className={formStyles.modalVariantBadge}>
                  <span>{saleModalInfo.variant.size.name}</span>
                  <span style={{opacity: 0.3}}>•</span>
                  <span style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
                    <span className={styles.colorDot} style={{ backgroundColor: saleModalInfo.variant.color.hex_code || '#ccc' }}></span>
                    <span>{saleModalInfo.variant.color.name}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className={formStyles.modalSectionTitle}>Satılacak Stoğu Seçin</div>
            
            <div className={formStyles.modalStockInfo}>
              <div className={formStyles.stockItem}>
                <div className={formStyles.stockLabel}>SAĞLAM STOK</div>
                <div className={formStyles.stockValue}>{saleModalInfo.variant.stock_sound} Adet</div>
              </div>
              <div className={formStyles.stockItem}>
                <div className={formStyles.stockLabel}>DEFOLU STOK</div>
                <div className={formStyles.stockValue}>{saleModalInfo.variant.stock_defective} Adet</div>
              </div>
            </div>

            <div className={formStyles.modalActions}>
              <button
                onClick={() => handleSold(saleModalInfo.variant.id, 'sound')}
                className={`${formStyles.modalButton} ${formStyles.btnSound}`}
                disabled={saleModalInfo.variant.stock_sound <= 0}
              >
                <CheckCircle2 size={16}/>
                Sağlam Sat
              </button>
              <button
                onClick={() => handleSold(saleModalInfo.variant.id, 'defective')}
                className={`${formStyles.modalButton} ${formStyles.btnDefective}`}
                disabled={saleModalInfo.variant.stock_defective <= 0}
              >
                <AlertTriangle size={16}/>
                Defolu Sat
              </button>
              <button
                onClick={() => {
                  setSaleModalOpen(false);
                  setSaleModalInfo(null);
                }}
                className={`${formStyles.modalButton} ${formStyles.modalCloseBtn}`}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;