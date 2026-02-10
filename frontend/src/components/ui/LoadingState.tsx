import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { ArticleCardSkeleton } from '../articles/ArticleCardSkeleton';

export type LoadingVariant = 'spinner' | 'skeleton' | 'shimmer' | 'dots' | 'bars';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'full';

interface LoadingStateProps {
  /**
   * Loading variant
   * @default 'spinner'
   */
  variant?: LoadingVariant;
  /**
   * Size of the loading indicator
   * @default 'md'
   */
  size?: LoadingSize;
  /**
   * Custom message to display
   */
  message?: string;
  /**
   * Number of skeleton cards to show (for skeleton variant)
   * @default 3
   */
  skeletonCount?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Full screen loading state
   * @default false
   */
  fullScreen?: boolean;
  /**
   * Show as inline (centered in container)
   * @default false
   */
  inline?: boolean;
}

/**
 * Gold shimmer animation component
 */
const GoldShimmer = ({ size = 'md' }: { size?: LoadingSize }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    full: 'w-full h-full min-h-[200px]',
  };

  return (
    <div className={`${sizeClasses[size]} relative overflow-hidden rounded-lg`}>
      {/* Shimmer effect overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-shimmer"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(200, 155, 60, 0.3), transparent)',
        }}
      />
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-lol-card via-lol-gold/20 to-lol-card" />
    </div>
  );
};

/**
 * Hextech-style spinner
 */
const HextechSpinner = ({ size = 'md' }: { size?: LoadingSize }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
    full: 'w-24 h-24 border-6',
  };

  return (
    <div className="relative">
      {/* Outer spinner */}
      <motion.div
        className={`${sizeClasses[size]} rounded-full border-lol-gold/30 border-t-lol-gold`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner glow */}
      <motion.div
        className={`absolute inset-0 rounded-full shadow-[0_0_15px_rgba(200,155,60,0.5)]`}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-2 h-2 bg-lol-gold rounded-full"
          animate={{ scale: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
    </div>
  );
};

/**
 * Animated dots loader
 */
const DotsLoader = ({ size = 'md' }: { size?: LoadingSize }) => {
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    full: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${dotSizes[size]} bg-lol-gold rounded-full`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/**
 * Animated bars loader
 */
const BarsLoader = ({ size = 'md' }: { size?: LoadingSize }) => {
  const barSizes = {
    sm: { w: 'w-1', h: 'h-6' },
    md: { w: 'w-2', h: 'h-10' },
    lg: { w: 'w-3', h: 'h-14' },
    full: { w: 'w-4', h: 'h-20' },
  };

  const sizeClass = barSizes[size];

  return (
    <div className="flex items-end gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={`${sizeClass.w} bg-lol-gold rounded-t-sm`}
          animate={{
            height: [sizeClass.h, '100%', sizeClass.h],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/**
 * Container wrapper based on display mode
 */
const LoadingContainer = ({
  children,
  fullScreen,
  inline,
  className,
}: {
  children: ReactNode;
  fullScreen?: boolean;
  inline?: boolean;
  className?: string;
}) => {
  const baseClasses = 'flex flex-col items-center justify-center gap-4';

  if (fullScreen) {
    return (
      <div className={`${baseClasses} min-h-screen ${className}`}>
        {children}
      </div>
    );
  }

  if (inline) {
    return (
      <div className={`${baseClasses} py-12 ${className}`}>
        {children}
      </div>
    );
  }

  return <div className={`${baseClasses} ${className}`}>{children}</div>;
};

/**
 * LoadingState Component
 *
 * A centralized loading component with multiple variants and gold-themed animations.
 * Supports full screen, inline, and container modes.
 *
 * @example
 * ```tsx
 * // Basic spinner
 * <LoadingState />
 *
 * // Full screen with message
 * <LoadingState variant="spinner" fullScreen message="Loading articles..." />
 *
 * // Skeleton cards for article list
 * <LoadingState variant="skeleton" skeletonCount={6} />
 *
 * // Inline shimmer
 * <LoadingState variant="shimmer" inline size="lg" />
 * ```
 */
export const LoadingState = ({
  variant = 'spinner',
  size = 'md',
  message,
  skeletonCount = 3,
  className = '',
  fullScreen = false,
  inline = false,
}: LoadingStateProps) => {
  // Render appropriate loader based on variant
  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return <HextechSpinner size={size} />;
      case 'shimmer':
        return <GoldShimmer size={size} />;
      case 'dots':
        return <DotsLoader size={size} />;
      case 'bars':
        return <BarsLoader size={size} />;
      case 'skeleton':
        return null; // Handled separately
      default:
        return <HextechSpinner size={size} />;
    }
  };

  // Skeleton variant renders differently
  if (variant === 'skeleton') {
    const containerClass = fullScreen
      ? 'min-h-screen py-12'
      : inline
        ? 'py-12'
        : '';

    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${containerClass} ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ArticleCardSkeleton key={i} index={i} />
        ))}
      </div>
    );
  }

  return (
    <LoadingContainer fullScreen={fullScreen} inline={inline} className={className}>
      {renderLoader()}

      {/* Optional message */}
      {message && (
        <motion.p
          className="text-lol-gold font-display uppercase tracking-wider text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}

      {/* Decorative elements for premium feel */}
      {(fullScreen || inline) && (variant === 'spinner' || variant === 'dots' || variant === 'bars') && (
        <>
          {/* Corner accents */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-lol-gold/20 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-lol-gold/20 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-lol-gold/20 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-lol-gold/20 rounded-br-lg" />
        </>
      )}
    </LoadingContainer>
  );
};

/**
 * HOC to wrap a component with loading state
 *
 * @example
 * ```tsx
 * const ArticlesWithLoading = withLoadingState(ArticlesGrid, {
 *   variant: 'skeleton',
 *   skeletonCount: 6,
 * });
 * ```
 */
export function withLoadingState<P extends object>(
  Component: React.ComponentType<P>,
  loadingProps?: Partial<LoadingStateProps>
) {
  return (props: P & { isLoading?: boolean }) => {
    const { isLoading, ...rest } = props;

    if (isLoading) {
      return <LoadingState {...loadingProps} />;
    }

    return <Component {...(rest as P)} />;
  };
}

export default LoadingState;
