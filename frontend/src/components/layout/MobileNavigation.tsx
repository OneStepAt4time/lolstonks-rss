import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useStore } from '../../store';

export const MobileNavigation = () => {
  const { sidebarOpen, toggleSidebar } = useStore();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/feeds', label: 'Browse Feeds' },
    { path: '/all-feeds', label: 'All Feeds' },
    { path: '/compare', label: 'Compare' },
  ];

  const menuVariants: Variants = {
    closed: {
      x: '100%',
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants: Variants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const itemVariants: Variants = {
    closed: { x: 50, opacity: 0 },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
      },
    }),
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Mobile Menu */}
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 right-0 h-full w-64 bg-lol-card border-l border-lol-gold/20 z-50 md:hidden shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-lol-gold/20">
                <h2 className="text-lg font-bold text-lol-gold">Menu</h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-lol-hover transition-colors"
                  aria-label="Close menu"
                >
                  ✕
                </motion.button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    custom={index}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                  >
                    <NavLink
                      to={item.path}
                      onClick={toggleSidebar}
                      className={({ isActive }) =>
                        `block px-4 py-3 rounded-lg transition-all duration-200 font-display font-medium tracking-wide ${
                          isActive
                            ? 'bg-lol-gold/20 text-lol-gold'
                            : 'hover:bg-lol-hover hover:text-lol-gold-light'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-lol-gold/20">
                <motion.a
                  href="/feed.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-full px-4 py-3 bg-lol-gold/10 border border-lol-gold/30 rounded-lg hover:bg-lol-gold/20 transition-colors font-display font-semibold text-lol-gold"
                >
                  RSS Feed
                </motion.a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
