import { motion } from 'framer-motion';
import { useState } from 'react';
import { useToast } from '../../hooks/useToast';

interface TrendingFeed {
  locale: string;
  flag: string;
  name: string;
  url: string;
}

export const TrendingFeeds = () => {
  const { showToast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const trendingFeeds: TrendingFeed[] = [
    {
      locale: 'en-us',
      flag: '🇺🇸',
      name: 'English (US)',
      url: 'https://onestepat4time.github.io/lolstonksrss/feed/en-us',
    },
    {
      locale: 'ja-jp',
      flag: '🇯🇵',
      name: 'Japanese',
      url: 'https://onestepat4time.github.io/lolstonksrss/feed/ja-jp',
    },
    {
      locale: 'ko-kr',
      flag: '🇰🇷',
      name: 'Korean',
      url: 'https://onestepat4time.github.io/lolstonksrss/feed/ko-kr',
    },
    {
      locale: 'zh-cn',
      flag: '🇨🇳',
      name: 'Chinese (Simplified)',
      url: 'https://onestepat4time.github.io/lolstonksrss/feed/zh-cn',
    },
    {
      locale: 'es-es',
      flag: '🇪🇸',
      name: 'Spanish',
      url: 'https://onestepat4time.github.io/lolstonksrss/feed/es-es',
    },
  ];

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      showToast('RSS URL copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('Failed to copy URL', 'error');
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-block mb-4"
          >
            <span className="text-5xl">🔥</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
            Trending Feeds
          </h2>
          <p className="text-gray-400 text-lg">
            The most popular RSS feeds this week
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {trendingFeeds.map((feed, index) => (
            <motion.div
              key={feed.locale}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div className="p-6 bg-lol-card rounded-xl border border-lol-gold/20 transition-all duration-300 group-hover:border-lol-gold/50 group-hover:shadow-gold">
                {/* Flag emoji */}
                <motion.div
                  className="text-5xl mb-3 text-center"
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 2, delay: index * 0.2, repeat: Infinity, repeatDelay: 3 }}
                >
                  {feed.flag}
                </motion.div>

                {/* Locale name */}
                <h3 className="text-white font-semibold text-center mb-3 font-display">
                  {feed.name}
                </h3>

                {/* Copy button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(feed.url, feed.locale)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                    copiedId === feed.locale
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-lol-gold/10 text-lol-gold border border-lol-gold/30 hover:bg-lol-gold/20'
                  }`}
                >
                  {copiedId === feed.locale ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy URL
                    </span>
                  )}
                </motion.button>

                {/* Rank badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center text-black font-bold text-sm shadow-lg">
                  {index + 1}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all feeds link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <a
            href="/feeds"
            className="inline-flex items-center gap-2 text-lol-gold hover:text-lol-gold-light font-semibold transition-colors group"
          >
            View all {202} available feeds
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
