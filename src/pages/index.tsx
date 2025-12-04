import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import {
  AreaChart, Area, Bar, BarChart, CartesianGrid, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import formStyles from '../styles/Form.module.css';
import styles from '../styles/Dashboard.module.css';
import tableStyles from '../styles/Table.module.css';
import {
  AlertTriangle, ArrowRight, Check, Layers, LayoutDashboard,
  Loader2, Package, ShoppingCart, TrendingDown, TrendingUp, Zap
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Dashboard = () => {
  const { data, error } = useSWR('/api/dashboard-stats', fetcher);

  // Renkler
  const colorPrimary = '#8b5cf6';
  const colorSuccess = '#10b981';
  const colorDanger = '#ef4444';
  const colorGrid = 'rgba(255, 255, 255, 0.05)';
  const colorText = '#94a3b8';

  if (error) return (
    <div className={formStyles.pageWrapper}>
      <div className={tableStyles.errorState}>Veriler yüklenirken bir hata oluştu.</div>
    </div>
  );
  if (!data) return (
    <div className={formStyles.pageWrapper}>
      <div className={tableStyles.loadingState}>
        <Loader2 className={tableStyles.spin} size={48} />
        <p style={{ marginTop: 10, color: '#fff' }}>Analizler hazırlanıyor...</p>
      </div>
    </div>
  );

  // Stok Dağılım Hesabı
  const nonDefectiveStock = (data.total_product_stock || 0) - (data.total_defective_stock || 0);
  const stockComparisonData = [
    { name: 'Stok Dağılımı', 'Sağlam': nonDefectiveStock, 'Defolu': data.total_defective_stock || 0 },
  ];

  return (
    <div className={formStyles.pageWrapper}>
      <div className={formStyles.ambientLight1} />
      <div className={formStyles.ambientLight2} />

      <div className={formStyles.contentContainer}>
        <header className={formStyles.glassHeader}>
          <div className={formStyles.headerLeft}>
            <div className={formStyles.iconBox}>
              <LayoutDashboard size={24} color="#fff" />
            </div>
            <div>
              <h1 className={formStyles.pageTitle}>Yönetim Paneli</h1>
              <p className={formStyles.pageSubtitle}>Mağaza performans özeti</p>
            </div>
          </div>
        </header>

        {/* 1. BÖLÜM: KRİTİK LİSTELER (Sadece ilk 5) */}
        <div className={styles.listsGrid}>
          
          {/* --- KRİTİK STOK --- */}
          <div className={styles.unifiedCard}>
            <div className={styles.unifiedHeader}>
              <div className={styles.headerTitleGroup}>
                <div className={styles.headerIconSm} style={{ background: '#f59e0b' }}>
                  <TrendingDown size={18} color="#fff" />
                </div>
                <h3>Kritik Stok</h3>
              </div>
              <Link href="/manage/products?show=critical" className={styles.viewAllLink}>
                Tümünü Gör <ArrowRight size={14} />
              </Link>
            </div>

            <div className={styles.unifiedList}>
              {data.low_stock_items?.length > 0 ? (
                // SADECE İLK 5 KAYIT
                data.low_stock_items.slice(0, 5).map((item: any) => (
                  <div key={item.id} className={styles.unifiedRow}>
                    <div className={styles.rowLeft}>
                      <img 
                        src={(item.product?.image_url && item.product.image_url.trim()) ? item.product.image_url : '/assets/placeholder.svg'}
                        alt={item.product?.name} 
                        className={styles.productImage}
                        style={{ objectFit: (item.product?.image_url && item.product.image_url.trim()) ? 'cover' : 'contain' }}
                      />
                      <div className={styles.rowTextGroup}>
                        <span className={styles.rowTitle}>{item.product?.name}</span>
                        <span className={styles.rowSubtitle}>{item.size?.name} • {item.color?.name}</span>
                      </div>
                    </div>
                    <div className={styles.rowRight}>
                      <div className={`${styles.unifiedBadge} ${styles.badgeWarning}`}>
                        {item.stock}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={tableStyles.emptyState} style={{ padding: '40px' }}>
                  <Check size={32} color="#10b981" style={{ marginBottom: 10, display: 'block', margin: '0 auto 10px auto' }} />
                  <p style={{ textAlign: 'center' }}>Harika! Stok sorunu yok.</p>
                </div>
              )}
            </div>
          </div>

          {/* --- ÇOK SATANLAR --- */}
          <div className={styles.unifiedCard}>
            <div className={styles.unifiedHeader}>
              <div className={styles.headerTitleGroup}>
                <div className={styles.headerIconSm} style={{ background: '#8b5cf6' }}>
                  <Zap size={18} color="#fff" />
                </div>
                <h3>Çok Satanlar</h3>
              </div>
              <Link href="/manage/sales" className={styles.viewAllLink}>
                Detaylar <ArrowRight size={14} />
              </Link>
            </div>

            <div className={styles.unifiedList}>
              {data.best_selling_items?.length > 0 ? (
                // SADECE İLK 5 KAYIT
                data.best_selling_items.slice(0, 5).map((item: any) => (
                  <div key={item.variant_id} className={styles.unifiedRow}>
                    <div className={styles.rowLeft}>
                      <img 
                        src={(item.product_image && item.product_image.trim()) ? item.product_image : '/assets/placeholder.svg'}
                        alt={item.product_name} 
                        className={styles.productImage}
                        style={{ objectFit: (item.product_image && item.product_image.trim()) ? 'cover' : 'contain' }}
                      />
                      <div className={styles.rowTextGroup}>
                        <span className={styles.rowTitle}>{item.product_name}</span>
                        <span className={styles.rowSubtitle}>{item.size_name} • {item.color_name}</span>
                      </div>
                    </div>
                    <div className={styles.rowRight}>
                      <div className={`${styles.unifiedBadge} ${styles.badgePurple}`}>
                        {item.total_quantity_sold}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={tableStyles.emptyState} style={{ padding: '40px', textAlign: 'center' }}>
                  Henüz satış verisi yok.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. BÖLÜM: İSTATİSTİK KARTLARI */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Toplam Ürün</span>
              <span className={styles.statValue}>{data.total_unique_products ?? 0}</span>
            </div>
            <div className={styles.statIconBox} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
              <Layers size={22} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Toplam Stok</span>
              <span className={styles.statValue}>{data.total_product_stock ?? 0}</span>
            </div>
            <div className={styles.statIconBox} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
              <Package size={22} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Satış Adedi</span>
              <span className={styles.statValue}>{data.total_sales_quantity ?? 0}</span>
            </div>
            <div className={styles.statIconBox} style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}>
              <ShoppingCart size={22} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Defolu Ürün</span>
              <span className={styles.statValue} style={{ color: '#f87171' }}>{data.total_defective_stock ?? 0}</span>
            </div>
            <div className={styles.statIconBox} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        {/* 3. BÖLÜM: GRAFİKLER */}
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitleGroup}>
                <TrendingUp size={18} color={colorPrimary} />
                <h3>30 Günlük Satış Trendi</h3>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.daily_sales_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colorPrimary} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={colorPrimary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} vertical={false} />
                  <XAxis dataKey="date" stroke={colorText} fontSize={10} tickFormatter={(tick) => tick.substring(5).replace('-', '/')} tickMargin={10} />
                  <YAxis stroke={colorText} fontSize={10} tickMargin={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(20, 20, 25, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    labelStyle={{ color: '#fff', fontWeight: 600 }}
                    itemStyle={{ color: colorPrimary, fontWeight: 500 }}
                  />
                  <Area type="monotone" dataKey="sales" stroke={colorPrimary} fillOpacity={1} fill="url(#colorSales)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitleGroup}>
                <Package size={18} color="#06b6d4" />
                <h3>Stok Dağılımı</h3>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} vertical={false} />
                  <XAxis dataKey="name" stroke={colorText} fontSize={10} tickMargin={10} />
                  <YAxis stroke={colorText} fontSize={10} tickMargin={10} />
                  <Tooltip
                     contentStyle={{ backgroundColor: 'rgba(20, 20, 25, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                     labelStyle={{ color: '#fff', fontWeight: 600 }}
                     cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="Sağlam" fill={colorSuccess} radius={[6, 6, 0, 0]} barSize={40} name="Sağlam" />
                  <Bar dataKey="Defolu" fill={colorDanger} radius={[6, 6, 0, 0]} barSize={40} name="Defolu" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;