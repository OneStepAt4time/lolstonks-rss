import { useState, useMemo, useCallback } from 'react';
import {
  getFeedCatalog,
  searchFeeds,
  REGION_LOCALES,
  type Region,
  type FeedCatalog,
  type LocaleGroup,
} from '../lib/feeds-catalog';

interface UseFeedCatalogReturn {
  catalog: FeedCatalog;
  query: string;
  setQuery: (q: string) => void;
  region: Region;
  setRegion: (r: Region) => void;
  expandedLocales: Set<string>;
  toggleLocale: (locale: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  filteredLocales: LocaleGroup[];
  visibleFeedCount: number;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

const catalog = getFeedCatalog();

export function useFeedCatalog(): UseFeedCatalogReturn {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<Region>('all');
  const [expandedLocales, setExpandedLocales] = useState<Set<string>>(new Set());

  const filteredLocales = useMemo(() => {
    let locales = catalog.byLocale;

    // Filter by region
    if (region !== 'all') {
      const regionCodes = REGION_LOCALES[region];
      locales = locales.filter((lg) => regionCodes.includes(lg.locale));
    }

    // Filter by search query
    if (query.trim()) {
      const matchingFeeds = searchFeeds(catalog, query);
      const matchingLocales = new Set(matchingFeeds.map((f) => f.locale).filter(Boolean));
      // Also match by locale name or flag
      locales = locales.filter(
        (lg) =>
          matchingLocales.has(lg.locale) ||
          lg.localeName.toLowerCase().includes(query.toLowerCase()) ||
          lg.flag.includes(query)
      );
    }

    return locales;
  }, [query, region]);

  const visibleFeedCount = useMemo(() => {
    // Main feed + locale feeds shown
    return 1 + filteredLocales.length;
  }, [filteredLocales]);

  const hasActiveFilters = query.trim().length > 0 || region !== 'all';

  const clearFilters = useCallback(() => {
    setQuery('');
    setRegion('all');
  }, []);

  const toggleLocale = useCallback((locale: string) => {
    setExpandedLocales((prev) => {
      const next = new Set(prev);
      if (next.has(locale)) {
        next.delete(locale);
      } else {
        next.add(locale);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedLocales(new Set(catalog.byLocale.map((lg) => lg.locale)));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedLocales(new Set());
  }, []);

  return {
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
  };
}
