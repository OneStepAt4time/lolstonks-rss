import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Article, ArticleFilters } from '../types/article';
import type { Feed, FeedsResponse } from '../types/feed';
import {
  demoArticles,
  filterDemoArticles,
  getDemoCategories,
  getDemoSources,
  getDemoLocales,
} from '../lib/demo-data';

interface ArticleStore {
  articles: Article[];
  filteredArticles: Article[];
  articlesLoading: boolean;
  error: string | null;
  fetchArticles: (filters?: ArticleFilters) => Promise<void>;
  filterArticles: (filters: ArticleFilters) => void;
}

interface FeedStore {
  feeds: Feed[];
  feedsResponse: FeedsResponse | null;
  feedsLoading: boolean;
  fetchFeeds: () => Promise<void>;
}

interface FilterStore {
  filter: {
    locale?: string;
    category?: string;
    source?: string;
    search?: string;
  };
  setFilter: (filter: Partial<FilterStore['filter']>) => void;
  clearFilters: () => void;
}

interface ThemeStore {
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

interface BookmarkStore {
  bookmarks: string[];
  toggleBookmark: (guid: string) => void;
}

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toast: { show: boolean; message: string; type?: 'success' | 'error' | 'info' } | null;
  hideToast: () => void;
}

// API base URL
const API_BASE = import.meta.env.PROD
  ? 'https://onestepat4time.github.io/lolstonks-rss'
  : 'http://localhost:8000';

export const useStore = create<
  ArticleStore & FeedStore & FilterStore & ThemeStore & BookmarkStore & UIStore
>()(
  persist(
    (set, get) => ({
      // Article Store
      articles: [],
      filteredArticles: [],
      articlesLoading: false,
      error: null,
      fetchArticles: async (filters?: ArticleFilters) => {
        set({ articlesLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (filters?.limit) params.append('limit', filters.limit.toString());
          if (filters?.source) params.append('source', filters.source);

          const response = await fetch(`${API_BASE}/api/articles?${params}`);
          if (!response.ok) throw new Error('Failed to fetch articles');

          const data = await response.json();
          set({ articles: data, filteredArticles: data, articlesLoading: false });
        } catch (error) {
          // Fallback to demo data when API is unavailable
          console.warn('[Store] API unavailable, using demo data:', error);
          const demoData = filterDemoArticles(demoArticles, filters || {});
          set({
            articles: demoData,
            filteredArticles: demoData,
            articlesLoading: false,
            error: null, // Don't treat fallback as error
          });
        }
      },
      filterArticles: (filters: ArticleFilters) => {
        const { articles } = get();
        let result = [...articles];

        if (filters.locale) {
          result = result.filter(a => a.locale === filters.locale);
        }
        if (filters.category) {
          result = result.filter(a => a.source_category === filters.category);
        }
        if (filters.source) {
          result = result.filter(a => a.source === filters.source);
        }
        if (filters.search) {
          const query = filters.search.toLowerCase();
          result = result.filter(
            a =>
              a.title?.toLowerCase().includes(query) ||
              a.description?.toLowerCase().includes(query)
          );
        }

        set({ filteredArticles: result });
      },

      // Feed Store
      feeds: [],
      feedsResponse: null,
      feedsLoading: false,
      fetchFeeds: async () => {
        set({ feedsLoading: true });
        try {
          const response = await fetch(`${API_BASE}/feeds`);
          if (!response.ok) throw new Error('Failed to fetch feeds');

          const data: FeedsResponse = await response.json();
          set({ feeds: data.feeds, feedsResponse: data, feedsLoading: false });
        } catch (error) {
          // Fallback to demo feeds when API is unavailable
          console.warn('[Store] API unavailable, using demo feeds:', error);
          const demoFeeds: FeedsResponse = {
            supported_locales: getDemoLocales(),
            available_locales: getDemoLocales(),
            sources: getDemoSources(),
            categories: getDemoCategories(),
            feeds: getDemoLocales().map(locale => ({
              type: 'locale' as const,
              url: `/feed/${locale}.xml`,
              locale,
            })),
            base_url: import.meta.env.PROD
              ? 'https://onestepat4time.github.io/lolstonks-rss'
              : 'http://localhost:8000',
          };
          set({ feeds: demoFeeds.feeds, feedsResponse: demoFeeds, feedsLoading: false });
        }
      },

      // Filter Store
      filter: {},
      setFilter: (filter) => {
        const currentFilter = get().filter;
        const newFilter = { ...currentFilter, ...filter };
        // Only update if filter actually changed
        const hasChanged = Object.keys(newFilter).some(
          key => newFilter[key as keyof typeof newFilter] !== currentFilter[key as keyof typeof currentFilter]
        ) || Object.keys(currentFilter).some(
          key => currentFilter[key as keyof typeof currentFilter] !== newFilter[key as keyof typeof newFilter]
        );
        if (hasChanged) {
          set({ filter: newFilter });
          get().filterArticles(newFilter);
        }
      },
      clearFilters: () => {
        set({ filter: {} });
        const { articles } = get();
        set({ filteredArticles: articles });
      },

      // Theme Store
      theme: 'system',
      effectiveTheme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        const effectiveTheme =
          theme === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            : theme;
        set({ effectiveTheme });

        // Apply to document
        document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
      },

      // Bookmark Store
      bookmarks: [],
      toggleBookmark: (guid) => {
        const { bookmarks } = get();
        const newBookmarks = bookmarks.includes(guid)
          ? bookmarks.filter(id => id !== guid)
          : [...bookmarks, guid];
        set({ bookmarks: newBookmarks });
      },

      // UI Store
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toast: null,
      showToast: (message, type = 'info') => {
        set({ toast: { show: true, message, type } });
        setTimeout(() => set({ toast: null }), 3000);
      },
      hideToast: () => set({ toast: null }),
    }),
    {
      name: 'lolstonks-storage',
      partialize: (state) => ({
        theme: state.theme,
        bookmarks: state.bookmarks,
      }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const store = useStore.getState();
  store.setTheme(store.theme);
}
