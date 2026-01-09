import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Sort articles
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
    }, 5 * 60 * 1000); // 5 minutes

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
        {/* Search Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-14 bg-lol-card rounded-lg animate-pulse"
        />

        {/* Filter Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="h-20 bg-lol-card rounded-lg animate-pulse"
        />

        {/* Grid Skeleton */}
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
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Articles</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchArticles({ limit: 100 })}
          className="btn-primary"
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <SearchBar value={filter.search || ''} onChange={handleSearch} />

        {/* Filters */}
        <ArticleFilters />

        {/* View Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-gray-400">
            {sortedArticles.length} {sortedArticles.length === 1 ? 'article' : 'articles'}
            {filter.locale && ` • ${filter.locale}`}
            {filter.category && ` • ${filter.category}`}
            {filter.source && ` • ${filter.source}`}
          </p>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <motion.select
              whileHover={{ scale: 1.02 }}
              whileFocus={{ scale: 1.02 }}
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as 'newest' | 'oldest')}
              className="px-3 py-2 bg-lol-card border border-lol-gold/20 rounded-lg
                       text-sm focus:outline-none focus:border-lol-gold/50 transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </motion.select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 p-1 bg-lol-card rounded-lg border border-lol-gold/20">
              <motion.button
                whileHover={{ scale: viewMode === 'grid' ? 1 : 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid'
                    ? 'bg-lol-gold/20 text-lol-gold'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: viewMode === 'list' ? 1 : 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list'
                    ? 'bg-lol-gold/20 text-lol-gold'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="List view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* No Results */}
      <AnimatePresence>
        {sortedArticles.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-lol-gold mb-2">No Articles Found</h2>
            <p className="text-gray-400">Try adjusting your filters or search query</p>
            {filter.search || filter.locale || filter.category || filter.source ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFilter({});
                  showToast('Filters cleared', 'info');
                }}
                className="btn-secondary mt-4"
              >
                Clear Filters
              </motion.button>
            ) : null}
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
