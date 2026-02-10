import { useState } from 'react';
import { motion } from 'framer-motion';

export interface SampleArticle {
  title: string;
  url: string;
}

export interface FeedPreviewCardProps {
  url: string;
  title: string;
  locale: string;
  category?: string;
  sampleArticles?: SampleArticle[];
  onCopy?: () => void;
}

interface RSSReader {
  name: string;
  icon: string;
  url: string;
  color: string;
}

const RSS_READERS: RSSReader[] = [
  {
    name: 'Feedly',
    icon: '📰',
    url: 'https://feedly.com/i/subscription/feed/',
    color: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30',
  },
  {
    name: 'Inoreader',
    icon: '📬',
    url: 'https://www.inoreader.com/feed/',
    color: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
  },
  {
    name: 'NewsBlur',
    icon: '📰',
    url: 'http://www.newsblur.com/?url=',
    color: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30',
  },
  {
    name: 'The Old Reader',
    icon: '📖',
    url: 'https://theoldreader.com/feeds/subscribe?url=',
    color: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30',
  },
];

export const FeedPreviewCard = ({
  url,
  title,
  locale,
  category,
  sampleArticles = [],
  onCopy,
}: FeedPreviewCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onCopy?.();

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getReaderUrl = (reader: RSSReader) => {
    return `${reader.url}${encodeURIComponent(url)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-lol-card border border-lol-gold/20 rounded-xl overflow-hidden
                 hover:border-lol-gold/40 transition-all duration-300
                 hover:shadow-glow hover:-translate-y-1"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-lol-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Header */}
      <div className="relative p-5 border-b border-lol-gold/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-display font-semibold text-lol-gold mb-2 truncate group-hover:text-lol-gold-light transition-colors">
              {title}
            </h3>

            {/* Metadata tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium
                              bg-lol-blue/10 text-lol-blue rounded-full border border-lol-blue/30">
                🌍 {locale.toUpperCase()}
              </span>

              {category && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium
                                bg-lol-gold/10 text-lol-gold rounded-full border border-lol-gold/30">
                  📂 {category}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium
                              bg-green-500/10 text-green-400 rounded-full border border-green-500/30">
                📡 RSS
              </span>
            </div>
          </div>
        </div>

        {/* URL display with copy */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-lol-dark-secondary rounded-lg border border-lol-gold/10 px-3 py-2">
            <code className="text-xs text-gray-400 truncate block font-mono">{url}</code>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                       ${copied
                         ? 'bg-green-500 text-white'
                         : 'bg-lol-gold/10 text-lol-gold hover:bg-lol-gold/20'
                       }`}
            aria-label={copied ? 'Copied!' : 'Copy feed URL'}
          >
            {copied ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Sample articles */}
      {sampleArticles.length > 0 && (
        <div className="relative p-5 border-b border-lol-gold/10">
          <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">
            Latest Articles
          </p>

          <ul className="space-y-2">
            {sampleArticles.slice(0, 3).map((article, index) => (
              <li key={article.url}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/article flex items-start gap-2 p-2 rounded-lg
                           hover:bg-lol-hover transition-colors duration-200"
                >
                  <span className="flex-shrink-0 text-lol-gold/60 font-mono text-sm">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-sm text-gray-300 line-clamp-1 group-hover/article:text-lol-gold transition-colors">
                    {article.title}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500 group-hover/article:text-lol-gold ml-auto flex-shrink-0
                                 group-hover/article:translate-x-0.5 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="relative p-5">
        {/* Primary actions */}
        <div className="flex items-center gap-3 mb-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                     bg-gradient-gold text-lol-dark font-semibold rounded-lg
                     hover:shadow-gold transition-all duration-300
                     hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Open Feed
          </a>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="px-4 py-2.5 border-2 border-lol-gold text-lol-gold rounded-lg
                     hover:bg-lol-gold/10 transition-all duration-300 font-medium"
          >
            {copied ? 'Copied!' : 'Copy URL'}
          </motion.button>
        </div>

        {/* Subscribe with reader */}
        <div>
          <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">
            Subscribe with
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {RSS_READERS.map((reader) => (
              <a
                key={reader.name}
                href={getReaderUrl(reader)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                         border transition-all duration-200
                         ${reader.color}
                         hover:-translate-y-0.5 hover:shadow-lg`}
                title={`Subscribe with ${reader.name}`}
              >
                <span className="text-base">{reader.icon}</span>
                <span className="text-xs font-medium text-gray-300">{reader.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Glow effect on corners */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-lol-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-lol-blue/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
};
