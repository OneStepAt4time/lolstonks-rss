import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Feed, FeedsResponse } from '../types/feed';

interface FeedStore {
  feeds: Feed[];
  feedsResponse: FeedsResponse | null;
  feedsLoading: boolean;
  fetchFeeds: () => Promise<void>;
}

interface ThemeStore {
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
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

export const useStore = create<FeedStore & ThemeStore & UIStore>()(
  persist(
    (set) => ({
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
          const demoLocales = [
            'ar-ae', 'de-de', 'en-gb', 'en-us', 'es-es', 'es-mx',
            'fr-fr', 'id-id', 'it-it', 'ja-jp', 'ko-kr', 'ph-ph',
            'pl-pl', 'pt-br', 'ru-ru', 'th-th', 'tr-tr', 'vi-vn',
            'zh-cn', 'zh-tw',
          ];
          const demoSources = ['lolesports', 'riot', 'wildrift'];
          const demoCategories = [
            'dev', 'entertainment', 'esports', 'events',
            'game-updates', 'patch-notes', 'tft',
          ];
          const demoFeeds: FeedsResponse = {
            supported_locales: demoLocales,
            available_locales: demoLocales,
            sources: demoSources,
            categories: demoCategories,
            feeds: demoLocales.map(locale => ({
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
      }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const store = useStore.getState();
  store.setTheme(store.theme);
}
