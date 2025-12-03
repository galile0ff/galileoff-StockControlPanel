import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import styles from '../styles/Table.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Category {
  id: string;
  name: string;
}

interface Size {
  id: string;
  name: string;
}

interface Color {
  id: string;
  name: string;
  hex_code: string;
}

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
  is_low_stock: boolean; // Yeni eklenen alan
  image_url: string | null; // Ürünün ana görsel URL'si
  product_variants: ProductVariant[];
}

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [defectFilter, setDefectFilter] = useState<'all' | 'defective' | 'non-defective'>('all');
  const { data: products, error } = useSWR<Product[]>('/api/products', fetcher);



  const handleDelete = async (variantId: string) => {
    if (!confirm('Bu varyantı kalıcı olarak silmek istediğinizden emin misiniz?')) {
      return;
    }

    const res = await fetch('/api/product-variants', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId }),
    });

    if (res.ok) {
      mutate('/api/products'); // Ürün listesini ve varyantları yeniden doğrula
    } else {
      alert('Varyant silinirken bir hata oluştu.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bu ürünü ve tüm varyantlarını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId }),
    });

    if (res.ok) {
      mutate('/api/products'); // Ürün listesini yeniden doğrula
    } else {
      const errorData = await res.json();
      alert(`Ürün silinirken bir hata oluştu: ${errorData.error || 'Bilinmeyen bir hata.'}`);
    }
  };

  const handleSold = async (variantId: string, currentStock: number) => {
    if (currentStock <= 0) {
      alert('Stok 0 veya altında olduğu için satış yapılamaz.');
      return;
    }
    if (!confirm('Bu varyanttan bir adet satıldığını onaylıyor musunuz? Satış kaydedildiğinde stok otomatik olarak 1 adet azaltılacaktır.')) {
      return;
    }

    // Directly record the sale, which also triggers stock reduction via the backend function
    const salesRes = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
    });

    if (salesRes.ok) {
      mutate('/api/products'); // Ürün listesini ve varyantları yeniden doğrula
    } else {
      const salesError = await salesRes.json();
      alert(`Satış kaydedilirken bir hata oluştu: ${salesError.error}`);
    }
  };

  let currentProducts = products ? [...products] : [];

  if (searchTerm) {
    currentProducts = currentProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const filteredProducts = currentProducts.filter((product) => {
    // If product has no variants, always include it
    if (product.product_variants.length === 0) {
      return true;
    }

    // If product has variants, include it if any variant matches the defect filter
    return product.product_variants.some((variant) => {
      if (defectFilter === 'defective') {
        return variant.is_defective;
      } else if (defectFilter === 'non-defective') {
        return !variant.is_defective;
      }
      return true; // 'all' filter, so all variants match
    });
  }).map((product) => {
      // After determining which products to show,
      // now filter the variants within those products for display
      const filteredProductVariants = product.product_variants.filter((variant) => {
        if (defectFilter === 'defective') {
          return variant.is_defective;
        } else if (defectFilter === 'non-defective') {
          return !variant.is_defective;
        }
        return true; // 'all' filter
      });
      return { ...product, product_variants: filteredProductVariants };
  });

  return (
    <div>
      <div className={styles.header}>
        <h1>Ürün Listesi</h1>
        <Link href="/manage/add-product" legacyBehavior>
          <a className={styles.addButton}>Yeni Ürün Ekle</a>
        </Link>
      </div>

      <div className={styles.flexContainer}>
        <input
          type="text"
          placeholder="Ürün adına göre ara..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={defectFilter}
          onChange={(e) => setDefectFilter(e.target.value as 'all' | 'defective' | 'non-defective')}
          className={styles.selectFilter}
        >
          <option value="all">Tümü</option>
          <option value="defective">Defolu Ürünler</option>
          <option value="non-defective">Defosuz Ürünler</option>
        </select>
      </div>

      {error && <p>Ürünler yüklenirken bir hata oluştu.</p>}
      {!products && !error && <p>Yükleniyor...</p>}
      {products && filteredProducts.length === 0 && searchTerm === '' && (
        <p>Henüz ürün bulunmamaktadır.</p>
      )}

      {filteredProducts && filteredProducts.length === 0 && searchTerm !== '' && (
        <p>Aradığınız kritere uygun ürün bulunamadı.</p>
      )}

      {filteredProducts && filteredProducts.length > 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ürün Adı / Kategori</th>
                <th>Beden</th>
                <th>Renk</th>
                <th>Stok</th>
                <th>Defo Durumu</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <React.Fragment key={product.id}>
                  <tr className={styles.productRow}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className={styles.productImage}
                          />
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {product.is_low_stock && <span title="Düşük Stok!" className={styles.lowStockIcon}>!</span>} {/* İkonu değiştirdim */}
                          <strong>{product.name}</strong> ({product.category?.name || 'Kategorisiz'})

                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            style={{ marginLeft: '10px' }} // Stil düzeltmesi
                          >
                            Ürünü Sil
                          </button>
                        </div>
                      </div>

                    </td>
                    <td colSpan={5}></td> {/* Span across variant columns */}
                  </tr>
                  {product.product_variants.map((variant) => (
                    <tr key={variant.id} className={styles.variantRow}>
                      <td></td> {/* Empty cell for alignment under product name */}
                      <td>{variant.size?.name || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '15px',
                              height: '15px',
                              backgroundColor: variant.color?.hex_code || '#ccc',
                              border: '1px solid var(--color-border)', // Yeni stil
                              borderRadius: '3px',
                            }}
                          ></span>
                          {variant.color?.name || '-'}
                        </div>
                      </td>
                      <td>{variant.stock}</td>
                      <td>{variant.is_defective ? 'Evet' : 'Hayır'}</td>
                      <td>
                        <div className={styles.buttonGroup}>
                          <Link href={`/manage/products/${product.id}`} legacyBehavior>
                            <a className={styles.actionButton}>Düzenle</a>
                          </Link>
                          <button onClick={() => handleSold(variant.id, variant.stock)} className={`${styles.actionButton} ${styles.soldButton}`}>
                            Satıldı
                          </button>
                          <button onClick={() => handleDelete(variant.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList;