import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Navigation } from './Navigation';
import { MobileNavigation } from './MobileNavigation';
import { useStore } from '../../store';

export const Header = () => {
  const { sidebarOpen, toggleSidebar } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/feeds', label: 'Feeds' },
    { path: '/compare', label: 'Compare' },
  ];

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass-strong border-b border-lol-gold/20 shadow-gold'
            : 'bg-lol-dark/80 backdrop-blur-md border-b border-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
              onMouseEnter={() => setHoveredLink('logo')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <div className="relative">
                <h1 className="text-2xl font-display font-bold leading-tight">
                  <span className="text-lol-gold drop-shadow-lg">LoL</span>{' '}
                  <span className="text-white">Stonks</span>
                </h1>
                <motion.p
                  className="text-xs font-display tracking-widest uppercase text-lol-blue"
                  animate={{
                    opacity: hoveredLink === 'logo' ? [1, 0.5, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  RSS Feed
                </motion.p>
                <AnimatePresence>
                  {hoveredLink === 'logo' && (
                    <motion.div
                      className="absolute -bottom-1 left-0 h-0.5 bg-gradient-gold"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      exit={{ width: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <Navigation />

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="relative px-4 py-2 font-display font-medium tracking-wide transition-colors"
                      onMouseEnter={() => setHoveredLink(link.path)}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      <span
                        className={`relative z-10 transition-colors ${
                          isActive
                            ? 'text-lol-gold'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        {link.label}
                      </span>
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-gold"
                          layoutId="activeNav"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                      {!isActive && hoveredLink === link.path && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-lol-gold/50"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          exit={{ scaleX: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Mobile Menu Button */}
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-lg hover:bg-lol-gold/10 transition-all duration-300"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <AnimatePresence mode="wait">
                    {sidebarOpen ? (
                      <motion.path
                        key="close"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <motion.path
                        key="menu"
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.2 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </AnimatePresence>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Animated Bottom Border */}
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-gradient-gold"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: scrolled ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ originX: 0 }}
        />
      </motion.header>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </>
  );
};
