import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, FolderOpen, Newspaper, Radio, ExternalLink } from 'lucide-react';

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
        const response = await fetch(feedUrl);
        if (!response.ok) throw new Error('Failed to fetch feed');

        const text = await response.text();
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
            item.querySelector('enclosure')?.getAttribute('url') || undefined;

          if (title && link) {
            parsedArticles.push({
              title,
              url: link,
              description: description?.replace(/<[^>]*>/g, ''),
              pub_date: pubDate,
              image_url: image,
            });
          }
        });

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
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#111827] border border-white/[0.08] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-lol-gold mb-2">{feedName}</h2>
                <p className="text-sm text-gray-400">{feedUrl}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#1f2937] rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {locale && (
                <span className="px-3 py-1 text-sm bg-hextech/10 text-hextech rounded-full flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {locale.toUpperCase()}
                </span>
              )}
              {category && (
                <span className="px-3 py-1 text-sm bg-lol-gold/10 text-lol-gold rounded-full flex items-center gap-1">
                  <FolderOpen className="w-3.5 h-3.5" />
                  {category}
                </span>
              )}
              {source && (
                <span className="px-3 py-1 text-sm bg-purple-500/10 text-purple-400 rounded-full flex items-center gap-1">
                  <Newspaper className="w-3.5 h-3.5" />
                  {source}
                </span>
              )}
              <span className="px-3 py-1 text-sm bg-green-500/10 text-green-400 rounded-full flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" />
                {feedType}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-[#1f2937] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#1f2937] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <X className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-red-500 mb-2">Failed to Load Feed</h3>
                <p className="text-gray-400 text-center">{error}</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Radio className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-lol-gold mb-2">No Articles Found</h3>
                <p className="text-gray-400">This feed doesn't have any articles yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-400 text-center mb-4">
                  Showing {articles.length} latest articles
                </p>
                {articles.map((article) => (
                  <a
                    key={article.url}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-[#0a0e17] border border-white/[0.08] rounded-lg hover:border-lol-gold/30 transition-all group"
                  >
                    <div className="flex gap-4">
                      {article.image_url && (
                        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-[#1f2937]">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-lol-gold transition-colors">
                          {article.title}
                        </h4>
                        {article.description && (
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                            {article.description}
                          </p>
                        )}
                        <time className="text-xs text-gray-500">{formatDate(article.pub_date)}</time>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/[0.08]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Subscribe to get all articles in your RSS reader
              </p>
              <a
                href={feedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Subscribe
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
