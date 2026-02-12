import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const BASE_URL = 'https://onestepat4time.github.io/lolstonks-rss';

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
    { locale: 'en-us', flag: '\u{1F1FA}\u{1F1F8}', name: 'English (US)', url: `${BASE_URL}/feed/en-us` },
    { locale: 'ja-jp', flag: '\u{1F1EF}\u{1F1F5}', name: 'Japanese', url: `${BASE_URL}/feed/ja-jp` },
    { locale: 'ko-kr', flag: '\u{1F1F0}\u{1F1F7}', name: 'Korean', url: `${BASE_URL}/feed/ko-kr` },
    { locale: 'zh-cn', flag: '\u{1F1E8}\u{1F1F3}', name: 'Chinese (Simplified)', url: `${BASE_URL}/feed/zh-cn` },
    { locale: 'es-es', flag: '\u{1F1EA}\u{1F1F8}', name: 'Spanish', url: `${BASE_URL}/feed/es-es` },
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
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
            Trending Feeds
          </h2>
          <p className="text-gray-400 text-lg">
            The most popular RSS feeds
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {trendingFeeds.map((feed, index) => (
            <motion.div
              key={feed.locale}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative group"
            >
              <div className="p-6 bg-[#111827] rounded-xl border border-white/[0.08] hover:border-lol-gold/30 transition-all">
                {/* Flag */}
                <div className="text-4xl mb-3 text-center">
                  {feed.flag}
                </div>

                {/* Locale name */}
                <h3 className="text-white font-semibold text-center mb-3 font-display">
                  {feed.name}
                </h3>

                {/* Copy button */}
                <button
                  onClick={() => copyToClipboard(feed.url, feed.locale)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    copiedId === feed.locale
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-lol-gold/10 text-lol-gold border border-lol-gold/30 hover:bg-lol-gold/20'
                  }`}
                >
                  {copiedId === feed.locale ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy URL
                    </>
                  )}
                </button>

                {/* Rank badge */}
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-lol-gold rounded-full flex items-center justify-center text-black font-bold text-xs">
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
          <Link
            to="/feeds"
            className="inline-flex items-center gap-2 text-lol-gold hover:text-lol-gold-light font-semibold transition-colors group"
          >
            View all available feeds
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
