import { motion } from 'framer-motion';
import { useState } from 'react';
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
  const { toggleBookmark, isBookmarked } = useStore();
  const { showToast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const bookmarked = isBookmarked(article.guid);

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
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group relative bg-lol-card border border-lol-gold/10 rounded-xl overflow-hidden hover:border-lol-gold/40 transition-all duration-300 hover:shadow-gold"
      >
        <div className="flex gap-4 p-4">
          {/* Image */}
          {article.image_url && !imageError && (
            <div className="relative w-32 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-lol-dark-secondary">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-lol-card to-lol-hover animate-pulse" />
              )}
              <img
                src={article.image_url}
                alt={article.title}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  imageLoaded ? 'group-hover:scale-110' : ''
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Source Badge */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-display font-semibold tracking-wider uppercase text-lol-blue">
                {article.source}
              </span>
              <span className="w-1 h-1 bg-lol-gold/50 rounded-full" />
              <time className="text-xs text-gray-500">{formatDate(article.pub_date)}</time>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold line-clamp-2 mb-1 group-hover:text-lol-gold transition-colors duration-300">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {article.title}
              </a>
            </h3>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-all duration-300 ${
                bookmarked
                  ? 'text-lol-gold bg-lol-gold/10 shadow-glow-sm'
                  : 'text-gray-500 hover:text-lol-gold hover:bg-lol-gold/5'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={bookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </motion.button>

            <motion.a
              whileTap={{ scale: 0.9 }}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-lol-blue hover:bg-lol-blue/5 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </motion.a>
          </div>
        </div>

        {/* Hover Gradient Border */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-lol-gold/0 via-lol-gold/10 to-lol-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -8 }}
      className="group relative bg-lol-card border border-lol-gold/10 rounded-2xl overflow-hidden transition-all duration-500 hover:border-lol-gold/50 hover:shadow-gold"
    >
      {/* Image */}
      {article.image_url && !imageError && (
        <div className="relative aspect-video overflow-hidden bg-lol-dark-secondary">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-lol-card to-lol-hover animate-pulse" />
          )}
          <img
            src={article.image_url}
            alt={article.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              imageLoaded ? 'group-hover:scale-110' : ''
            }`}
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-lol-dark via-transparent to-transparent opacity-80" />

          {/* Source Badge */}
          <div className="absolute top-4 right-4 px-3 py-1.5 text-xs font-display font-bold tracking-wider uppercase rounded-lg bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-lg">
            {article.source}
          </div>

          {/* Animated Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-lol-gold/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Shine Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Date and Categories Row */}
        <div className="flex items-center justify-between mb-3">
          <time className="text-xs font-display font-semibold tracking-wider uppercase text-lol-blue">
            {formatDate(article.pub_date)}
          </time>

          {/* Categories */}
          {article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.categories.slice(0, 2).map((category) => (
                <span
                  key={category}
                  className="px-2.5 py-1 text-xs font-display font-semibold tracking-wide uppercase bg-lol-gold/10 text-lol-gold border border-lol-gold/20 rounded-full hover:bg-lol-gold/20 transition-colors duration-300"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-display font-bold leading-tight mb-3 group-hover:text-lol-gold transition-colors duration-300 line-clamp-2">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline decoration-lol-gold/50 underline-offset-4"
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
        <div className="flex items-center justify-between pt-4 border-t border-lol-gold/10">
          <div className="flex items-center gap-2">
            {/* Bookmark Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmark}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                bookmarked
                  ? 'text-lol-gold bg-lol-gold/10 border border-lol-gold/30 shadow-glow-sm'
                  : 'text-gray-500 hover:text-lol-gold hover:bg-lol-gold/5 border border-transparent hover:border-lol-gold/20'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <svg
                className="w-5 h-5"
                fill={bookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </motion.button>

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-2.5 rounded-xl text-gray-500 hover:text-lol-blue hover:bg-lol-blue/5 border border-transparent hover:border-lol-blue/20 transition-all duration-300"
              title="Share article"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </motion.button>
          </div>

          {/* Read More Button */}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn relative px-5 py-2.5 bg-gradient-to-r from-lol-gold/20 to-lol-gold/10 border border-lol-gold/30 rounded-xl overflow-hidden transition-all duration-300 hover:border-lol-gold/60 hover:shadow-glow-sm"
          >
            <span className="relative z-10 flex items-center gap-2 text-sm font-display font-semibold tracking-wide uppercase text-lol-gold">
              Read More
              <svg
                className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-lol-gold/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
          </motion.a>
        </div>
      </div>

      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-16 h-16">
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-lol-gold/30 rounded-tr-2xl" />
      </div>

      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(200, 155, 60, 0.1) 0%, transparent 50%)',
        }}
      />

      {showShareModal && (
        <ShareModal article={article} onClose={() => setShowShareModal(false)} />
      )}
    </motion.article>
  );
};
