import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Article } from '../../types/article';

interface ShareModalProps {
  article: Article;
  onClose: () => void;
}

export const ShareModal = ({ article, onClose }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const shareUrl = article.url;
  const shareTitle = article.title;
  const shareText = `Check out this League of Legends news: ${article.title}`;

  const shareLinks = [
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[#1DA1F2]/20',
    },
    {
      name: 'Reddit',
      icon: '💬',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
      color: 'hover:bg-[#FF4500]/20',
    },
    {
      name: 'Facebook',
      icon: '👍',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[#1877F2]/20',
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[#0A66C2]/20',
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-lol-card border border-lol-gold/30 rounded-2xl p-6 max-w-md w-full
                     shadow-2xl shadow-lol-gold/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-lol-gold">Share Article</h2>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-lol-hover transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          {/* Article Preview */}
          <div className="mb-6 p-4 bg-lol-dark rounded-lg border border-lol-gold/10">
            <p className="text-sm text-lol-blue mb-1">{article.source}</p>
            <p className="font-medium line-clamp-2">{article.title}</p>
          </div>

          {/* Share Links */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {shareLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 p-3 rounded-lg bg-lol-dark border border-lol-gold/20
                          transition-all ${link.color}`}
              >
                <span className="text-2xl">{link.icon}</span>
                <span className="font-medium">{link.name}</span>
              </motion.a>
            ))}
          </div>

          {/* Copy Link */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={copyToClipboard}
            className={`w-full flex items-center justify-center gap-3 p-3 rounded-lg
                      border transition-all ${
                        copied
                          ? 'bg-green-500/20 border-green-500 text-green-400'
                          : 'bg-lol-dark border-lol-gold/20 hover:border-lol-gold/50'
                      }`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-medium">Copy Link</span>
              </>
            )}
          </motion.button>

          {/* URL Display */}
          <div className="mt-4 p-3 bg-lol-dark rounded-lg border border-lol-gold/10">
            <p className="text-xs text-gray-400 mb-1">Article URL:</p>
            <p className="text-sm text-lol-blue truncate">{shareUrl}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
