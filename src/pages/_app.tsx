import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { ThemeProvider } from '../context/ThemeContext';
import Head from 'next/head';
import { SpeedInsights } from '@vercel/speed-insights/next';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  if (router.pathname === '/login') {
    return (
      <ThemeProvider>
        <Head>
          <link rel="icon" href="/assets/logo.svg" />
        </Head>
        <Component {...pageProps} />
        <SpeedInsights />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Head>
        <link rel="icon" href="/assets/logo.svg" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <SpeedInsights />
    </ThemeProvider>
  );
}

export default MyApp;
