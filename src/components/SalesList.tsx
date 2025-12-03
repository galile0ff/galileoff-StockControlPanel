import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import styles from '../styles/Table.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SalesList = () => {
  const [selectedFilter, setSelectedFilter] = useState('hepsi');
  const [calculatedStartDate, setCalculatedStartDate] = useState('');
  const [calculatedEndDate, setCalculatedEndDate] = useState('');

  useEffect(() => {
    const today = new Date();
    let start = '';
    let end = today.toISOString().split('T')[0]; // Bugünün tarihi YYYY-MM-DD

    switch (selectedFilter) {
      case 'son_3_gun':
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        start = threeDaysAgo.toISOString().split('T')[0];
        break;
      case 'son_1_hafta':
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        start = oneWeekAgo.toISOString().split('T')[0];
        break;
      case 'son_1_ay':
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        start = oneMonthAgo.toISOString().split('T')[0];
        break;
      case 'hepsi':
      default:
        start = ''; // Tüm zamanlar için boş bırak
        end = ''; // Tüm zamanlar için boş bırak
        break;
    }
    setCalculatedStartDate(start);
    setCalculatedEndDate(end);
  }, [selectedFilter]);

  const swrKey = `/api/sales?${calculatedStartDate ? `startDate=${calculatedStartDate}&` : ''}${calculatedEndDate ? `endDate=${calculatedEndDate}` : ''}`;
  const { data, error } = useSWR(swrKey, fetcher);
  const sales = data?.sales;
  const totalSalesCount = data?.totalCount;

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
        {totalSalesCount !== undefined && (
          <p>Toplam Satış Sayısı: {totalSalesCount}</p>
        )}
        <div className={styles.filterOptions}>
          <label htmlFor="dateFilter">Filtrele:</label>
          <select
            id="dateFilter"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="hepsi">Hepsi</option>
            <option value="son_3_gun">Son 3 Gün</option>
            <option value="son_1_hafta">Son 1 Hafta</option>
            <option value="son_1_ay">Son 1 Ay</option>
          </select>
        </div>
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
                <th>Defo Durumu</th>
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
                  <td>{sale.variant.is_defective ? 'Evet' : 'Hayır'}</td>
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
