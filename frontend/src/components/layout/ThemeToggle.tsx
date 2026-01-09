import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStore } from '../../store';

export const ThemeToggle = () => {
  const { theme, effectiveTheme, setTheme } = useStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative group">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (theme === 'light') setTheme('dark');
          else if (theme === 'dark') setTheme('system');
          else setTheme('light');
        }}
        className="px-3 py-1 rounded-lg hover:bg-lol-hover transition-colors text-sm font-display font-medium tracking-wide"
        title={`Current theme: ${theme === 'system' ? `System (${effectiveTheme})` : theme}`}
      >
        {theme === 'system' ? `AUTO (${effectiveTheme})` : theme.toUpperCase()}
      </motion.button>

      {/* Tooltip */}
      <div className="absolute top-full right-0 mt-2 px-3 py-1 text-xs bg-lol-card border border-lol-gold/20 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {theme === 'system' ? `System (${effectiveTheme})` : theme}
      </div>
    </div>
  );
};
