import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { ThemeProvider } from '../context/ThemeContext'; // ThemeProvider'ı içe aktar

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Giriş sayfasında Layout'u gösterme
  if (router.pathname === '/login') {
    return (
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}

export default MyApp;
