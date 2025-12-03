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

  const allVariants: (ProductVariant & { productName: string; productId: string; categoryName: string; ignoreLowStock: boolean; isLowStock: boolean })[] = [];

  products?.forEach((product) => {
    product.product_variants.forEach((variant) => {
      allVariants.push({
        ...variant,
        productName: product.name,
        productId: product.id,
        categoryName: product.category?.name || 'Kategorisiz',
        ignoreLowStock: product.ignore_low_stock,
        isLowStock: product.is_low_stock, // is_low_stock değerini ekle
      });
    });
  });

  let filteredVariants = allVariants.filter((variant) =>
    variant.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (defectFilter === 'defective') {
    filteredVariants = filteredVariants.filter(variant => variant.is_defective);
  } else if (defectFilter === 'non-defective') {
    filteredVariants = filteredVariants.filter(variant => !variant.is_defective);
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>Ürün Varyantları</h1>
        <Link href="/manage/add-product" legacyBehavior>
          <a className={styles.addButton}>Yeni Ürün Ekle</a>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
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
                <th>Defo Durumu</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.map((variant) => (
                <tr key={variant.id}>
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {variant.isLowStock && <span title="Düşük Stok!" style={{ color: 'red', fontWeight: 'bold' }}>🟢</span>}
                                        {variant.productName}
                                      </div>
                                    </td>                  <td>{variant.categoryName}</td>
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
                  <td>{variant.is_defective ? 'Evet' : 'Hayır'}</td>
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

