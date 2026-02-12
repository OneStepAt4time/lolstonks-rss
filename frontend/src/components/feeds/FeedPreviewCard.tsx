import { useState } from 'react';
import { Copy, Check, ExternalLink, Rss, Globe, Tag } from 'lucide-react';

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
  url: string;
  color: string;
}

const RSS_READERS: RSSReader[] = [
  {
    name: 'Feedly',
    url: 'https://feedly.com/i/subscription/feed/',
    color: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30',
  },
  {
    name: 'Inoreader',
    url: 'https://www.inoreader.com/feed/',
    color: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
  },
  {
    name: 'NewsBlur',
    url: 'http://www.newsblur.com/?url=',
    color: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30',
  },
  {
    name: 'The Old Reader',
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
    <div className="group bg-[#111827] border border-white/[0.08] rounded-xl overflow-hidden hover:border-lol-gold/30 transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-lol-gold mb-2 truncate group-hover:text-lol-gold-light transition-colors">
              {title}
            </h3>

            {/* Metadata tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-hextech/10 text-hextech rounded-full border border-hextech/30">
                <Globe className="w-3 h-3" />
                {locale.toUpperCase()}
              </span>

              {category && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-lol-gold/10 text-lol-gold rounded-full border border-lol-gold/30">
                  <Tag className="w-3 h-3" />
                  {category}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                <Rss className="w-3 h-3" />
                RSS
              </span>
            </div>
          </div>
        </div>

        {/* URL display with copy */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-[#0a0e17] rounded-lg border border-white/[0.06] px-3 py-2">
            <code className="text-xs text-gray-400 truncate block font-mono">{url}</code>
          </div>

          <button
            onClick={handleCopy}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              copied
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-lol-gold/10 text-lol-gold border border-lol-gold/20 hover:bg-lol-gold/20'
            }`}
            aria-label={copied ? 'Copied!' : 'Copy feed URL'}
          >
            {copied ? (
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Copied!
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Copy className="w-4 h-4" />
                Copy
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sample articles */}
      {sampleArticles.length > 0 && (
        <div className="p-5 border-b border-white/[0.06]">
          <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">
            Latest Articles
          </p>

          <ul className="space-y-1">
            {sampleArticles.slice(0, 3).map((article, index) => (
              <li key={article.url}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/article flex items-start gap-2 p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  <span className="flex-shrink-0 text-gray-600 font-mono text-sm">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-sm text-gray-300 line-clamp-1 group-hover/article:text-lol-gold transition-colors">
                    {article.title}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-600 group-hover/article:text-lol-gold ml-auto flex-shrink-0 transition-colors" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="p-5">
        {/* Primary actions */}
        <div className="flex items-center gap-3 mb-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Rss className="w-4 h-4" />
            Open Feed
          </a>

          <button
            onClick={handleCopy}
            className="px-4 py-2.5 btn-secondary font-medium"
          >
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
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
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${reader.color}`}
                title={`Subscribe with ${reader.name}`}
              >
                <Rss className="w-3 h-3" />
                <span className="text-xs font-medium text-gray-300">{reader.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
