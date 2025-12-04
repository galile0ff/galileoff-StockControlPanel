import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Stil Dosyaları
// NOT: Dosyalar 'src/styles' klasöründe olduğu için '../styles/...' yolunu kullanıyoruz.
import formStyles from '../components/Form.module.css';   
import tableStyles from '../styles/Table.module.css'; 
import styles from '../styles/Dashboard.module.css';  

// İkonlar
import { 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  Loader2,
  ArrowRight,
  Layers
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Dashboard = () => {
  const { data, error } = useSWR('/api/dashboard-stats', fetcher);

  if (error) return <div className={formStyles.pageWrapper}><div className={tableStyles.errorState}>Veriler yüklenirken bir hata oluştu.</div></div>;
  if (!data) return (
    <div className={formStyles.pageWrapper}>
        <div className={tableStyles.loadingState}>
            <Loader2 className={tableStyles.spin} size={48} />
            <p style={{marginTop: 10}}>Dashboard hazırlanıyor...</p>
        </div>
    </div>
  );

  const nonDefectiveStock = (data.total_product_stock || 0) - (data.total_defective_stock || 0);
  const stockComparisonData = [
    {
      name: 'Stok Durumu',
      'Defosuz Ürün': nonDefectiveStock,
      'Defolu Ürün': data.total_defective_stock || 0,
    },
  ];

  // Koyu Tema Uyumlu Grafik Renkleri
  const colorSales = '#6366f1'; // Indigo
  const colorSuccess = '#10b981'; // Emerald
  const colorError = '#ef4444';   // Red
  const colorGrid = 'rgba(255,255,255,0.1)';
  const colorText = '#94a3b8';

  return (
    <div className={formStyles.pageWrapper}>
      
      {/* Arka Plan Efektleri */}
      <div className={formStyles.ambientLight1} style={{background: '#3b82f6'}}></div>
      <div className={formStyles.ambientLight2} style={{background: '#8b5cf6'}}></div>

      <div className={formStyles.contentContainer}>
        
        {/* HEADER */}
        <header className={formStyles.glassHeader}>
          <div className={formStyles.headerLeft}>
            <div className={formStyles.iconBox}>
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className={formStyles.pageTitle}>Dashboard</h1>
              <p className={formStyles.pageSubtitle}>Mağazanızın genel durum özeti</p>
            </div>
          </div>
        </header>

        {/* 1. BÖLÜM: İSTATİSTİK KARTLARI */}
        <div className={styles.statsGrid}>
          
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa'}}>
              <Layers size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Toplam Çeşit</span>
              <span className={styles.statValue}>{data.total_unique_products ?? 0}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{background: 'rgba(16, 185, 129, 0.15)', color: '#34d399'}}>
              <Package size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Toplam Stok</span>
              <span className={styles.statValue}>{data.total_product_stock ?? 0}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8'}}>
              <ShoppingCart size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Satış Adedi</span>
              <span className={styles.statValue}>{data.total_sales_quantity ?? 0}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{background: 'rgba(239, 68, 68, 0.15)', color: '#f87171'}}>
              <AlertTriangle size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Defolu Ürün</span>
              <span className={styles.statValue}>{data.total_defective_stock ?? 0}</span>
            </div>
          </div>

        </div>

        {/* 2. BÖLÜM: GRAFİKLER (YAN YANA) */}
        <div className={styles.chartsGrid}>
            
            {/* Satış Trendi Grafiği */}
            <div className={styles.chartCard}>
                <div className={styles.cardHeader}>
                    <h3><TrendingUp size={18} /> Son 30 Günlük Satış Trendi</h3>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                    <LineChart data={data.daily_sales_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            stroke={colorText} 
                            fontSize={12}
                            tickFormatter={(tick) => {
                                const [year, month, day] = tick.split('-');
                                return `${day}/${month}`;
                            }} 
                        />
                        <YAxis stroke={colorText} fontSize={12} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            labelStyle={{ color: '#fff', marginBottom: '5px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number) => [`${value} Adet`, 'Satış']}
                        />
                        <Line
                            type="monotone"
                            dataKey="sales"
                            stroke={colorSales}
                            strokeWidth={3}
                            dot={{ r: 4, fill: colorSales, strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: '#fff' }}
                        />
                    </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Stok Durumu Grafiği */}
            <div className={styles.chartCard}>
                <div className={styles.cardHeader}>
                    <h3><Package size={18} /> Stok Dağılımı (Defo Durumu)</h3>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                    <BarChart data={stockComparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} vertical={false} />
                        <XAxis dataKey="name" stroke={colorText} fontSize={12} />
                        <YAxis stroke={colorText} fontSize={12} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            labelStyle={{ color: '#fff' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="Defosuz Ürün" fill={colorSuccess} radius={[4, 4, 0, 0]} barSize={60} />
                        <Bar dataKey="Defolu Ürün" fill={colorError} radius={[4, 4, 0, 0]} barSize={60} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>

        {/* 3. BÖLÜM: LİSTELER (YAN YANA) */}
        <div className={styles.listsGrid}>
            
            {/* Stoku Azalanlar */}
            <div className={tableStyles.glassCard}>
                <div className={styles.cardHeader}> {/* Dashboard'dan gelen başlık stili */}
                    <h3 style={{margin:0, fontSize:16, fontWeight:600, color:'#fff'}}>Stoku Azalan Ürünler <span className={styles.subText}>(10'dan az)</span></h3>
                    <Link href="/manage/products" className={styles.viewAllLink}>Tümünü Gör <ArrowRight size={14}/></Link>
                </div>
                
                <div className={tableStyles.tableResponsive}>
                    <table className={tableStyles.glassTable}>
                        <thead>
                            <tr>
                                <th style={{textAlign:'left'}}>Ürün</th>
                                <th style={{textAlign:'center'}}>Kalan Stok</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.low_stock_items?.length > 0 ? (
                                data.low_stock_items.map((item: any) => (
                                    <tr key={item.id} className={tableStyles.variantRow}>
                                        <td>
                                            <div className={tableStyles.productTitleGroup}>
                                                <span className={tableStyles.productName} style={{fontSize:14}}>
                                                    {item.product?.name}
                                                </span>
                                                <span className={tableStyles.salesVariantBadge}>
                                                    {item.size?.name} • {item.color?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{textAlign:'center'}}>
                                            <span className={`${tableStyles.stockBadge} ${tableStyles.stockLow}`}>
                                                {item.stock}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className={tableStyles.emptyState} style={{padding: '30px'}}>
                                        Harika! Kritik stok seviyesinde ürün yok.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* En Çok Satanlar */}
            <div className={tableStyles.glassCard}>
                <div className={styles.cardHeader}>
                    <h3 style={{margin:0, fontSize:16, fontWeight:600, color:'#fff'}}>En Çok Satanlar</h3>
                    <Link href="/sales" className={styles.viewAllLink}>Detaylar <ArrowRight size={14}/></Link>
                </div>

                <div className={tableStyles.tableResponsive}>
                    <table className={tableStyles.glassTable}>
                        <thead>
                            <tr>
                                <th style={{textAlign:'left'}}>Ürün</th>
                                <th style={{textAlign:'center'}}>Satış Adedi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.best_selling_items?.length > 0 ? (
                                data.best_selling_items.map((item: any) => (
                                    <tr key={item.variant_id} className={tableStyles.variantRow}>
                                        <td>
                                            <div className={tableStyles.productTitleGroup}>
                                                <span className={tableStyles.productName} style={{fontSize:14}}>
                                                    {item.product_name}
                                                </span>
                                                <span className={tableStyles.salesVariantBadge}>
                                                    {item.size_name} • {item.color_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{textAlign:'center'}}>
                                            <span className={tableStyles.salesQuantityBadge}>
                                                {item.total_quantity_sold}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className={tableStyles.emptyState} style={{padding: '30px'}}>
                                        Henüz satış verisi oluşmadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;