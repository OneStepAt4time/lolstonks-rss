import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Rss, Copy, Check, ExternalLink, Globe, Newspaper, ChevronDown, SearchX, Search } from 'lucide-react';
import {
  getFeedCatalog,
  searchFeeds,
  getLocaleInfo,
  getCategoryInfo,
  getAvailableLocales,
  getAvailableCategories,
  type FeedCatalog,
  type FeedItem,
  type FeedType
} from '../lib/feeds-catalog';
import { MetaTags } from '../components/seo';
import { generateBreadcrumbStructuredData } from '../utils/seo';
import { StructuredData } from '../components/seo';

export const AllFeedsPage = () => {
  // Generate feed catalog once (static, no API calls needed)
  const catalog = useMemo<FeedCatalog>(getFeedCatalog, []);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocale, setFilterLocale] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterType, setFilterType] = useState<FeedType | ''>('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [expandedLocale, setExpandedLocale] = useState<string | null>(null);

  // Apply all filters
  const filteredFeeds = useMemo<FeedItem[]>(() => {
    let result = catalog.allFeeds;

    // Apply search filter
    if (searchQuery.trim()) {
      result = searchFeeds(catalog, searchQuery);
    }

    // Apply locale filter
    if (filterLocale) {
      result = result.filter((feed) => feed.locale === filterLocale);
    }

    // Apply category filter
    if (filterCategory) {
      result = result.filter((feed) => feed.category === filterCategory);
    }

    // Apply type filter
    if (filterType) {
      result = result.filter((feed) => feed.type === filterType);
    }

    return result;
  }, [catalog, searchQuery, filterLocale, filterCategory, filterType]);

  // Group filtered feeds by locale for display
  const groupedFeeds = useMemo(() => {
    const groups: Map<string, { localeInfo: ReturnType<typeof getLocaleInfo>; feeds: FeedItem[] }> = new Map();

    filteredFeeds.forEach((feed) => {
      if (feed.locale) {
        if (!groups.has(feed.locale)) {
          groups.set(feed.locale, {
            localeInfo: getLocaleInfo(feed.locale),
            feeds: []
          });
        }
        groups.get(feed.locale)!.feeds.push(feed);
      }
    });

    return groups;
  }, [filteredFeeds]);

  // Source feeds (standalone, not locale-specific)
  const sourceFeeds = useMemo(() => {
    return filteredFeeds.filter((feed) => feed.type === 'source');
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

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterLocale('');
    setFilterCategory('');
    setFilterType('');
  };

  const hasActiveFilters = searchQuery || filterLocale || filterCategory || filterType;

  // SEO metadata
  const seoTitle = 'All RSS Feeds - LoL Stonks';
  const seoDescription =
    `Complete catalog of ${catalog.stats.totalFeeds} RSS feeds for League of Legends news. ` +
    `Browse feeds by locale (${catalog.stats.localeCount} languages), category (${getAvailableCategories().length} categories), ` +
    `or source (${catalog.stats.sourceCount} sources). No API required.`;

  const breadcrumbs = [
    { name: 'Home', url: 'https://onestepat4time.github.io/lolstonks-rss/' },
    { name: 'All Feeds', url: 'https://onestepat4time.github.io/lolstonks-rss/all-feeds' }
  ];

  return (
    <>
      <MetaTags
        title={seoTitle}
        description={seoDescription}
        canonicalUrl="https://onestepat4time.github.io/lolstonks-rss/all-feeds"
      />
      <StructuredData data={generateBreadcrumbStructuredData(breadcrumbs)} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-lol-gold mb-4 flex items-center justify-center gap-3">
            <Rss className="w-8 h-8" />
            All RSS Feeds
          </h1>
          <p className="text-lg text-lol-blue mb-2">
            Complete catalog of <span className="text-lol-gold font-semibold">{catalog.stats.totalFeeds}</span> available feeds
          </p>
          <p className="text-sm text-gray-400">
            {catalog.stats.localeCount} locales · {catalog.stats.categoryCount} category feeds · {catalog.stats.sourceCount} source feeds
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 space-y-4 mb-8"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by URL, locale, category, or source..."
              className="w-full pl-10 pr-4 py-3 bg-[#0a0e17] border border-white/[0.08] rounded-lg
                       focus:outline-none focus:border-lol-gold/50 text-white placeholder-gray-500
                       transition-colors"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {getAvailableLocales().map((locale) => {
                  const info = getLocaleInfo(locale);
                  return (
                    <option key={locale} value={locale}>
                      {info?.flag} {info?.name}
                    </option>
                  );
                })}
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
                {getAvailableCategories().map((category) => {
                  const info = getCategoryInfo(category);
                  return (
                    <option key={category} value={category}>
                      {info?.icon} {info?.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FeedType | '')}
                className="w-full px-4 py-2 bg-lol-dark border border-lol-gold/20 rounded-lg
                         focus:outline-none focus:border-lol-gold/50 text-white"
              >
                <option value="">All Types</option>
                <option value="locale">Locale Feeds</option>
                <option value="category_locale">Category Feeds</option>
                <option value="source">Source Feeds</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={clearAllFilters}
              className="btn-secondary w-full"
            >
              Clear All Filters
            </motion.button>
          )}

          {/* Results Count */}
          <div className="text-center text-sm text-gray-400">
            Showing <span className="text-lol-gold font-semibold">{filteredFeeds.length}</span> of{' '}
            <span className="text-lol-gold">{catalog.stats.totalFeeds}</span> feeds
          </div>
        </motion.div>

        {/* Source Feeds Section */}
        {sourceFeeds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-lol-blue mb-4 flex items-center gap-2">
              <Newspaper className="w-6 h-6" />
              Source Feeds
              <span className="text-sm font-normal text-gray-400">({sourceFeeds.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sourceFeeds.map((feed, index) => (
                <FeedCard
                  key={feed.id}
                  feed={feed}
                  copiedUrl={copiedUrl}
                  onCopy={copyToClipboard}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Locale Feeds by Region */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-lol-blue flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Locale Feeds
            <span className="text-sm font-normal text-gray-400">
              ({filteredFeeds.length - sourceFeeds.length})
            </span>
          </h2>

          {Array.from(groupedFeeds.entries()).map(([locale, { localeInfo, feeds }], groupIndex) => (
            <LocaleFeedGroup
              key={locale}
              locale={locale}
              localeInfo={localeInfo}
              feeds={feeds}
              isExpanded={expandedLocale === locale}
              onToggle={() => setExpandedLocale(expandedLocale === locale ? null : locale)}
              copiedUrl={copiedUrl}
              onCopy={copyToClipboard}
              groupIndex={groupIndex}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredFeeds.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <SearchX className="w-12 h-12 text-gray-600 mb-4" />
            <h2 className="text-xl font-bold text-lol-gold mb-2">No Feeds Found</h2>
            <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
            <button onClick={clearAllFilters} className="btn-primary">
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
};

/**
 * Locale Feed Group Component
 * Displays feeds for a single locale in an expandable/collapsible format
 */
interface LocaleFeedGroupProps {
  locale: string;
  localeInfo: ReturnType<typeof getLocaleInfo>;
  feeds: FeedItem[];
  isExpanded: boolean;
  onToggle: () => void;
  copiedUrl: string | null;
  onCopy: (url: string) => void;
  groupIndex: number;
}

const LocaleFeedGroup = ({
  locale,
  localeInfo,
  feeds,
  isExpanded,
  onToggle,
  copiedUrl,
  onCopy,
  groupIndex
}: LocaleFeedGroupProps) => {
  // Separate main feed from category feeds
  const mainFeed = feeds.find((f) => f.type === 'locale');
  const categoryFeeds = feeds.filter((f) => f.type === 'category_locale');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: groupIndex * 0.05 }}
      className="border border-lol-gold/20 rounded-lg overflow-hidden"
    >
      {/* Locale Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-lol-dark/50 hover:bg-lol-dark transition-colors
                 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{localeInfo?.flag}</span>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">{localeInfo?.name}</h3>
            <p className="text-sm text-gray-400">
              {feeds.length} feed{feeds.length !== 1 ? 's' : ''} · {locale.toUpperCase()}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-lol-gold"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-lol-gold/10"
        >
          <div className="p-6 space-y-6">
            {/* Main Feed */}
            {mainFeed && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Main Feed</h4>
                <FeedCard feed={mainFeed} copiedUrl={copiedUrl} onCopy={onCopy} index={0} />
              </div>
            )}

            {/* Category Feeds */}
            {categoryFeeds.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">
                  Category Feeds ({categoryFeeds.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryFeeds.map((feed, index) => (
                    <CompactFeedCard
                      key={feed.id}
                      feed={feed}
                      copiedUrl={copiedUrl}
                      onCopy={onCopy}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Feed Card Component
 * Displays a single feed with copy and open actions
 */
interface FeedCardProps {
  feed: FeedItem;
  copiedUrl: string | null;
  onCopy: (url: string) => void;
  index: number;
}

const FeedCard = ({ feed, copiedUrl, onCopy, index }: FeedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="card p-4 hover:border-lol-gold/50 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Feed Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{feed.icon}</span>
            <h4 className="text-white font-medium group-hover:text-lol-gold transition-colors">
              {feed.displayName}
            </h4>
          </div>
          <p className="text-sm text-gray-400 break-all font-mono">
            {feed.url}
          </p>

          {/* Metadata Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {feed.type === 'locale' && (
              <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded-full">
                Main Feed
              </span>
            )}
            {feed.type === 'category_locale' && feed.category && (
              <span className="px-2 py-1 text-xs bg-lol-gold/10 text-lol-gold rounded-full">
                {feed.category}
              </span>
            )}
            {feed.type === 'source' && feed.source && (
              <span className="px-2 py-1 text-xs bg-purple-500/10 text-purple-400 rounded-full">
                {feed.source}
              </span>
            )}
            {feed.locale && (
              <span className="px-2 py-1 text-xs bg-lol-blue/10 text-lol-blue rounded-full">
                {feed.locale.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ActionButton
            onClick={() => onCopy(feed.url)}
            icon={copiedUrl === feed.url ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            title={copiedUrl === feed.url ? 'Copied!' : 'Copy URL'}
            bgColorClass={copiedUrl === feed.url ? 'bg-green-500/10 text-green-400' : 'bg-lol-gold/10 text-lol-gold'}
          />
          <a
            href={feed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-hextech/10 text-hextech rounded-lg hover:bg-hextech/20 transition-all"
            title="Open feed"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Compact Feed Card Component
 * Smaller version for category feeds within a locale group
 */
const CompactFeedCard = ({ feed, copiedUrl, onCopy, index }: FeedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="bg-lol-dark/30 border border-lol-gold/10 rounded-lg p-3
                   hover:border-lol-gold/30 transition-all group"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xl">{feed.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate group-hover:text-lol-gold transition-colors">
              {feed.displayName}
            </p>
            <p className="text-xs text-gray-500 truncate font-mono">
              {feed.url}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ActionButton
            onClick={() => onCopy(feed.url)}
            icon={copiedUrl === feed.url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            title={copiedUrl === feed.url ? 'Copied!' : 'Copy'}
            bgColorClass={copiedUrl === feed.url ? 'bg-green-500/10 text-green-400' : 'bg-lol-gold/10 text-lol-gold'}
            compact
          />
          <a
            href={feed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-hextech/10 text-hextech rounded hover:bg-hextech/20 transition-all"
            title="Open feed"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Action Button Component
 * Reusable button with icon for copy actions
 */
interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  bgColorClass: string;
  compact?: boolean;
}

const ActionButton = ({ onClick, icon, title, bgColorClass, compact = false }: ActionButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`rounded-lg transition-all ${bgColorClass} ${compact ? 'p-2' : 'p-3'}`}
      title={title}
    >
      {icon}
    </motion.button>
  );
};

export default AllFeedsPage;
