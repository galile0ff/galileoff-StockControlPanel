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
  price: number;
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
  product_variants: ProductVariant[];
}

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleSold = async (variantId: string, currentStock: number) => {
    if (currentStock <= 0) {
      alert('Stok 0 veya altında olduğu için satış yapılamaz.');
      return;
    }
    if (!confirm('Bu varyanttan bir adet satıldığını onaylıyor musunuz? Stok 1 adet azaltılacaktır.')) {
      return;
    }

    const res = await fetch('/api/product-variants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, stock: currentStock - 1 }),
    });

    if (res.ok) {
      mutate('/api/products'); // Ürün listesini ve varyantları yeniden doğrula
    } else {
      alert('Varyant stok güncellenirken bir hata oluştu.');
    }
  };

  const allVariants: (ProductVariant & { productName: string; productId: string; categoryName: string })[] = [];

  products?.forEach((product) => {
    product.product_variants.forEach((variant) => {
      allVariants.push({
        ...variant,
        productName: product.name,
        productId: product.id,
        categoryName: product.category?.name || 'Kategorisiz',
      });
    });
  });

  const filteredVariants = allVariants.filter((variant) =>
    variant.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className={styles.header}>
        <h1>Ürün Varyantları</h1>
        <Link href="/manage/add-product" legacyBehavior>
          <a className={styles.addButton}>Yeni Ürün Ekle</a>
        </Link>
      </div>

      <input
        type="text"
        placeholder="Ürün adına göre ara..."
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {error && <p>Ürünler yüklenirken bir hata oluştu.</p>}
      {!products && !error && <p>Yükleniyor...</p>}
      {products && allVariants.length === 0 && <p>Henüz ürün varyantı bulunmamaktadır.</p>}

      {filteredVariants && filteredVariants.length === 0 && searchTerm !== '' && (
        <p>Aradığınız kritere uygun ürün varyantı bulunamadı.</p>
      )}

      {filteredVariants && filteredVariants.length > 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ürün Adı</th>
                <th>Kategori</th>
                <th>Beden</th>
                <th>Renk</th>
                <th>Stok</th>
                <th>Fiyat</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.map((variant) => (
                <tr key={variant.id}>
                  <td>{variant.productName}</td>
                  <td>{variant.categoryName}</td>
                  <td>{variant.size?.name || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '15px',
                          height: '15px',
                          backgroundColor: variant.color?.hex_code || '#ccc',
                          border: '1px solid #000',
                          borderRadius: '3px',
                        }}
                      ></span>
                      {variant.color?.name || '-'}
                    </div>
                  </td>
                  <td>{variant.stock}</td>
                  <td>{variant.price.toFixed(2)}</td>
                  <td>
                    <div className={styles.buttonGroup}>
                      {/* Varyant düzenleme sayfası henüz yok, bu yüzden product.id'ye yönlendiriyoruz */}
                      <Link href={`/manage/products/${variant.productId}`} legacyBehavior>
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
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList;

