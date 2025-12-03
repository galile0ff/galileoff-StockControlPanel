import React from 'react';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import styles from '../styles/Table.module.css'; // Genel tablo stillerini kullanacağız

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ProductList = () => {
  const { data: products, error } = useSWR('/api/products', fetcher);

  const handleDelete = async (productId: string) => {
    if (!confirm('Bu ürünü ve ilişkili tüm varyantlarını kalıcı olarak silmek istediğinizden emin misiniz?')) {
      return;
    }

    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId }),
    });

    if (res.ok) {
      // Listeyi yeniden doğrulamak için SWR'nin mutate fonksiyonunu kullanıyoruz
      mutate('/api/products');
    } else {
      alert('Ürün silinirken bir hata oluştu.');
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Ürünler</h1>
        <Link href="/manage/add-product" legacyBehavior>
          <a className={styles.addButton}>Yeni Ürün Ekle</a>
        </Link>
      </div>

      {error && <p>Ürünler yüklenirken bir hata oluştu.</p>}
      {!products && !error && <p>Yükleniyor...</p>}

      {products && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ürün Adı</th>
                <th>Açıklama</th>
                <th>Kategori</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.description || '-'}</td>
                  <td>{product.category?.name || 'Kategorisiz'}</td>
                  <td>
                    <div className={styles.buttonGroup}>
                      <Link href={`/manage/products/${product.id}`} legacyBehavior>
                        <a className={styles.actionButton}>Detay/Düzenle</a>
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>
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

