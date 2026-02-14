import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getFeedCatalog,
  searchFeeds,
  REGION_LOCALES,
  GAMES,
  type Region,
  type FeedCatalog,
  type LocaleGroup,
  type GameType,
} from '../lib/feeds-catalog';
import type { GameFilter } from '../types/feed';

const VALID_GAMES = new Set<string>(Object.keys(GAMES));

interface UseFeedCatalogReturn {
  catalog: FeedCatalog;
  query: string;
  setQuery: (q: string) => void;
  region: Region;
  setRegion: (r: Region) => void;
  game: GameFilter;
  setGame: (g: GameFilter) => void;
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<Region>('all');
  const [expandedLocales, setExpandedLocales] = useState<Set<string>>(new Set());

  const gameParam = searchParams.get('game');
  const game: GameFilter = gameParam && VALID_GAMES.has(gameParam)
    ? (gameParam as GameType)
    : 'all';

  const setGame = useCallback((g: GameFilter) => {
    setSearchParams((prev) => {
      if (g === 'all') {
        prev.delete('game');
      } else {
        prev.set('game', g);
      }
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

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
          lg.flag.includes(query) ||
          lg.searchTerms?.toLowerCase().includes(query.toLowerCase())
      );
    }

    return locales;
  }, [query, region]);

  const visibleFeedCount = useMemo(() => {
    // Main feed is hidden during search, only count it when showing
    const mainFeedVisible = !query.trim() ? 1 : 0;
    return mainFeedVisible + filteredLocales.length;
  }, [filteredLocales, query]);

  const hasActiveFilters = query.trim().length > 0 || region !== 'all' || game !== 'all';

  const clearFilters = useCallback(() => {
    setQuery('');
    setRegion('all');
    setGame('all');
  }, [setGame]);

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
    game,
    setGame,
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
