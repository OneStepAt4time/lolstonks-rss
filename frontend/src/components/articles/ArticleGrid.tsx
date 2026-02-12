import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, AlertCircle, Search, RefreshCw } from 'lucide-react';
import { useStore } from '../../store';
import { useToast } from '../../hooks/useToast';
import { ArticleCard } from './ArticleCard';
import { ArticleCardSkeleton } from './ArticleCardSkeleton';
import { SearchBar } from './SearchBar';
import { ArticleFilters } from './ArticleFilters';

export const ArticleGrid = () => {
  const {
    filteredArticles,
    articlesLoading: loading,
    error,
    fetchArticles,
    filter,
    setFilter,
  } = useStore();

  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    fetchArticles({ limit: 100 });
  }, [fetchArticles]);

  const sortedArticles = useMemo(() => {
    const articles = [...filteredArticles];
    return articles.sort((a, b) => {
      const dateA = new Date(a.pub_date).getTime();
      const dateB = new Date(b.pub_date).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredArticles, sortBy]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchArticles({ limit: 100 });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchArticles]);

  const handleSearch = (value: string) => {
    setFilter({ search: value || undefined });
  };

  const handleSortChange = (value: 'newest' | 'oldest') => {
    setSortBy(value);
    showToast(`Sorted by ${value}`, 'info');
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    showToast(`${mode === 'grid' ? 'Grid' : 'List'} view enabled`, 'success');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-14 bg-[#111827] rounded-lg animate-pulse" />
        <div className="h-20 bg-[#111827] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ArticleCardSkeleton key={i} index={i} variant={viewMode === 'list' ? 'compact' : 'default'} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Articles</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => fetchArticles({ limit: 100 })}
          className="btn-primary inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="space-y-4">
        <SearchBar value={filter.search || ''} onChange={handleSearch} />
        <ArticleFilters />

        {/* View Controls */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {sortedArticles.length} {sortedArticles.length === 1 ? 'article' : 'articles'}
            {filter.locale && ` \u2022 ${filter.locale}`}
            {filter.category && ` \u2022 ${filter.category}`}
            {filter.source && ` \u2022 ${filter.source}`}
          </p>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as 'newest' | 'oldest')}
              className="input-premium px-3 py-2 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-[#111827] rounded-lg border border-white/[0.08]">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-lol-gold/15 text-lol-gold'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-lol-gold/15 text-lol-gold'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* No Results */}
      <AnimatePresence>
        {sortedArticles.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Search className="w-12 h-12 text-gray-600 mb-4" />
            <h2 className="text-xl font-bold text-lol-gold mb-2">No Articles Found</h2>
            <p className="text-gray-400">Try adjusting your filters or search query</p>
            {(filter.search || filter.locale || filter.category || filter.source) && (
              <button
                onClick={() => {
                  setFilter({});
                  showToast('Filters cleared', 'info');
                }}
                className="btn-secondary mt-4"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Articles Grid */}
      <motion.div
        layout
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        <AnimatePresence mode="popLayout">
          {sortedArticles.map((article, index) => (
            <ArticleCard
              key={article.guid}
              article={article}
              index={index}
              variant={viewMode === 'list' ? 'compact' : 'default'}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
