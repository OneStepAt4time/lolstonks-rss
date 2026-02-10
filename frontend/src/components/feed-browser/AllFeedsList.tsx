import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';

interface FeedItem {
  type: string;
  url: string;
  locale?: string;
  category?: string;
  source?: string;
}

export const AllFeedsList = () => {
  const { feedsResponse } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocale, setFilterLocale] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Extract all feeds from response
  const allFeeds = useMemo<FeedItem[]>(() => {
    if (!feedsResponse?.feeds) return [];
    return feedsResponse.feeds;
  }, [feedsResponse]);

  // Filter feeds based on search and filters
  const filteredFeeds = useMemo<FeedItem[]>(() => {
    return allFeeds.filter((feed) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          feed.url.toLowerCase().includes(query) ||
          feed.locale?.toLowerCase().includes(query) ||
          feed.category?.toLowerCase().includes(query) ||
          feed.source?.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // Locale filter
      if (filterLocale && feed.locale !== filterLocale) return false;

      // Category filter
      if (filterCategory && feed.category !== filterCategory) return false;

      return true;
    });
  }, [allFeeds, searchQuery, filterLocale, filterCategory]);

  // Group feeds by type for better organization
  const groupedFeeds = useMemo(() => {
    const groups: Record<string, FeedItem[]> = {};

    filteredFeeds.forEach((feed) => {
      const groupKey = feed.type || 'other';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(feed);
    });

    return groups;
  }, [filteredFeeds]);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFeedDisplayName = (feed: FeedItem): string => {
    if (feed.type === 'locale' && feed.locale) {
      const localeName = feedsResponse?.supported_locales.find(l => l === feed.locale)?.toUpperCase();
      return `${localeName || feed.locale} RSS Feed`;
    }
    if (feed.type === 'category_locale' && feed.category && feed.locale) {
      return `${feed.category} - ${feed.locale.toUpperCase()}`;
    }
    if (feed.type === 'source_locale' && feed.source && feed.locale) {
      return `${feed.source} - ${feed.locale.toUpperCase()}`;
    }
    return feed.url.split('/').pop() || 'Feed';
  };

  const getFeedIcon = (feed: FeedItem): string => {
    if (feed.type === 'locale') return '🌍';
    if (feed.type === 'category_locale') return '📂';
    if (feed.type === 'source_locale') return '📰';
    return '📡';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-lol-gold mb-2">
          📋 All Available Feeds
        </h2>
        <p className="text-lol-blue">
          {filteredFeeds.length} {filteredFeeds.length === 1 ? 'feed' : 'feeds'} available
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search Feeds
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by URL, locale, category, or source..."
            className="w-full px-4 py-2 bg-lol-dark border border-lol-gold/20 rounded-lg
                     focus:outline-none focus:border-lol-gold/50 text-white placeholder-gray-500"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Locale Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Locale
            </label>
            <select
              value={filterLocale}
              onChange={(e) => setFilterLocale(e.target.value)}
              className="w-full px-4 py-2 bg-lol-dark border border-lol-gold/20 rounded-lg
                       focus:outline-none focus:border-lol-gold/50 text-white"
            >
              <option value="">All Locales</option>
              {feedsResponse?.supported_locales.map((locale) => (
                <option key={locale} value={locale}>
                  {locale.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 bg-lol-dark border border-lol-gold/20 rounded-lg
                       focus:outline-none focus:border-lol-gold/50 text-white"
            >
              <option value="">All Categories</option>
              {feedsResponse?.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || filterLocale || filterCategory) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterLocale('');
              setFilterCategory('');
            }}
            className="btn-secondary w-full"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Feeds List - Grouped by Type */}
      <div className="space-y-8">
        {Object.entries(groupedFeeds).map(([groupType, feeds]) => (
          <div key={groupType} className="space-y-4">
            {/* Group Header */}
            <h3 className="text-xl font-semibold text-lol-blue flex items-center gap-2">
              <span className="text-2xl">
                {groupType === 'locale' && '🌍'}
                {groupType === 'category_locale' && '📂'}
                {groupType === 'source_locale' && '📰'}
              </span>
              {groupType === 'locale' && 'Locale Feeds'}
              {groupType === 'category_locale' && 'Category Feeds'}
              {groupType === 'source_locale' && 'Source Feeds'}
              {groupType === 'other' && 'Other Feeds'}
              <span className="text-sm font-normal text-gray-400">
                ({feeds.length})
              </span>
            </h3>

            {/* Feeds Grid */}
            <div className="grid grid-cols-1 gap-3">
              {feeds.map((feed, index) => (
                <motion.div
                  key={feed.url}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="card p-4 hover:border-lol-gold/50 transition-all group"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Feed Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getFeedIcon(feed)}</span>
                        <div>
                          <h4 className="text-white font-medium group-hover:text-lol-gold transition-colors">
                            {getFeedDisplayName(feed)}
                          </h4>
                          <p className="text-sm text-gray-400 truncate">
                            {feed.url}
                          </p>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2">
                        {feed.locale && (
                          <span className="px-2 py-1 text-xs bg-lol-blue/10 text-lol-blue rounded-full">
                            {feed.locale.toUpperCase()}
                          </span>
                        )}
                        {feed.category && (
                          <span className="px-2 py-1 text-xs bg-lol-gold/10 text-lol-gold rounded-full">
                            {feed.category}
                          </span>
                        )}
                        {feed.source && (
                          <span className="px-2 py-1 text-xs bg-purple-500/10 text-purple-400 rounded-full">
                            {feed.source}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Copy Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(feed.url)}
                        className={`p-3 rounded-lg transition-all ${
                          copiedUrl === feed.url
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-lol-gold/10 text-lol-gold hover:bg-lol-gold/20'
                        }`}
                        title={copiedUrl === feed.url ? 'Copied!' : 'Copy URL'}
                      >
                        {copiedUrl === feed.url ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </motion.button>

                      {/* Open Button */}
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={feed.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-lol-blue/10 text-lol-blue rounded-lg hover:bg-lol-blue/20 transition-all"
                        title="Open feed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredFeeds.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-lol-gold mb-2">No Feeds Found</h2>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};
