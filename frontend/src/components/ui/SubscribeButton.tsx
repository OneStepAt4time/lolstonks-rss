import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface RssReader {
  id: string;
  name: string;
  icon: string;
  color: string;
  url: string;
  description: string;
}

interface SubscribeButtonProps {
  feedUrl: string;
  feedTitle?: string;
  className?: string;
  variant?: 'dropdown' | 'button-group';
  size?: 'sm' | 'md' | 'lg';
  position?: 'left' | 'right';
}

const RSS_READERS: RssReader[] = [
  {
    id: 'feedly',
    name: 'Feedly',
    icon: '📰',
    color: 'bg-green-500',
    description: 'Modern RSS reader with AI-powered insights',
    url: (feedUrl: string) => `https://feedly.com/i/subscription/feed/${encodeURIComponent(feedUrl)}`,
  },
  {
    id: 'inoreader',
    name: 'Inoreader',
    icon: '📡',
    color: 'bg-blue-500',
    description: 'Powerful RSS reader for power users',
    url: (feedUrl: string) => `https://www.inoreader.com/?add_feed=${encodeURIComponent(feedUrl)}`,
  },
  {
    id: 'newsblur',
    name: 'NewsBlur',
    icon: '📰',
    color: 'bg-amber-500',
    description: 'Social RSS reader with story filtering',
    url: (feedUrl: string) => `https://www.newsblur.com/?url=${encodeURIComponent(feedUrl)}`,
  },
  {
    id: 'the-old-reader',
    name: 'The Old Reader',
    icon: '📖',
    color: 'bg-orange-500',
    description: 'Simple, privacy-focused RSS reader',
    url: (feedUrl: string) => `https://theoldreader.com/feeds/subscribe?url=${encodeURIComponent(feedUrl)}`,
  },
  {
    id: 'rss-com',
    name: 'RSS.com',
    icon: '🔔',
    color: 'bg-purple-500',
    description: 'Email notifications for RSS feeds',
    url: (feedUrl: string) => `https://rss.com/follow/${encodeURIComponent(feedUrl)}`,
  },
  {
    id: 'feedbin',
    name: 'Feedbin',
    icon: '📬',
    color: 'bg-red-500',
    description: 'Fast, minimalist RSS reader',
    url: (feedUrl: string) => `https://feedbin.com/?subscribe=${encodeURIComponent(feedUrl)}`,
  },
];

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-5 py-2.5 text-lg gap-2.5',
};

const iconSize = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const SubscribeButton = ({
  feedUrl,
  feedTitle = 'LoL Stonks RSS',
  className = '',
  variant = 'dropdown',
  size = 'md',
  position = 'right',
}: SubscribeButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSubscribe = (reader: RssReader) => {
    const subscriptionUrl = typeof reader.url === 'function' ? reader.url(feedUrl) : reader.url;
    window.open(subscriptionUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  if (variant === 'button-group') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {RSS_READERS.map((reader) => (
          <motion.button
            key={reader.id}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`
              inline-flex items-center justify-center
              rounded-lg font-medium font-display
              transition-all duration-200
              bg-lol-card border border-lol-gold/30
              text-lol-gold
              hover:border-lol-gold hover:bg-lol-gold/10 hover:shadow-glow-sm
              ${sizeStyles[size]}
            `}
            onClick={() => handleSubscribe(reader)}
            title={`Subscribe with ${reader.name}: ${reader.description}`}
            aria-label={`Subscribe with ${reader.name}`}
          >
            <span className="text-lg">{reader.icon}</span>
            <span className="whitespace-nowrap">{reader.name}</span>
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          inline-flex items-center justify-center
          rounded-lg font-medium font-display
          transition-all duration-200
          bg-gradient-gold text-lol-dark border-2 border-lol-gold
          hover:shadow-gold
          ${sizeStyles[size]}
          ${isOpen ? 'ring-2 ring-lol-gold-light ring-offset-2 ring-offset-lol-dark' : ''}
        `}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Subscribe to feed"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={iconSize[size]}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <span className="whitespace-nowrap">Subscribe</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className={iconSize[size]}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`
                absolute z-50 mt-2 w-72
                rounded-xl shadow-2xl
                bg-lol-card border border-lol-gold/20
                overflow-hidden
                ${position === 'right' ? 'right-0' : 'left-0'}
              `}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="subscribe-menu"
            >
              <div className="p-3 bg-lol-dark-secondary/50 border-b border-lol-gold/10">
                <h3 className="font-display font-semibold text-lol-gold text-sm tracking-wide uppercase">
                  Subscribe with
                </h3>
                <p className="text-xs text-lol-text-secondary mt-1">
                  Choose your preferred RSS reader
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto py-2">
                {RSS_READERS.map((reader, index) => (
                  <motion.button
                    key={reader.id}
                    role="menuitem"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.03 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(200, 155, 60, 0.1)' }}
                    className={`
                      w-full flex items-center gap-3
                      px-4 py-3
                      text-left
                      transition-all duration-150
                      hover:bg-lol-gold/10
                      group
                    `}
                    onClick={() => handleSubscribe(reader)}
                  >
                    <span className={`text-2xl ${reader.color} bg-opacity-20 rounded-lg p-2`}>
                      {reader.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="block font-medium text-lol-gold group-hover:text-lol-gold-light">
                        {reader.name}
                      </span>
                      <span className="block text-xs text-lol-text-secondary truncate">
                        {reader.description}
                      </span>
                    </div>
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-lol-gold/40 group-hover:text-lol-gold transition-colors"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </motion.button>
                ))}
              </div>

              <div className="p-3 bg-lol-dark-secondary/30 border-t border-lol-gold/10">
                <div className="flex items-center gap-2 text-xs text-lol-text-tertiary">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3 h-3">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Opens in new tab</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
