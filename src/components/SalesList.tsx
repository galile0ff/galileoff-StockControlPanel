import React from 'react';
import useSWR from 'swr';
import styles from '../styles/Table.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SalesList = () => {
  const { data: sales, error } = useSWR('/api/sales', fetcher);

  // Tarih formatlama fonksiyonu
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Yapılan Satışlar</h1>
      </div>

      {error && <p>Satışlar yüklenirken bir hata oluştu.</p>}
      {!sales && !error && <p>Yükleniyor...</p>}

      {sales && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ürün Detayı</th>
                <th>Adet</th>
                <th>Satış Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale: any) => (
                <tr key={sale.id}>
                  <td>
                    {sale.variant.product.name}
                    <span style={{ color: '#718096', marginLeft: '8px' }}>
                      ({sale.variant.size.name}, {sale.variant.color.name})
                    </span>
                  </td>
                  <td>{sale.quantity}</td>
                  <td>{formatDate(sale.sale_date)}</td>
                </tr>

              ))}
               {sales.length === 0 && (
                <tr>
                    <td colSpan={3}>Henüz hiç satış yapılmamış.</td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesList;
