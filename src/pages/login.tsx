import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';
import { createSupabaseBrowserClient } from '../lib/supabaseClient';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';

const LoginPage = () => {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Parolan yanlış veya kullanıcı bulunamadı.");
      setIsLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glowOrb1}></div>
      <div className={styles.glowOrb2}></div>

      <div className={styles.glassCard}>
        <div className={styles.header}>
          <Image src="/assets/logo.svg" alt="Logo" width={160} height={160} className={styles.logoIcon} />
          <h1 className={styles.title}>galileoff.</h1>
          <p className={styles.subtitle}>Yönetim Paneli</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          
          <div className={styles.inputGroup}>
            <input
              id="email"
              type="email"
              placeholder="E-posta adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
            <Mail className={styles.icon} size={20} />
          </div>

          <div className={styles.inputGroup}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
            <Lock className={styles.icon} size={20} />
            
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? <Loader2 className={styles.spinner} size={20} /> : 'Giriş Yap'}
          </button>
        </form>
        
        <div className={styles.footer}>
          <span>© 2025 🧡galileoff.</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;