import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
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
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[#1DA1F2]/15 hover:border-[#1DA1F2]/30',
    },
    {
      name: 'Reddit',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
      color: 'hover:bg-[#FF4500]/15 hover:border-[#FF4500]/30',
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[#1877F2]/15 hover:border-[#1877F2]/30',
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[#0A66C2]/15 hover:border-[#0A66C2]/30',
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#111827] border border-white/[0.08] rounded-xl p-6 max-w-md w-full shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-lol-gold">Share Article</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Article Preview */}
          <div className="mb-5 p-4 bg-[#0a0e17] rounded-lg border border-white/[0.06]">
            <p className="text-xs text-hextech mb-1 font-medium">{article.source}</p>
            <p className="font-medium text-sm line-clamp-2">{article.title}</p>
          </div>

          {/* Share Links */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 p-3 rounded-lg bg-[#0a0e17] border border-white/[0.08] transition-colors ${link.color}`}
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-sm">{link.name}</span>
              </a>
            ))}
          </div>

          {/* Copy Link */}
          <button
            onClick={copyToClipboard}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
              copied
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-[#0a0e17] border-white/[0.08] hover:border-lol-gold/30 text-gray-300'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span className="font-medium text-sm">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span className="font-medium text-sm">Copy Link</span>
              </>
            )}
          </button>

          {/* URL Display */}
          <div className="mt-3 p-3 bg-[#0a0e17] rounded-lg border border-white/[0.06]">
            <p className="text-xs text-gray-500 mb-1">Article URL:</p>
            <p className="text-xs text-hextech truncate font-mono">{shareUrl}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
