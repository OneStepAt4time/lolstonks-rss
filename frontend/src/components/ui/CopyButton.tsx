import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useToast } from '../../hooks/useToast';

interface CopyButtonProps {
  url: string;
  onCopy?: (url: string) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  copiedLabel?: string;
}

export const CopyButton = ({
  url,
  onCopy,
  className = '',
  variant = 'primary',
  size = 'md',
  showLabel = false,
  label = 'Copy URL',
  copiedLabel = 'Copied!',
}: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { showToast } = useToast();

  const variantStyles = {
    primary: 'bg-gradient-gold text-lol-dark border-2 border-lol-gold hover:shadow-glow',
    secondary: 'bg-lol-blue text-lol-dark border-2 border-lol-blue hover:shadow-hextech',
    ghost: 'bg-transparent text-lol-gold border border-lol-gold/40 hover:border-lol-gold hover:bg-lol-gold/10 hover:shadow-glow-sm',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-5 py-2.5 text-lg gap-2.5',
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      showToast('URL copied to clipboard!', 'success');
      onCopy?.(url);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      showToast('Failed to copy URL', 'error');
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center
        rounded-lg font-medium font-display
        transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      onClick={handleCopy}
      aria-label="Copy URL to clipboard"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isCopied ? (
          <motion.span
            key="check"
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={iconSize[size]}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={iconSize[size]}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0, rotate: 180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: -180, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={iconSize[size]}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>

      {showLabel && (
        <span className="whitespace-nowrap tracking-wide">
          {isCopied ? copiedLabel : label}
        </span>
      )}
    </motion.button>
  );
};
