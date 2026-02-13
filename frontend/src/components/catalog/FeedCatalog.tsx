import { Link } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { RegionTabs } from './RegionTabs';
import { StatsBar } from './StatsBar';
import { FeedRow } from './FeedRow';
import { LocaleSection } from './LocaleSection';
import { useFeedCatalog } from '../../hooks/useFeedCatalog';
import { ChevronsDownUp, ChevronsUpDown, X } from 'lucide-react';

export const FeedCatalog = () => {
  const {
    catalog,
    query,
    setQuery,
    region,
    setRegion,
    expandedLocales,
    toggleLocale,
    expandAll,
    collapseAll,
    filteredLocales,
    visibleFeedCount,
    hasActiveFilters,
    clearFilters,
  } = useFeedCatalog();

  const allExpanded = expandedLocales.size === filteredLocales.length && filteredLocales.length > 0;

  return (
    <div className="space-y-6">
      {/* Search */}
      <SearchBar value={query} onChange={setQuery} />

      {/* Hint */}
      <p className="text-sm text-gray-500 -mt-2">
        Click a language to read articles, or expand to copy the feed URL.
      </p>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <RegionTabs activeRegion={region} onChange={setRegion} />
        <div className="flex items-center gap-3 sm:ml-auto">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
          <button
            onClick={allExpanded ? collapseAll : expandAll}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            aria-label={allExpanded ? 'Collapse all sections' : 'Expand all sections'}
          >
            {allExpanded ? (
              <ChevronsDownUp className="w-4 h-4" />
            ) : (
              <ChevronsUpDown className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{allExpanded ? 'Collapse all' : 'Expand all'}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsBar
        totalFeeds={catalog.stats.totalFeeds}
        totalLocales={catalog.stats.localeCount}
        visibleCount={visibleFeedCount}
        hasFilters={hasActiveFilters}
      />

      {/* Main feed (always shown at top when no search filter) */}
      {!query.trim() && (
        <Link to="/read/main" className="block">
          <div className="border border-lol-gold/20 rounded-xl bg-lol-gold/[0.03] hover:bg-lol-gold/[0.06] transition-colors">
            <FeedRow feed={catalog.mainFeed} />
          </div>
        </Link>
      )}

      {/* Locale feeds */}
      {filteredLocales.length > 0 ? (
        <div className="space-y-2">
          {filteredLocales.map((lg) => (
            <LocaleSection
              key={lg.locale}
              localeGroup={lg}
              isExpanded={expandedLocales.has(lg.locale)}
              onToggle={() => toggleLocale(lg.locale)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">No feeds match your search</p>
          <button
            onClick={clearFilters}
            className="text-lol-gold hover:text-lol-gold-light transition-colors text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
