import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export type LoadingVariant = 'spinner' | 'skeleton' | 'shimmer' | 'dots' | 'bars';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'full';

interface LoadingStateProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  message?: string;
  skeletonCount?: number;
  className?: string;
  fullScreen?: boolean;
  inline?: boolean;
}

const spinnerSizes = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  full: 'w-20 h-20',
};

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
 * Generic skeleton placeholder block with shimmer animation.
 */
const SkeletonBlock = ({ index = 0 }: { index?: number }) => {
  const shimmerClasses = 'relative overflow-hidden';
  const shimmerBg = 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-lol-card before:via-lol-gold/20 before:to-lol-card before:bg-[length:200%_100%] before:animate-[shimmer_2s_ease-in-out_infinite]';

  return (
    <div
      className="bg-lol-card border border-lol-gold/10 rounded-2xl overflow-hidden flex flex-col h-full animate-pulse"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={`aspect-video bg-lol-card ${shimmerClasses} ${shimmerBg}`} />
      <div className="p-6 space-y-3">
        <div className={`w-20 h-3.5 rounded bg-lol-card ${shimmerClasses} ${shimmerBg}`} />
        <div className="space-y-2">
          <div className={`w-full h-6 rounded bg-lol-card ${shimmerClasses} ${shimmerBg}`} />
          <div className={`w-11/12 h-6 rounded bg-lol-card ${shimmerClasses} ${shimmerBg}`} />
        </div>
        <div className="space-y-2">
          <div className={`w-full h-4 rounded bg-lol-card ${shimmerClasses} ${shimmerBg}`} />
          <div className={`w-3/4 h-4 rounded bg-lol-card ${shimmerClasses} ${shimmerBg}`} />
        </div>
      </div>
    </div>
  );
};

export const LoadingState = ({
  variant = 'spinner',
  size = 'md',
  message,
  skeletonCount = 3,
  className = '',
  fullScreen = false,
  inline = false,
}: LoadingStateProps) => {
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
          <SkeletonBlock key={i} index={i} />
        ))}
      </div>
    );
  }

  return (
    <LoadingContainer fullScreen={fullScreen} inline={inline} className={className}>
      <Loader2 className={`${spinnerSizes[size]} text-lol-gold animate-spin`} />

      {message && (
        <p className="text-lol-gold font-display uppercase tracking-wider text-sm">
          {message}
        </p>
      )}
    </LoadingContainer>
  );
};

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
