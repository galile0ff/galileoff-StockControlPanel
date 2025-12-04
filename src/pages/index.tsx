import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import {
  AreaChart, Area, Bar, BarChart, CartesianGrid, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import formStyles from '../components/Form.module.css';
import styles from '../styles/Dashboard.module.css';
import tableStyles from '../styles/Table.module.css';
import {
  AlertTriangle, ArrowRight, Check, Layers, LayoutDashboard,
  Loader2, Package, ShoppingCart, TrendingDown, TrendingUp, Zap
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Dashboard = () => {
  const { data, error } = useSWR('/api/dashboard-stats', fetcher);

  // Grafik Renkleri (Recharts için gerekli)
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
            <div className={formStyles.iconBox} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
              <LayoutDashboard size={24} color="#fff" />
            </div>
            <div>
              <h1 className={formStyles.pageTitle}>Yönetim Paneli</h1>
              <p className={formStyles.pageSubtitle}>Mağaza performans özeti</p>
            </div>
          </div>
        </header>

        {/* 1. BÖLÜM: İSTATİSTİK KARTLARI */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Toplam Çeşit</span>
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

        {/* 2. BÖLÜM: KRİTİK LİSTELER */}
        <div className={styles.listsGrid}>
          <div className={styles.listCardWrapper}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitleGroup}>
                <div className={styles.headerIconSm} style={{ background: '#f59e0b' }}>
                  <TrendingDown size={16} color="#fff" />
                </div>
                <h3>Kritik Stok <span style={{ opacity: 0.5, fontWeight: 400, fontSize: 13 }}></span></h3>
              </div>
              <Link href="/manage/products" className={styles.viewAllLink}>Tümünü Gör <ArrowRight size={14} /></Link>
            </div>
            <div className={tableStyles.tableResponsive}>
              <table className={tableStyles.glassTable} style={{background: 'transparent' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', paddingLeft: 24 }}>Ürün Detayı</th>
                    <th style={{ textAlign: 'center', paddingRight: 24 }}>Kalan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.low_stock_items?.length > 0 ? (
                    data.low_stock_items.map((item: any) => (
                      <tr key={item.id} className={styles.miniTableRow}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{item.product?.name}</span>
                            <span className={tableStyles.salesVariantBadge}>{item.size?.name} • {item.color?.name}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`${tableStyles.stockBadge} ${tableStyles.stockLow}`}>{item.stock}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className={tableStyles.emptyState} style={{ padding: '30px' }}>
                        <Check size={32} color="#10b981" style={{ marginBottom: 10 }} />
                        <p>Harika! Stok sorunu yok.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.listCardWrapper}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitleGroup}>
                <div className={styles.headerIconSm} style={{ background: '#8b5cf6' }}>
                  <Zap size={16} color="#fff" />
                </div>
                <h3>Çok Satanlar</h3>
              </div>
              <Link href="/manage/sales" className={styles.viewAllLink}>Detaylar <ArrowRight size={14} /></Link>
            </div>
            <div className={tableStyles.tableResponsive}>
              <table className={tableStyles.glassTable} style={{background: 'transparent' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', paddingLeft: 24 }}>Ürün Detayı</th>
                    <th style={{ textAlign: 'center', paddingRight: 24 }}>Satış</th>
                  </tr>
                </thead>
                <tbody>
                  {data.best_selling_items?.length > 0 ? (
                    data.best_selling_items.map((item: any) => (
                      <tr key={item.variant_id} className={styles.miniTableRow}>
                        <td>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: 14, fontWeight: 600 }}>{item.product_name}</span>
                              <span className={tableStyles.salesVariantBadge}>{item.size_name} • {item.color_name}</span>
                           </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={tableStyles.salesQuantityBadge}>{item.total_quantity_sold}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className={tableStyles.emptyState} style={{ padding: '30px' }}>
                        Henüz satış verisi yok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
            <div style={{ width: '100%', height: 320, paddingTop: '10px' }}>
              <ResponsiveContainer>
                <AreaChart data={data.daily_sales_data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colorPrimary} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={colorPrimary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} vertical={false} />
                  <XAxis dataKey="date" stroke={colorText} fontSize={12} tickFormatter={(tick) => tick.substring(5).replace('-', '/')} tickMargin={10} />
                  <YAxis stroke={colorText} fontSize={12} tickMargin={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(20, 20, 25, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    labelStyle={{ color: '#fff', fontWeight: 600 }}
                    itemStyle={{ color: colorPrimary, fontWeight: 500 }}
                    formatter={(value: number) => [`${value} Adet`, 'Satış']}
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
            <div style={{ width: '100%', height: 320, paddingTop: '10px' }}>
              <ResponsiveContainer>
                <BarChart data={stockComparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} vertical={false} />
                  <XAxis dataKey="name" stroke={colorText} fontSize={12} tickMargin={10} />
                  <YAxis stroke={colorText} fontSize={12} tickMargin={10} />
                  <Tooltip
                     contentStyle={{ backgroundColor: 'rgba(20, 20, 25, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                     labelStyle={{ color: '#fff', fontWeight: 600 }}
                     cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px', color: '#fff' }} />
                  <Bar dataKey="Sağlam" fill={colorSuccess} radius={[6, 6, 0, 0]} barSize={40} name="Sağlam Ürün" />
                  <Bar dataKey="Defolu" fill={colorDanger} radius={[6, 6, 0, 0]} barSize={40} name="Defolu Ürün" />
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