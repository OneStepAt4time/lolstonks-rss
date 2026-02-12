import { useState, useMemo } from 'react';
import { Search, Copy, Check, ExternalLink, Globe, FolderOpen, Newspaper, Radio, SearchX } from 'lucide-react';
import { useStore } from '../../store';

interface FeedItem {
  type: string;
  url: string;
  locale?: string;
  category?: string;
  source?: string;
}

const FEED_TYPE_ICONS = {
  locale: Globe,
  category_locale: FolderOpen,
  source_locale: Newspaper,
} as const;

export const AllFeedsList = () => {
  const { feedsResponse } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocale, setFilterLocale] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const allFeeds = useMemo<FeedItem[]>(() => {
    if (!feedsResponse?.feeds) return [];
    return feedsResponse.feeds;
  }, [feedsResponse]);

  const filteredFeeds = useMemo<FeedItem[]>(() => {
    return allFeeds.filter((feed) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          feed.url.toLowerCase().includes(query) ||
          feed.locale?.toLowerCase().includes(query) ||
          feed.category?.toLowerCase().includes(query) ||
          feed.source?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (filterLocale && feed.locale !== filterLocale) return false;
      if (filterCategory && feed.category !== filterCategory) return false;
      return true;
    });
  }, [allFeeds, searchQuery, filterLocale, filterCategory]);

  const groupedFeeds = useMemo(() => {
    const groups: Record<string, FeedItem[]> = {};
    filteredFeeds.forEach((feed) => {
      const groupKey = feed.type || 'other';
      if (!groups[groupKey]) groups[groupKey] = [];
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
      return `${feed.locale.toUpperCase()} RSS Feed`;
    }
    if (feed.type === 'category_locale' && feed.category && feed.locale) {
      return `${feed.category} - ${feed.locale.toUpperCase()}`;
    }
    if (feed.type === 'source_locale' && feed.source && feed.locale) {
      return `${feed.source} - ${feed.locale.toUpperCase()}`;
    }
    return feed.url.split('/').pop() || 'Feed';
  };

  const getFeedIcon = (feed: FeedItem) => {
    return FEED_TYPE_ICONS[feed.type as keyof typeof FEED_TYPE_ICONS] || Radio;
  };

  const GROUP_LABELS: Record<string, string> = {
    locale: 'Locale Feeds',
    category_locale: 'Category Feeds',
    source_locale: 'Source Feeds',
    other: 'Other Feeds',
  };

  const GROUP_ICONS: Record<string, typeof Globe> = {
    locale: Globe,
    category_locale: FolderOpen,
    source_locale: Newspaper,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          All Available Feeds
        </h2>
        <p className="text-gray-400">
          {filteredFeeds.length} {filteredFeeds.length === 1 ? 'feed' : 'feeds'} available
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#111827] rounded-xl border border-white/[0.08] p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by URL, locale, category, or source..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e17] border border-white/[0.08] rounded-lg focus:outline-none focus:border-lol-gold/50 text-white placeholder-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filterLocale}
            onChange={(e) => setFilterLocale(e.target.value)}
            className="w-full px-4 py-2 bg-[#0a0e17] border border-white/[0.08] rounded-lg focus:outline-none focus:border-lol-gold/50 text-white"
          >
            <option value="">All Locales</option>
            {feedsResponse?.supported_locales.map((locale) => (
              <option key={locale} value={locale}>{locale.toUpperCase()}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 bg-[#0a0e17] border border-white/[0.08] rounded-lg focus:outline-none focus:border-lol-gold/50 text-white"
          >
            <option value="">All Categories</option>
            {feedsResponse?.categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {(searchQuery || filterLocale || filterCategory) && (
          <button
            onClick={() => { setSearchQuery(''); setFilterLocale(''); setFilterCategory(''); }}
            className="btn-secondary w-full"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Feeds List */}
      <div className="space-y-8">
        {Object.entries(groupedFeeds).map(([groupType, feeds]) => {
          const GroupIcon = GROUP_ICONS[groupType] || Radio;
          return (
            <div key={groupType} className="space-y-4">
              <h3 className="text-xl font-semibold text-lol-gold flex items-center gap-2">
                <GroupIcon className="w-5 h-5" />
                {GROUP_LABELS[groupType] || 'Other Feeds'}
                <span className="text-sm font-normal text-gray-400">({feeds.length})</span>
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {feeds.map((feed) => {
                  const Icon = getFeedIcon(feed);
                  return (
                    <div
                      key={feed.url}
                      className="bg-[#111827] rounded-lg border border-white/[0.08] hover:border-lol-gold/30 transition-all p-4 group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="w-5 h-5 text-lol-gold flex-shrink-0" />
                            <div>
                              <h4 className="text-white font-medium group-hover:text-lol-gold transition-colors">
                                {getFeedDisplayName(feed)}
                              </h4>
                              <p className="text-sm text-gray-500 truncate">{feed.url}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 ml-8">
                            {feed.locale && (
                              <span className="px-2 py-0.5 text-xs bg-hextech/10 text-hextech rounded-full">
                                {feed.locale.toUpperCase()}
                              </span>
                            )}
                            {feed.category && (
                              <span className="px-2 py-0.5 text-xs bg-lol-gold/10 text-lol-gold rounded-full">
                                {feed.category}
                              </span>
                            )}
                            {feed.source && (
                              <span className="px-2 py-0.5 text-xs bg-purple-500/10 text-purple-400 rounded-full">
                                {feed.source}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(feed.url)}
                            className={`p-2.5 rounded-lg transition-all ${
                              copiedUrl === feed.url
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-lol-gold/10 text-lol-gold hover:bg-lol-gold/20'
                            }`}
                            title={copiedUrl === feed.url ? 'Copied!' : 'Copy URL'}
                          >
                            {copiedUrl === feed.url ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <a
                            href={feed.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-hextech/10 text-hextech rounded-lg hover:bg-hextech/20 transition-all"
                            title="Open feed"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredFeeds.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <SearchX className="w-12 h-12 text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-lol-gold mb-2">No Feeds Found</h2>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};
