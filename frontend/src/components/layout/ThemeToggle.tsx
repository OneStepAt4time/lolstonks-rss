import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useStore } from '../../store';

export const ThemeToggle = () => {
  const { theme, effectiveTheme, setTheme } = useStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  const label = theme === 'system' ? `System (${effectiveTheme})` : theme;

  return (
    <div className="relative group">
      <button
        onClick={cycleTheme}
        className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-gray-400 hover:text-white"
        title={`Theme: ${label}`}
        aria-label={`Current theme: ${label}. Click to change.`}
      >
        <Icon className="w-5 h-5" />
      </button>

      {/* Tooltip */}
      <div className="absolute top-full right-0 mt-2 px-3 py-1.5 text-xs bg-[#1f2937] border border-white/[0.08] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none capitalize">
        {label}
      </div>
    </div>
  );
};
