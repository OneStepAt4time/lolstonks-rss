import { NavLink } from 'react-router-dom';
import { Home, Rss, Globe, LayoutGrid } from 'lucide-react';

export const Navigation = () => {
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/feeds', label: 'Browse Feeds', icon: Rss },
    { path: '/all-feeds', label: 'All Feeds', icon: Globe },
    { path: '/compare', label: 'Compare', icon: LayoutGrid },
  ];

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-lol-gold/15 text-lol-gold'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
