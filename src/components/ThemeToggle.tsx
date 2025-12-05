import React from 'react';
import { useTheme } from '../context/ThemeContext';
import styles from '../styles/ThemeToggle.module.css';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className={styles.themeToggleButton} aria-label="Toggle theme">
      {theme === 'dark' ? <Sun size={28} /> : <Moon size={28} />}
    </button>
  );
};

export default ThemeToggle;
