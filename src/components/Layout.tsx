import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Layout.module.css';
import { createSupabaseBrowserClient } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Ruler, 
  Palette, 
  ShoppingCart, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon,
  Command
} from 'lucide-react';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Router değiştiğinde sidebar'ı kapat (Mobil için)
  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  if (loading) {
    return <div className={styles.loadingScreen}>Yükleniyor...</div>;
  }
  
  if (!user) {
    return null; 
  }

  const isActive = (path: string) => {
    if (path === '/' && router.pathname === '/') return true;
    if (path !== '/' && router.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className={styles.layoutContainer}>
      
      {/* Mobil Menü Butonu 
          Eğer sidebar açıksa 'menuButtonHidden' classını ekle */}
      <button 
        className={`${styles.menuButton} ${sidebarOpen ? styles.menuButtonHidden : ''}`} 
        onClick={toggleSidebar}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Overlay */}
      <div 
        className={`${styles.overlay} ${sidebarOpen ? styles.showOverlay : ''}`} 
        onClick={toggleSidebar}
      ></div>

      {/* --- SIDEBAR --- */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        
        {/* Logo Alanı */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logoWrapper}>
            <Command size={24} className={styles.logoIcon} />
            <span className={styles.logoText}>INCEWEAR</span>
          </div>
          {/* Mobilde sidebar içinden kapatma butonu */}
          <button className={styles.closeButton} onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        {/* Navigasyon */}
        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <p className={styles.navLabel}>GENEL</p>
            <Link href="/" className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
          </div>

          <div className={styles.navSection}>
            <p className={styles.navLabel}>YÖNETİM</p>
            <Link href="/manage/products" className={`${styles.navItem} ${isActive('/manage/products') ? styles.active : ''}`}>
              <Package size={20} />
              <span>Ürünler</span>
            </Link>
            <Link href="/manage/categories" className={`${styles.navItem} ${isActive('/manage/categories') ? styles.active : ''}`}>
              <Layers size={20} />
              <span>Kategoriler</span>
            </Link>
            <Link href="/manage/sizes" className={`${styles.navItem} ${isActive('/manage/sizes') ? styles.active : ''}`}>
              <Ruler size={20} />
              <span>Bedenler</span>
            </Link>
            <Link href="/manage/colors" className={`${styles.navItem} ${isActive('/manage/colors') ? styles.active : ''}`}>
              <Palette size={20} />
              <span>Renkler</span>
            </Link>
          </div>

          <div className={styles.navSection}>
            <p className={styles.navLabel}>SATIŞ & FİNANS</p>
            <Link href="/manage/sales" className={`${styles.navItem} ${isActive('/manage/sales') ? styles.active : ''}`}>
              <ShoppingCart size={20} />
              <span>Satışlar</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              <UserIcon size={16} />
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userEmail}>{user.email}</span>
              <span className={styles.userRole}>Admin</span>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton} title="Çıkış Yap">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* --- ANA İÇERİK --- */}
      <main className={styles.mainContent}>
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;