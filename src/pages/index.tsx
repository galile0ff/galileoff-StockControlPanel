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
  BarChart, // Yeni import
  Bar,      // Yeni import
  Legend    // Yeni import
} from 'recharts';
import styles from '../styles/Dashboard.module.css';
import tableStyles from '../styles/Table.module.css';

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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(tick) => {
              const [year, month, day] = tick.split('-');
              return `${day}/${month}`;
            }} />
            <YAxis />
            <Tooltip formatter={(value: number) => [`Satış: ${value}`]} />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartContainer} style={{ marginTop: '40px' }}>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Defosuz Ürün" fill="#82ca9d" />
            <Bar dataKey="Defolu Ürün" fill="#ffc658" />
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
                  <tr key={item.id}>
                    <td>
                      <Link href={`/manage/products/${item.product?.id}`}>
                        {item.product?.name} ({item.size?.name}, {item.color?.name})
                      </Link>
                    </td>
                    <td>{item.stock}</td>
                  </tr>
                ))
              ) : (
                <tr>
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
                  <tr key={item.variant_id}>
                    <td>
                      <Link href={`/manage/products/${item.product_id}`}>
                        {item.product_name} ({item.size_name}, {item.color_name})
                      </Link>
                    </td>
                    <td>{item.total_quantity_sold}</td>
                  </tr>
                ))
              ) : (
                <tr>
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
