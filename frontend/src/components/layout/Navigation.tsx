import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Navigation = () => {
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/feeds', label: 'Browse Feeds' },
    { path: '/all-feeds', label: 'All Feeds' },
    { path: '/compare', label: 'Compare' },
  ];

  return (
    <nav className="hidden md:flex items-center gap-6">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `px-3 py-2 rounded-lg transition-all duration-200 font-display font-medium tracking-wide ${
              isActive
                ? 'bg-lol-gold/20 text-lol-gold'
                : 'hover:bg-lol-hover hover:text-lol-gold-light'
            }`
          }
        >
          <motion.span
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {item.label}
          </motion.span>
        </NavLink>
      ))}
    </nav>
  );
};
