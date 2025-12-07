
import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '../context/ThemeContext';
import styles from '../styles/Analytics.module.css';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AnalyticsProps {
  stats: {
    total_returns_quantity: number;
    sales_vs_returns_ratio: number;
  };
}

const Analytics: React.FC<AnalyticsProps> = ({ stats }) => {
  const { theme } = useTheme();

  const totalReturnsOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'radialBar',
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '75%',
        },
        track: {
          background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: true,
            fontSize: '24px',
            fontWeight: 600,
            color: theme === 'dark' ? '#fff' : '#333',
            offsetY: 8,
          },
        },
      },
    },
    labels: ['İadeler'],
    series: [stats.total_returns_quantity || 0],
    colors: ['#ff4560'],
  };

  const salesReturnRatioOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 15,
          size: '70%',
          background: 'transparent',
        },
        track: {
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            strokeWidth: '67%',
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '16px',
            color: theme === 'dark' ? '#a0a0a0' : '#888',
            offsetY: -10,
          },
          value: {
            offsetY: 5,
            fontSize: '22px',
            color: theme === 'dark' ? '#fff' : '#111',
            formatter: (val) => `${parseFloat(val.toString()).toFixed(1)}%`,
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#ABE5A1'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: 'round',
    },
    labels: ['İade Oranı'],
    series: [stats.sales_vs_returns_ratio || 0],
  };

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.chartCard}>
        <h3 className={styles.cardTitle}>Toplam İade Edilen Ürün</h3>
        <div className={styles.chartWrapper}>
          <Chart
            options={totalReturnsOptions}
            series={totalReturnsOptions.series}
            type="radialBar"
            height={200}
          />
        </div>
        <p className={styles.chartInfo}>
          Toplam <strong>{stats.total_returns_quantity || 0}</strong> adet ürün iade edilmiştir.
        </p>
      </div>
      
      <div className={styles.chartCard}>
        <h3 className={styles.cardTitle}>Satışa Göre İade Oranı</h3>
        <div className={styles.chartWrapper}>
            <Chart
                options={salesReturnRatioOptions}
                series={salesReturnRatioOptions.series}
                type="radialBar"
                height={280}
            />
        </div>
         <p className={styles.chartInfo}>
           Satılan ürünlerin yaklaşık <strong>%{stats.sales_vs_returns_ratio.toFixed(1)}</strong> kadarı iade edilmiştir.
        </p>
      </div>
    </div>
  );
};

export default Analytics;
