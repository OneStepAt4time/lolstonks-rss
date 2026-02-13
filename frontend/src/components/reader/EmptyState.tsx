import { AlertCircle, Newspaper, Search } from 'lucide-react';

type EmptyVariant = 'loading-error' | 'no-articles' | 'no-matches';

interface EmptyStateProps {
  variant: EmptyVariant;
  error?: string | null;
  onRetry?: () => void;
  onClearFilters?: () => void;
  query?: string;
}

export const EmptyState = ({ variant, error, onRetry, onClearFilters, query }: EmptyStateProps) => {
  if (variant === 'loading-error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" role="status">
        <AlertCircle className="w-14 h-14 text-rose-400/60 mb-5" />
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Unable to load feed</h3>
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          {error || 'Something went wrong while loading the feed. Please try again.'}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary">
            Try again
          </button>
        )}
      </div>
    );
  }

  if (variant === 'no-matches') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
        <Search className="w-12 h-12 text-gray-600 mb-4" />
        <p className="text-lg text-gray-300 mb-2">
          No articles match &ldquo;{query}&rdquo;
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-lol-gold hover:text-lol-gold-light transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center" role="status">
      <Newspaper className="w-14 h-14 text-gray-600 mb-5" />
      <h3 className="text-lg font-semibold text-gray-300 mb-2">No articles yet</h3>
      <p className="text-sm text-gray-500 max-w-sm">
        News articles will appear here once the feed is populated.
      </p>
    </div>
  );
};
