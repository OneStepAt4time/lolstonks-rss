import { create } from 'zustand';
import type { RSSArticle, FeedMeta } from '../types/articles';

interface CachedFeed {
  articles: RSSArticle[];
  meta: FeedMeta;
  fetchedAt: number;
}

interface UIStore {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  toast: { show: boolean; message: string; type?: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  // Feed reader cache
  feeds: Record<string, CachedFeed>;
  setFeedData: (cacheKey: string, articles: RSSArticle[], meta: FeedMeta) => void;
  clearFeedCache: () => void;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const useStore = create<UIStore>()((set) => ({
  mobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { show: true, message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  hideToast: () => set({ toast: null }),

  feeds: {},
  setFeedData: (cacheKey, articles, meta) =>
    set((state) => ({
      feeds: {
        ...state.feeds,
        [cacheKey]: { articles, meta, fetchedAt: Date.now() },
      },
    })),
  clearFeedCache: () => set({ feeds: {} }),
}));

export function feedCacheKey(locale: string, game?: string, category?: string): string {
  const parts = [game ?? 'lol', locale];
  if (category) parts.push(category);
  return parts.join(':');
}

export function getCachedFeed(cacheKey: string): CachedFeed | null {
  const feed = useStore.getState().feeds[cacheKey];
  if (!feed) return null;
  if (Date.now() - feed.fetchedAt > CACHE_TTL) return null;
  return feed;
}
