import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import styles from '../styles/Table.module.css'; 
import { 
  ShoppingCart, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Loader2, 
  Sparkles,
  Tag
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SalesList = () => {
  const [selectedFilter, setSelectedFilter] = useState('hepsi');
  const [calculatedStartDate, setCalculatedStartDate] = useState('');
  const [calculatedEndDate, setCalculatedEndDate] = useState('');

  useEffect(() => {
    const today = new Date();
    let start = '';
    let end = today.toISOString().split('T')[0];

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
        start = '';
        end = '';
        break;
    }
    setCalculatedStartDate(start);
    setCalculatedEndDate(end);
  }, [selectedFilter]);

  const swrKey = `/api/sales?${calculatedStartDate ? `startDate=${calculatedStartDate}&` : ''}${calculatedEndDate ? `endDate=${calculatedEndDate}` : ''}`;
  const { data, error } = useSWR(swrKey, fetcher);
  const sales = data?.sales;
  const totalSalesCount = data?.totalCount;

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientLight1} style={{ background: '#10b981' }}></div>
      <div className={styles.ambientLight2} style={{ background: '#0ea5e9' }}></div>

      <div className={styles.contentContainer}>
        
        <header className={styles.glassHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBox} style={{ color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)' }}>
              <ShoppingCart size={28} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>Satış Geçmişi</h1>
              <p className={styles.pageSubtitle}>Gerçekleşen satışları inceleyin</p>
            </div>
          </div>
          
          <div className={styles.statBadge}>
            <Sparkles size={14} className={styles.statIcon} />
            <span>Toplam Satış: <strong>{totalSalesCount ?? 0}</strong></span>
          </div>
        </header>

        <div className={styles.controlsBar}>
          <div className={styles.filterWrapper}>
            <Filter size={18} className={styles.filterIcon} />
            <select
              id="dateFilter"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className={styles.glassSelect}
            >
              <option value="hepsi">Tüm Zamanlar</option>
              <option value="son_3_gun">Son 3 Gün</option>
              <option value="son_1_hafta">Son 1 Hafta</option>
              <option value="son_1_ay">Son 1 Ay</option>
            </select>
          </div>
        </div>

        <div className={styles.glassCard}>
          {!sales && !error && (
            <div className={styles.loadingState}>
              <Loader2 className={styles.spin} size={32} />
              <p>Yükleniyor...</p>
            </div>
          )}

          {error && <div className={styles.errorState}>Hata oluştu.</div>}

          {sales && sales.length === 0 && (
            <div className={styles.emptyState}>
              <Package size={40} style={{ marginBottom: 10, opacity: 0.5 }} />
              <p>Bu tarih aralığında satış bulunamadı.</p>
            </div>
          )}

          {sales && sales.length > 0 && (
            <div className={styles.tableResponsive}>
              {/* BURAYA DİKKAT: salesTable sınıfı eklendi */}
              <table className={`${styles.glassTable} ${styles.salesTable}`}>
                <thead>
                  <tr>
                    <th>Ürün / Varyant</th>
                    <th>Adet</th>
                    <th>Durum</th>
                    <th>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale: any) => (
                    <tr key={sale.id}>
                      {/* Ürün Bilgisi */}
                        <td>
                          <div className={styles.salesProductInfo}>
                            <div className={styles.productNameWrapper}>
                              <Package size={16} className={styles.productNameIcon} />
                              <span className={styles.salesProductName}>{sale.variant.product.name}</span>
                            </div>
                            <div className={styles.variantBadgeWrapper}>
                              <Tag size={12} style={{ marginRight: 4, opacity: 0.7 }} />
                              <span className={styles.salesVariantBadge}>
                                  {sale.variant.size.name} • {sale.variant.color.name}
                              </span>
                            </div>
                          </div>
                        </td>

                      {/* Adet */}
                      <td>
                        <span className={styles.salesQuantityBadge}>{sale.quantity} Adet</span>
                      </td>

                      {/* Durum */}
                      <td>
                        {sale.variant.is_defective ? (
                          <div className={`${styles.statusBadge} ${styles.defective}`}>
                            <AlertTriangle size={14} /> Defolu
                          </div>
                        ) : (
                          <div className={`${styles.statusBadge} ${styles.normal}`}>
                            <CheckCircle2 size={14} /> Normal
                          </div>
                        )}
                      </td>

                      {/* Tarih */}
                      <td>
                        <div className={styles.dateWrapper}>
                           {formatDate(sale.sale_date)}
                        </div>
                      </td>
                    </tr>
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

export default SalesList;