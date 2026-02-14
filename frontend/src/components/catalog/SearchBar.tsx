import { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onChange('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onChange]);

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        aria-label="Search feeds by game, language, or region"
        placeholder="Search feeds by game, language, region..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-20 py-3.5 bg-lol-dark-secondary border border-white/[0.08] rounded-xl text-white placeholder-gray-500 transition-colors focus:border-lol-gold/50 focus:ring-2 focus:ring-lol-gold/20 outline-none"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {value && (
          <button
            onClick={() => onChange('')}
            className="p-1 text-gray-500 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {!value && (
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-gray-500 bg-white/[0.04] border border-white/[0.08] rounded font-mono">
            /
          </kbd>
        )}
      </div>
    </div>
  );
};
