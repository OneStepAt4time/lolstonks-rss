import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
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
    primary: 'bg-lol-gold/15 text-lol-gold border border-lol-gold/30 hover:bg-lol-gold/25',
    secondary: 'bg-hextech/15 text-hextech border border-hextech/30 hover:bg-hextech/25',
    ghost: 'text-gray-400 hover:text-lol-gold hover:bg-white/[0.04]',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-sm gap-1.5',
    md: 'px-3 py-2 text-base gap-2',
    lg: 'px-4 py-2.5 text-lg gap-2.5',
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
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
    } catch {
      showToast('Failed to copy URL', 'error');
    }
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={handleCopy}
      aria-label="Copy URL to clipboard"
    >
      {isCopied ? (
        <Check className={iconSize[size]} />
      ) : (
        <Copy className={iconSize[size]} />
      )}

      {showLabel && (
        <span className="whitespace-nowrap">
          {isCopied ? copiedLabel : label}
        </span>
      )}
    </button>
  );
};
