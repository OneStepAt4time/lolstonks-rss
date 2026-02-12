import { motion } from 'framer-motion';
import { useState } from 'react';
import { Bookmark, Share2, ExternalLink, ArrowRight } from 'lucide-react';
import { useStore } from '../../store';
import { useToast } from '../../hooks/useToast';
import type { Article } from '../../types/article';
import { ShareModal } from './ShareModal';

interface ArticleCardProps {
  article: Article;
  index?: number;
  variant?: 'default' | 'compact' | 'featured';
}

export const ArticleCard = ({
  article,
  index = 0,
  variant = 'default',
}: ArticleCardProps) => {
  const toggleBookmark = useStore((state) => state.toggleBookmark);
  const bookmarked = useStore((state) => state.bookmarks.includes(article.guid));
  const { showToast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleBookmark(article.guid);
    showToast(
      bookmarked ? 'Bookmark removed' : 'Article bookmarked!',
      bookmarked ? 'info' : 'success'
    );
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowShareModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (variant === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
        className="group bg-[#111827] border border-white/[0.08] rounded-xl overflow-hidden hover:border-lol-gold/30 transition-all duration-300"
      >
        <div className="flex gap-4 p-4">
          {/* Image */}
          {article.image_url && !imageError && (
            <div className="relative w-32 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#0a0e17]">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-[#1f2937] animate-pulse" />
              )}
              <img
                src={article.image_url}
                alt={article.title}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  imageLoaded ? 'group-hover:scale-105' : ''
                }`}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold tracking-wider uppercase text-hextech">
                {article.source}
              </span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <time className="text-xs text-gray-500">{formatDate(article.pub_date)}</time>
            </div>

            <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-lol-gold transition-colors">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {article.title}
              </a>
            </h3>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                bookmarked
                  ? 'text-lol-gold bg-lol-gold/10'
                  : 'text-gray-500 hover:text-lol-gold hover:bg-white/[0.04]'
              }`}
            >
              <Bookmark className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} />
            </button>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-hextech hover:bg-white/[0.04] rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="group bg-[#111827] border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-300 hover:border-lol-gold/30 hover:-translate-y-1"
    >
      {/* Image */}
      {article.image_url && !imageError && (
        <div className="relative aspect-video overflow-hidden bg-[#0a0e17]">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#1f2937] animate-pulse" />
          )}
          <img
            src={article.image_url}
            alt={article.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              imageLoaded ? 'group-hover:scale-105' : ''
            }`}
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-60" />

          {/* Source Badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold tracking-wider uppercase rounded-lg bg-black/60 backdrop-blur-sm text-white border border-white/10">
            {article.source}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Date and Categories Row */}
        <div className="flex items-center justify-between mb-3">
          <time className="text-xs font-semibold tracking-wider uppercase text-hextech">
            {formatDate(article.pub_date)}
          </time>

          {article.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.categories.slice(0, 2).map((category) => (
                <span
                  key={category}
                  className="badge-gold text-[10px]"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold leading-tight mb-3 group-hover:text-lol-gold transition-colors line-clamp-2">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {article.title}
          </a>
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1 leading-relaxed">
            {article.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                bookmarked
                  ? 'text-lol-gold bg-lol-gold/10'
                  : 'text-gray-500 hover:text-lol-gold hover:bg-white/[0.04]'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Bookmark className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-gray-500 hover:text-hextech hover:bg-white/[0.04] transition-colors"
              title="Share article"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold tracking-wide text-lol-gold bg-lol-gold/10 border border-lol-gold/20 rounded-lg hover:bg-lol-gold/20 hover:border-lol-gold/40 transition-colors"
          >
            Read More
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {showShareModal && (
        <ShareModal article={article} onClose={() => setShowShareModal(false)} />
      )}
    </motion.article>
  );
};
