import { Search, X } from 'lucide-react';
import { useFeedReader } from '../../hooks/useFeedReader';
import { FeedHeader } from './FeedHeader';
import { CategoryTabs } from './CategoryTabs';
import { ArticleGrid } from './ArticleGrid';
import { EmptyState } from './EmptyState';

interface NewsReaderProps {
  locale: string;
}

export const NewsReader = ({ locale }: NewsReaderProps) => {
  const {
    visibleArticles,
    filteredArticles,
    meta,
    status,
    error,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    hasMore,
    remainingCount,
    loadMore,
    retry,
  } = useFeedReader(locale);

  const clearFilters = () => {
    setActiveCategory(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <FeedHeader locale={locale} meta={meta} />

      {/* Search + Category filters */}
      {status === 'success' && meta && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-lol-dark-secondary border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-500 focus:border-lol-gold/50 focus:ring-2 focus:ring-lol-gold/20 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {meta.categories.length > 1 && (
            <CategoryTabs
              categories={meta.categories}
              active={activeCategory}
              onChange={setActiveCategory}
            />
          )}
        </>
      )}

      {/* Content */}
      {status === 'loading' && (
        <ArticleGrid articles={[]} loading hasMore={false} remainingCount={0} onLoadMore={() => {}} />
      )}

      {status === 'error' && (
        <EmptyState variant="loading-error" error={error} onRetry={retry} />
      )}

      {status === 'success' && filteredArticles.length === 0 && (searchQuery || activeCategory) && (
        <EmptyState variant="no-matches" query={searchQuery || activeCategory || ''} onClearFilters={clearFilters} />
      )}

      {status === 'success' && filteredArticles.length === 0 && !searchQuery && !activeCategory && (
        <EmptyState variant="no-articles" />
      )}

      {status === 'success' && visibleArticles.length > 0 && (
        <ArticleGrid
          articles={visibleArticles}
          hasMore={hasMore}
          remainingCount={remainingCount}
          onLoadMore={loadMore}
        />
      )}
    </div>
  );
};
