import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Navigation } from './Navigation';
import { MobileNavigation } from './MobileNavigation';
import { useStore } from '../../store';

export const Header = () => {
  const { sidebarOpen, toggleSidebar } = useStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a0e17]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-lg'
            : 'bg-[#0a0e17]/60 backdrop-blur-md border-b border-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div>
                <h1 className="text-xl font-display font-bold leading-tight">
                  <span className="text-lol-gold">LoL</span>{' '}
                  <span className="text-white">Stonks</span>
                </h1>
                <p className="text-[10px] font-display tracking-widest uppercase text-hextech">
                  RSS Feed
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <Navigation />

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              {/* Mobile Menu Button */}
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </>
  );
};
