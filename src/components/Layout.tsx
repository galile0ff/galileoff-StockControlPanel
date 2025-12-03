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

  if (loading) {
    return <div>Yükleniyor...</div>;
  }
  
  if (!user) {
    return null; 
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Link href="/">İNCEWEAR</Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/">Dashboard</Link>
          <p className={styles.navHeading}>Yönetim</p>
          <Link href="/manage/products">Ürünler</Link>
          <Link href="/manage/categories">Kategoriler</Link>
          <Link href="/manage/sizes">Bedenler</Link>
          <Link href="/manage/colors">Renkler</Link>
          <p className={styles.navHeading}>Satış</p>
          <Link href="/sales">Satışlar</Link>
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
