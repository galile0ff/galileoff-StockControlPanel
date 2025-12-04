import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import formStyles from '../styles/Form.module.css';
import tableStyles from '../styles/Table.module.css';
import paginationStyles from '../styles/Pagination.module.css';
import { 
  ShoppingCart, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Loader2, 
  Sparkles,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SalesList = () => {
  const [selectedFilter, setSelectedFilter] = useState('hepsi');
  const [defectFilter, setDefectFilter] = useState('all');
  const [calculatedStartDate, setCalculatedStartDate] = useState('');
  const [calculatedEndDate, setCalculatedEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tableRef = useRef<HTMLDivElement>(null);

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
    setCurrentPage(1); // Filtre değiştiğinde sayfayı başa al
  }, [selectedFilter, defectFilter]);

  const queryParams = new URLSearchParams({
    page: currentPage.toString(),
    limit: itemsPerPage.toString(),
    defectStatus: defectFilter,
  });
  if (calculatedStartDate) queryParams.set('startDate', calculatedStartDate);
  if (calculatedEndDate) queryParams.set('endDate', calculatedEndDate);

  const swrKey = `/api/sales?${queryParams.toString()}`;
  const { data, error } = useSWR(swrKey, fetcher);
  const sales = data?.sales;
  const totalSalesCount = data?.totalCount;
  const totalPages = totalSalesCount ? Math.ceil(totalSalesCount / itemsPerPage) : 0;

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  const handleScrollToTable = () => {
    if (window.innerWidth <= 768 && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    handleScrollToTable();
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    handleScrollToTable();
  };

  return (
    <div className={formStyles.pageWrapper}>
      <div className={tableStyles.ambientLight1} style={{ background: '#10b981' }}></div>
      <div className={tableStyles.ambientLight2} style={{ background: '#0ea5e9' }}></div>

      <div className={formStyles.contentContainer}>
        
        <header className={formStyles.glassHeader}>
          <div className={formStyles.headerLeft}>
            <div className={formStyles.iconBox}>
              <ShoppingCart size={28} />
            </div>
            <div>
              <h1 className={formStyles.pageTitle}>Satış Geçmişi</h1>
              <p className={formStyles.pageSubtitle}>Gerçekleşen satışları inceleyin</p>
            </div>
          </div>
          
          <div className={formStyles.statBadge}>
            <Sparkles size={14} className={formStyles.statIcon} />
            <span>Toplam Satış: <strong>{totalSalesCount ?? 0}</strong></span>
          </div>
        </header>

        <div className={tableStyles.controlsBar}>
          <div className={tableStyles.filtersContainer}>
            <div className={tableStyles.filterWrapper}>
              <Filter size={18} className={tableStyles.filterIcon} />
              <select
                id="dateFilter"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={tableStyles.glassSelect}
              >
                <option value="hepsi">Tüm Zamanlar</option>
                <option value="son_3_gun">Son 3 Gün</option>
                <option value="son_1_hafta">Son 1 Hafta</option>
                <option value="son_1_ay">Son 1 Ay</option>
              </select>
            </div>
            <div className={tableStyles.filterWrapper}>
              <Filter size={18} className={tableStyles.filterIcon} />
              <select
                id="defectFilter"
                value={defectFilter}
                onChange={(e) => setDefectFilter(e.target.value)}
                className={tableStyles.glassSelect}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="defective">Sadece Defolular</option>
                <option value="normal">Sadece Sağlamlar</option>
              </select>
            </div>
          </div>
        </div>

        <div className={formStyles.glassCard} ref={tableRef}>
          {!sales && !error && (
            <div className={tableStyles.loadingState}>
              <Loader2 className={tableStyles.spin} size={32} />
              <p>Yükleniyor...</p>
            </div>
          )}

          {error && <div className={tableStyles.errorState}>Hata oluştu.</div>}

          {sales && sales.length === 0 && (
            <div className={tableStyles.emptyState}>
              <Package size={40} style={{ marginBottom: 10, opacity: 0.5 }} />
              <p>Bu tarih aralığında satış bulunamadı.</p>
            </div>
          )}

          {sales && sales.length > 0 && (
            <>
              <div className={tableStyles.tableResponsive}>
                <table className={`${tableStyles.glassTable} ${tableStyles.salesTable}`}>
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
                        <td>
                          <div className={tableStyles.salesProductInfo}>
                            <div className={tableStyles.productNameWrapper}>
                              <Package size={16} className={tableStyles.productNameIcon} />
                              <span className={tableStyles.salesProductName}>{sale.variant?.product?.name || 'Ürün Bulunamadı'}</span>
                            </div>
                            <div className={tableStyles.variantBadgeWrapper}>
                              <Tag size={16} style={{ marginRight: 6, opacity: 0.7 }} />
                              <span className={tableStyles.salesVariantBadge}>
                                  {sale.variant?.size?.name || '-'} • {sale.variant?.color?.name || '-'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={tableStyles.salesQuantityBadge}>{sale.quantity} Adet</span>
                        </td>
                        <td>
                          {sale.variant?.is_defective ? (
                            <div className={`${tableStyles.statusBadge} ${tableStyles.defective}`}>
                              <AlertTriangle size={14} /> Defolu
                            </div>
                          ) : (
                            <div className={`${tableStyles.statusBadge} ${tableStyles.normal}`}>
                              <CheckCircle2 size={14} /> Normal
                            </div>
                          )}
                        </td>
                        <td>
                          <div className={tableStyles.dateWrapper}>
                             {formatDate(sale.sale_date)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className={paginationStyles.pagination}>
                  <div className={paginationStyles.pageInfo}>
                    Sayfa <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
                  </div>
                  <div className={paginationStyles.buttons}>
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={paginationStyles.button}
                    >
                      <ChevronLeft size={16} />
                      Önceki
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={paginationStyles.button}
                    >
                      Sonraki
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesList;