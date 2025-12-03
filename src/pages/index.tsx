import useSWR from 'swr';
import Link from 'next/link';
import styles from '../styles/Dashboard.module.css';
import tableStyles from '../styles/Table.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Dashboard = () => {
  const { data, error } = useSWR('/api/dashboard-stats', fetcher);

  if (error) return <div className={styles.container}>Veriler yüklenirken bir hata oluştu.</div>;
  if (!data) return <div className={styles.container}>Yükleniyor...</div>;

  return (
    <div className={styles.container}>
      <h1>Dashboard</h1>

      {/* İstatistik Kartları */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h2>{data.product_count ?? 0}</h2>
          <p>Toplam Ürün</p>
        </div>
        <div className={styles.statCard}>
          <h2>{data.category_count ?? 0}</h2>
          <p>Toplam Kategori</p>
        </div>
        <div className={styles.statCard}>
          <h2>{data.size_count ?? 0}</h2>
          <p>Toplam Beden</p>
        </div>
        <div className={styles.statCard}>
          <h2>{data.color_count ?? 0}</h2>
          <p>Toplam Renk</p>
        </div>
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
