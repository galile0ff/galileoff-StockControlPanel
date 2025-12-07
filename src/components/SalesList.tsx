import React, { useState, useEffect, useRef } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import formStyles from '../styles/Form.module.css';
import tableStyles from '../styles/Table.module.css';
import paginationStyles from '../styles/Pagination.module.css';
import { 
  ShoppingCart, 
  Filter, 
  Package, 
  Loader2, 
  Sparkles,
  Tag,
  ChevronLeft,
  ChevronRight,
  Undo2,
  CheckCircle2
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SalesList = () => {
  const { mutate } = useSWRConfig();
  const [selectedFilter, setSelectedFilter] = useState('hepsi');
  const [calculatedStartDate, setCalculatedStartDate] = useState('');
  const [calculatedEndDate, setCalculatedEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedSales, setDisplayedSales] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [isReturning, setIsReturning] = useState<number | null>(null);
  const [selectedDefectiveFilter, setSelectedDefectiveFilter] = useState('hepsi');
  const [selectedReturnedFilter, setSelectedReturnedFilter] = useState('hepsi');

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
    setCurrentPage(1);
  }, [selectedFilter, selectedDefectiveFilter, selectedReturnedFilter]);

  const queryParams = new URLSearchParams({
    page: currentPage.toString(),
    limit: itemsPerPage.toString(),
  });
  if (calculatedStartDate) queryParams.set('startDate', calculatedStartDate);
  if (calculatedEndDate) queryParams.set('endDate', calculatedEndDate);
  if (selectedDefectiveFilter !== 'hepsi') queryParams.set('saleType', selectedDefectiveFilter);
  if (selectedReturnedFilter !== 'hepsi') queryParams.set('returned', selectedReturnedFilter);

  const swrKey = `/api/sales?${queryParams.toString()}`;
  const { data, error } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (data?.sales) {
      const actualSales = data.sales.filter((sale: any) => sale.quantity > 0);
      setDisplayedSales(actualSales);
      setTotalSales(data.totalCount);
    }
  }, [data]);

  const totalPages = totalSales ? Math.ceil(totalSales / itemsPerPage) : 0;

  const handleReturn = async (saleId: number) => {
    setIsReturning(saleId);

    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'İade işlemi başarısız oldu.');
      }
      
      mutate(swrKey);
      mutate('/api/dashboard-stats'); 

    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsReturning(null);
    }
  };

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

  const isLoading = !data && !error;

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
            <span>Toplam Satış: <strong>{totalSales ?? 0}</strong></span>
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

            {/* Defolu/Sağlam filtresi */}
            <div className={tableStyles.filterWrapper}>
              <Package size={18} className={tableStyles.filterIcon} />
              <select
                id="defectiveFilter"
                value={selectedDefectiveFilter}
                onChange={(e) => setSelectedDefectiveFilter(e.target.value)}
                className={tableStyles.glassSelect}
              >
                <option value="hepsi">Durum (Hepsi)</option>
                <option value="defective">Defolu</option>
                <option value="sound">Sağlam</option>
              </select>
            </div>

            {/* İade Edilmiş mi filtresi */}
            <div className={tableStyles.filterWrapper}>
              <Undo2 size={18} className={tableStyles.filterIcon} />
              <select
                id="returnedFilter"
                value={selectedReturnedFilter}
                onChange={(e) => setSelectedReturnedFilter(e.target.value)}
                className={tableStyles.glassSelect}
              >
                <option value="hepsi">İade (Hepsi)</option>
                <option value="returned">İade Edildi</option>
                <option value="not_returned">Satış</option>
              </select>
            </div>
          </div>
        </div>

        <div className={formStyles.glassCard} ref={tableRef}>
          {isLoading && (
            <div className={tableStyles.loadingState}>
              <Loader2 className={tableStyles.spin} size={32} />
              <p>Yükleniyor...</p>
            </div>
          )}

          {error && <div className={tableStyles.errorState}>Veriler yüklenirken bir hata oluştu.</div>}

          {!isLoading && displayedSales.length === 0 && (
            <div className={tableStyles.emptyState}>
              <Package size={40} style={{ marginBottom: 10, opacity: 0.5 }} />
              <p>Bu tarih aralığında satış bulunamadı.</p>
            </div>
          )}

          {!isLoading && displayedSales.length > 0 && (
            <>
              <div className={tableStyles.tableResponsive}>
                <table className={`${tableStyles.glassTable} ${tableStyles.salesTable}`}>
                  <thead>
                    <tr>
                      <th>Ürün / Varyant</th>
                      <th>Adet</th>
                      <th>Durum</th>
                      <th>Tarih</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSales.map((sale: any) => (
                      <tr key={sale.id}>
                        <td>
                          <div className={tableStyles.salesProductInfo}>
                            <div className={tableStyles.productNameWrapper}>
                              <Package size={16} className={tableStyles.productNameIcon} />
                              <span className={tableStyles.salesProductName}>{sale.variant?.product?.name || 'Ürün Bulunamadı'}</span>
                            </div>
                            <div className={tableStyles.variantBadgeWrapper}>
                              <Tag size={16} style={{ marginRight: 6, opacity: 0.7 }} />
                              <div className={tableStyles.salesVariantBadge}>
                                <span>{sale.variant?.size?.name || '-'}</span>
                                <span style={{opacity: 0.3}}>•</span>
                                <span style={{display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
                                  <span className={tableStyles.colorDot} style={{ 
                                    backgroundColor: sale.variant?.color?.hex_code || '#ccc',
                                    width: '12px',
                                    height: '12px'
                                  }}></span>
                                  <span>{sale.variant?.color?.name || '-'}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={tableStyles.salesQuantityBadge}>{sale.quantity} Adet</span>
                        </td>
                        <td>
                          {sale.sale_type === 'defective' ? (
                            <span className={`${tableStyles.statusBadge} ${tableStyles.defectiveBadge}`}>
                              Defolu
                            </span>
                          ) : (
                            <span className={`${tableStyles.statusBadge} ${tableStyles.soundBadge}`}>
                              Sağlam
                            </span>
                          )}
                        </td>
                        <td>
                          <div className={tableStyles.dateWrapper}>
                             {formatDate(sale.sale_date)}
                          </div>
                        </td>
                        <td>
                          <div className={tableStyles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                            {sale.has_been_returned ? (
                               <span className={`${tableStyles.statusBadge} ${tableStyles.returnedBadge}`}>
                                <CheckCircle2 size={14} />
                                <span>İade</span>
                              </span>
                            ) : (
                              <button 
                                className={`${tableStyles.actionBtnReturn}`}
                                onClick={() => handleReturn(sale.id)}
                                disabled={isReturning === sale.id}
                              >
                                {isReturning === sale.id ? (
                                  <Loader2 size={16} className={tableStyles.spin} />
                                ) : (
                                  <Undo2 size={16} />
                                )}
                                İade Et
                              </button>
                            )}
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