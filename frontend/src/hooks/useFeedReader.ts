import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchFeed } from '../lib/feed-fetcher';
import { useStore, getCachedFeed, feedCacheKey } from '../store';
import type { RSSArticle, FeedMeta, FeedStatus } from '../types/articles';
import type { GameType } from '../types/feed';

const PAGE_SIZE = 20;

interface UseFeedReaderReturn {
  articles: RSSArticle[];
  filteredArticles: RSSArticle[];
  visibleArticles: RSSArticle[];
  meta: FeedMeta | null;
  status: FeedStatus;
  error: string | null;
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  hasMore: boolean;
  remainingCount: number;
  loadMore: () => void;
  retry: () => void;
}

export function useFeedReader(locale: string, game?: GameType): UseFeedReaderReturn {
  const [status, setStatus] = useState<FeedStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<RSSArticle[]>([]);
  const [meta, setMeta] = useState<FeedMeta | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const setFeedData = useStore((s) => s.setFeedData);

  const loadFeed = useCallback(async () => {
    const key = feedCacheKey(locale, game);
    const cached = getCachedFeed(key);
    if (cached) {
      setArticles(cached.articles);
      setMeta(cached.meta);
      setStatus('success');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const feed = await fetchFeed(locale, game);
      setArticles(feed.articles);
      setMeta(feed.meta);
      setFeedData(key, feed.articles, feed.meta);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
      setStatus('error');
    }
  }, [locale, game, setFeedData]);

  useEffect(() => {
    setActiveCategory(null);
    setSearchQuery('');
    setPage(1);
    loadFeed();
  }, [loadFeed]);

  const filteredArticles = useMemo(() => {
    let result = articles;

    if (activeCategory) {
      result = result.filter((a) => a.categories.includes(activeCategory));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => b.pubDateTs - a.pubDateTs);
  }, [articles, activeCategory, searchQuery]);

  const visibleArticles = useMemo(
    () => filteredArticles.slice(0, page * PAGE_SIZE),
    [filteredArticles, page]
  );

  const hasMore = visibleArticles.length < filteredArticles.length;
  const remainingCount = filteredArticles.length - visibleArticles.length;

  const loadMore = useCallback(() => setPage((p) => p + 1), []);

  const retry = useCallback(() => {
    loadFeed();
  }, [loadFeed]);

  return {
    articles,
    filteredArticles,
    visibleArticles,
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
  };
}
