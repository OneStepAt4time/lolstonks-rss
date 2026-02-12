import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Rss, ChevronDown, ExternalLink, Info } from 'lucide-react';

interface RssReader {
  id: string;
  name: string;
  url: string | ((feedUrl: string) => string);
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
    description: 'Modern RSS reader with AI-powered insights',
    url: (feedUrl: string) => `https://feedly.com/i/subscription/feed/${encodeURIComponent(feedUrl)}`,
  },
  {
    id: 'inoreader',
    name: 'Inoreader',
    description: 'Powerful RSS reader for power users',
    url: (feedUrl: string) => `https://www.inoreader.com/?add_feed=${encodeURIComponent(feedUrl)}`,
  },
  {
    id: 'newsblur',
    name: 'NewsBlur',
    description: 'Social RSS reader with story filtering',
    url: (feedUrl: string) => `https://www.newsblur.com/?url=${encodeURIComponent(feedUrl)}`,
  },
  {
    id: 'the-old-reader',
    name: 'The Old Reader',
    description: 'Simple, privacy-focused RSS reader',
    url: (feedUrl: string) => `https://theoldreader.com/feeds/subscribe?url=${encodeURIComponent(feedUrl)}`,
  },
  {
    id: 'rss-com',
    name: 'RSS.com',
    description: 'Email notifications for RSS feeds',
    url: (feedUrl: string) => `https://rss.com/follow/${encodeURIComponent(feedUrl)}`,
  },
  {
    id: 'feedbin',
    name: 'Feedbin',
    description: 'Fast, minimalist RSS reader',
    url: (feedUrl: string) => `https://feedbin.com/?subscribe=${encodeURIComponent(feedUrl)}`,
  },
];

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-5 py-2.5 text-lg gap-2.5',
};

export const SubscribeButton = ({
  feedUrl,
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
    const subscriptionUrl: string = typeof reader.url === 'function' ? reader.url(feedUrl) : reader.url;
    window.open(subscriptionUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  if (variant === 'button-group') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {RSS_READERS.map((reader) => (
          <button
            key={reader.id}
            className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-[#111827] border border-white/[0.08] text-gray-300 hover:border-lol-gold/30 hover:text-lol-gold ${sizeStyles[size]}`}
            onClick={() => handleSubscribe(reader)}
            title={`Subscribe with ${reader.name}: ${reader.description}`}
            aria-label={`Subscribe with ${reader.name}`}
          >
            <Rss className="w-4 h-4" />
            <span className="whitespace-nowrap">{reader.name}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors btn-primary ${sizeStyles[size]} ${
          isOpen ? 'ring-2 ring-lol-gold/30' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Subscribe to feed"
      >
        <Rss className="w-5 h-5" />
        <span className="whitespace-nowrap">Subscribe</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className={`absolute z-50 mt-2 w-72 rounded-xl shadow-2xl bg-[#111827] border border-white/[0.08] overflow-hidden ${
                position === 'right' ? 'right-0' : 'left-0'
              }`}
              role="menu"
            >
              <div className="p-3 border-b border-white/[0.06]">
                <h3 className="font-semibold text-lol-gold text-sm tracking-wide uppercase">
                  Subscribe with
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Choose your preferred RSS reader
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto py-1">
                {RSS_READERS.map((reader) => (
                  <button
                    key={reader.id}
                    role="menuitem"
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] group"
                    onClick={() => handleSubscribe(reader)}
                  >
                    <Rss className="w-5 h-5 text-gray-500 group-hover:text-lol-gold transition-colors flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="block font-medium text-sm text-gray-200 group-hover:text-lol-gold transition-colors">
                        {reader.name}
                      </span>
                      <span className="block text-xs text-gray-500 truncate">
                        {reader.description}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>

              <div className="p-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Info className="w-3 h-3" />
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
