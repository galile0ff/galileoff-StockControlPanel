import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Layout.module.css';
import { useRouter } from 'next/router';
import { createSupabaseBrowserClient } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar state'i

  useEffect(() => {
    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
        if(!session) {
            router.push('/login');
        }
    }
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Router değiştiğinde sidebar'ı kapat
  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }
  
  if (!user) {
    return null; 
  }

  return (
    <div className={styles.container}>
      {/* Mobil menü butonu */}
      <button className={styles.menuButton} onClick={toggleSidebar}>
        {sidebarOpen ? 'X' : '☰'}
      </button>

      {/* Overlay */}
      {sidebarOpen && <div className={styles.overlay} onClick={toggleSidebar}></div>}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <Link href="/">İNCEWEAR</Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/" className={router.pathname === '/' ? styles.active : ''}>Dashboard</Link>
          <p className={styles.navHeading}>Yönetim</p>
          <Link href="/manage/products" className={router.pathname.startsWith('/manage/products') ? styles.active : ''}>Ürünler</Link>
          <Link href="/manage/categories" className={router.pathname === '/manage/categories' ? styles.active : ''}>Kategoriler</Link>
          <Link href="/manage/sizes" className={router.pathname === '/manage/sizes' ? styles.active : ''}>Bedenler</Link>
          <Link href="/manage/colors" className={router.pathname === '/manage/colors' ? styles.active : ''}>Renkler</Link>
          <p className={styles.navHeading}>Satış</p>
          <Link href="/sales" className={router.pathname === '/sales' ? styles.active : ''}>Satışlar</Link>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerUser}>
            {user && <span>{user.email}</span>}
            <button onClick={handleLogout} className={styles.logoutButton}>
              Çıkış Yap
            </button>
          </div>
        </header>
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;