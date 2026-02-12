import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Home, Rss, Globe, LayoutGrid, X } from 'lucide-react';
import { useStore } from '../../store';

export const MobileNavigation = () => {
  const { sidebarOpen, toggleSidebar } = useStore();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/feeds', label: 'Browse Feeds', icon: Rss },
    { path: '/all-feeds', label: 'All Feeds', icon: Globe },
    { path: '/compare', label: 'Compare', icon: LayoutGrid },
  ];

  const menuVariants: Variants = {
    closed: {
      x: '100%',
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
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
        delay: i * 0.08,
        type: 'spring',
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
            className="fixed top-0 right-0 h-full w-72 bg-[#111827] border-l border-white/[0.08] z-50 md:hidden shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
                <h2 className="text-lg font-bold text-lol-gold">Menu</h2>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
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
                          `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${
                            isActive
                              ? 'bg-lol-gold/15 text-lol-gold'
                              : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-white/[0.08]">
                <a
                  href="/feed.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-lol-gold/10 border border-lol-gold/30 rounded-lg hover:bg-lol-gold/20 transition-colors font-semibold text-lol-gold"
                >
                  <Rss className="w-5 h-5" />
                  RSS Feed
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
