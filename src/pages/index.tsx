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
import styles from '../styles/Dashboard.module.css';
import tableStyles from '../styles/Table.module.css'; // Table.module.css'i import ediyoruz

// CSS değişkenlerinden renkleri almak için basit bir helper fonksiyonu (sadece örnek, gerçek uygulamada daha sağlam bir yol tercih edilebilir)
// const getCssVariable = (varName: string) => typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue(varName) : '';
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Dashboard = () => {
  const { data, error } = useSWR('/api/dashboard-stats', fetcher);

  if (error) return <div className={styles.container}>Veriler yüklenirken bir hata oluştu.</div>;
  if (!data) return <div className={styles.container}>Yükleniyor...</div>;

  const nonDefectiveStock = (data.total_product_stock || 0) - (data.total_defective_stock || 0);
  const stockComparisonData = [
    {
      name: 'Stok Durumu', // X ekseninde bu isim görünür
      'Defosuz Ürün': nonDefectiveStock,
      'Defolu Ürün': data.total_defective_stock || 0,
    },
  ];

  // Renk değişkenlerini doğrudan HEX kodları olarak tanımlayalım, Recharts ile uyumlu olması için
  const accentColor = '#4F85F7'; // hsl(220, 80%, 60%) karşılığı
  const successColor = '#33CC33'; // hsl(120, 50%, 40%) karşılığı
  const errorColor = '#E54747';   // hsl(0, 70%, 60%) karşılığı

  return (
    <div className={styles.container}>
      <h1>Dashboard</h1>

      {/* İstatistik Kartları */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h2>{data.total_unique_products ?? 0}</h2>
          <p>Toplam Ürün Çeşidi</p>
        </div>
        <div className={styles.statCard}>
          <h2>{data.total_product_stock ?? 0}</h2>
          <p>Toplam Ürün (Stok)</p>
        </div>
        <div className={styles.statCard}>
          <h2>{data.total_sales_quantity ?? 0}</h2>
          <p>Toplam Satış Adedi</p>
        </div>
        <div className={styles.statCard}>
          <h2>{data.total_defective_stock ?? 0}</h2>
          <p>Toplam Defolu Ürün</p>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <h2>Son 30 Günlük Satış Trendi</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data.daily_sales_data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" /> {/* Grid rengi */}
            <XAxis dataKey="date" tickFormatter={(tick) => {
              const [year, month, day] = tick.split('-');
              return `${day}/${month}`;
            }} stroke="var(--color-text-secondary)" /> {/* Eksen rengi */}
            <YAxis stroke="var(--color-text-secondary)" /> {/* Eksen rengi */}
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}
              labelStyle={{ color: 'var(--color-text-primary)' }}
              itemStyle={{ color: 'var(--color-text-primary)' }}
              formatter={(value: number) => [`Satış: ${value}`, 'Toplam']}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke={accentColor}
              activeDot={{ r: 8, fill: accentColor, stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartContainer} style={{ marginTop: 'var(--spacing-xl)' }}>
        <h2>Mevcut Stok Durumu (Defolu / Defosuz)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={stockComparisonData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" /> {/* Grid rengi */}
            <XAxis dataKey="name" stroke="var(--color-text-secondary)" /> {/* Eksen rengi */}
            <YAxis stroke="var(--color-text-secondary)" /> {/* Eksen rengi */}
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}
              labelStyle={{ color: 'var(--color-text-primary)' }}
              itemStyle={{ color: 'var(--color-text-primary)' }}
            />
            <Legend wrapperStyle={{ color: 'var(--color-text-primary)' }} /> {/* Legend rengi */}
            <Bar dataKey="Defosuz Ürün" fill={successColor} />
            <Bar dataKey="Defolu Ürün" fill={errorColor} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.listsGrid}>
        {/* Stoku Azalanlar */}
        <div className={tableStyles.tableContainer}>
          <h2 className={styles.listHeader}>Stoku Azalan Ürünler (10 adetten az)</h2>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Kalan Stok</th>
              </tr>
            </thead>
            <tbody>
              {data.low_stock_items?.length > 0 ? (
                data.low_stock_items.map((item: any) => (
                  <tr key={item.id} className={tableStyles.variantRow}> {/* Tablo satır stili */}
                    <td>
                      <Link href={`/manage/products/${item.product?.id}`} style={{ color: 'var(--color-accent)' }}>
                        {item.product?.name} ({item.size?.name}, {item.color?.name})
                      </Link>
                    </td>
                    <td>{item.stock}</td>
                  </tr>
                ))
              ) : (
                <tr className={tableStyles.variantRow}>
                  <td colSpan={2}>Stoku azalan ürün yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* En Çok Satanlar */}
        <div className={tableStyles.tableContainer}>
          <h2 className={styles.listHeader}>En Çok Satanlar</h2>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Satış Adedi</th>
              </tr>
            </thead>
            <tbody>
            {data.best_selling_items?.length > 0 ? (
                data.best_selling_items.map((item: any) => (
                  <tr key={item.variant_id} className={tableStyles.variantRow}> {/* Tablo satır stili */}
                    <td>
                      <Link href={`/manage/products/${item.product_id}`} style={{ color: 'var(--color-accent)' }}>
                        {item.product_name} ({item.size_name}, {item.color_name})
                      </Link>
                    </td>
                    <td>{item.total_quantity_sold}</td>
                  </tr>
                ))
              ) : (
                <tr className={tableStyles.variantRow}>
                  <td colSpan={2}>Henüz satış verisi yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;