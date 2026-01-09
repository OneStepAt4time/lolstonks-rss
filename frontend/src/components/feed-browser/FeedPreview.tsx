import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Article {
  title: string;
  url: string;
  description?: string;
  pub_date: string;
  source?: string;
  image_url?: string;
}

interface FeedPreviewProps {
  feedUrl: string;
  feedName: string;
  feedType: string;
  locale?: string;
  category?: string;
  source?: string;
  onClose: () => void;
}

export const FeedPreview = ({
  feedUrl,
  feedName,
  feedType,
  locale,
  category,
  source,
  onClose,
}: FeedPreviewProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch RSS feed and parse it
        const response = await fetch(feedUrl);
        if (!response.ok) throw new Error('Failed to fetch feed');

        const text = await response.text();

        // Parse RSS XML
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const items = xml.querySelectorAll('item');
        const parsedArticles: Article[] = [];

        items.forEach((item) => {
          const title = item.querySelector('title')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          const image =
            item.querySelector('enclosure')?.getAttribute('url') ||
            item.querySelector('content\\:url')?.textContent ||
            undefined;

          if (title && link) {
            parsedArticles.push({
              title,
              url: link,
              description: description?.replace(/<[^>]*>/g, ''), // Strip HTML
              pub_date: pubDate,
              image_url: image,
            });
          }
        });

        // Show first 5 articles as preview
        setArticles(parsedArticles.slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feed');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [feedUrl]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-lol-card border border-lol-gold/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden
                   flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-lol-gold/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-lol-gold mb-2">{feedName}</h2>
                <p className="text-sm text-gray-400">{feedUrl}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-lol-hover rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-2">
              {locale && (
                <span className="px-3 py-1 text-sm bg-lol-blue/10 text-lol-blue rounded-full">
                  🌍 {locale.toUpperCase()}
                </span>
              )}
              {category && (
                <span className="px-3 py-1 text-sm bg-lol-gold/10 text-lol-gold rounded-full">
                  📂 {category}
                </span>
              )}
              {source && (
                <span className="px-3 py-1 text-sm bg-purple-500/10 text-purple-400 rounded-full">
                  📰 {source}
                </span>
              )}
              <span className="px-3 py-1 text-sm bg-green-500/10 text-green-400 rounded-full">
                📡 {feedType}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-lol-hover rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-lol-hover rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-red-500 mb-2">Failed to Load Feed</h3>
                <p className="text-gray-400 text-center">{error}</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-lol-gold mb-2">No Articles Found</h3>
                <p className="text-gray-400">This feed doesn't have any articles yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-400">
                    Showing {articles.length} latest articles from this feed
                  </p>
                </div>

                {articles.map((article, index) => (
                  <motion.a
                    key={article.url}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="block p-4 bg-lol-dark border border-lol-gold/10 rounded-xl
                             hover:border-lol-gold/30 hover:bg-lol-hover transition-all group"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      {article.image_url && (
                        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-lol-hover">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-lol-gold transition-colors">
                          {article.title}
                        </h4>

                        {article.description && (
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                            {article.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {article.source && (
                            <span className="text-lol-blue">{article.source}</span>
                          )}
                          <span>•</span>
                          <time>{formatDate(article.pub_date)}</time>
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="flex-shrink-0 self-center">
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-lol-gold group-hover:translate-x-1
                                     transition-all"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-lol-gold/10">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Subscribe to this feed to get all articles in your RSS reader
              </p>
              <a
                href={feedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2v-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 14a2 2 0 012-2h8a2 2 0 012 2v2"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 10a2 2 0 012-2h8a2 2 0 012 2v2"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v2" />
                </svg>
                Subscribe
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
