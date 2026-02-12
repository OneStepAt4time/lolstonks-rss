/**
 * Custom hook for API calls with automatic fallback to demo data.
 * Provides seamless demo mode experience when the API is unavailable.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Article, ArticleFilters } from '../types/article';
import type { FeedsResponse } from '../types/feed';
import { api } from '../services/api';
import {
  demoArticles,
  filterDemoArticles,
  getDemoCategories,
  getDemoSources,
  getDemoLocales,
} from '../lib/demo-data';

/**
 * Result type for useApiWithArticles hook.
 */
export interface UseApiWithArticlesResult {
  data: Article[] | null;
  isLoading: boolean;
  isError: boolean;
  isDemoMode: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Result type for useApiWithFeeds hook.
 */
export interface UseApiWithFeedsResult {
  data: FeedsResponse | null;
  isLoading: boolean;
  isError: boolean;
  isDemoMode: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook that fetches articles from the API with automatic fallback to demo data.
 *
 * @param filters - Optional article filters
 * @returns Object containing data, loading states, error info, and demo mode status
 *
 * @example
 * ```tsx
 * const { data, isLoading, isError, isDemoMode } = useApiWithArticles({
 *   limit: 20,
 *   locale: 'en-us'
 * });
 *
 * if (isDemoMode) {
 *   return <DemoModeBanner />;
 * }
 * ```
 */
export function useApiWithArticles(
  filters?: ArticleFilters
): UseApiWithArticlesResult {
  const [data, setData] = useState<Article[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Serialize filters to a stable string to prevent infinite re-renders
  const filtersKey = JSON.stringify(filters ?? {});

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setIsDemoMode(false);

    const currentFilters = JSON.parse(filtersKey) as ArticleFilters;

    try {
      const result = await api.getArticles(currentFilters);
      setData(result);
      setIsDemoMode(false);
    } catch (err) {
      // Fallback to demo data
      console.warn(
        '[useApiWithFallback] API unavailable, using demo data:',
        err
      );
      const demoData = filterDemoArticles(demoArticles, currentFilters);
      setData(demoData);
      setIsDemoMode(true);
      setIsError(false);
      setError(null);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    isError,
    isDemoMode,
    error,
    refetch: fetchData,
  };
}

/**
 * Custom hook that fetches feeds from the API with automatic fallback to demo data.
 *
 * @returns Object containing feeds data, loading states, error info, and demo mode status
 *
 * @example
 * ```tsx
 * const { data, isLoading, isError, isDemoMode } = useApiWithFeeds();
 * ```
 */
export function useApiWithFeeds(): UseApiWithFeedsResult {
  const [data, setData] = useState<FeedsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setIsDemoMode(false);

    try {
      const result = await api.getFeeds();
      setData(result);
      setIsDemoMode(false);
    } catch (err) {
      // Fallback to demo data
      console.warn(
        '[useApiWithFallback] API unavailable, using demo feeds:',
        err
      );

      const demoFeeds: FeedsResponse = {
        supported_locales: getDemoLocales(),
        available_locales: getDemoLocales(),
        sources: getDemoSources(),
        categories: getDemoCategories(),
        feeds: [
          {
            type: 'locale',
            url: '/feed/en-us.xml',
            locale: 'en-us',
          },
          {
            type: 'locale',
            url: '/feed/ja-jp.xml',
            locale: 'ja-jp',
          },
          {
            type: 'locale',
            url: '/feed/ko-kr.xml',
            locale: 'ko-kr',
          },
          {
            type: 'locale',
            url: '/feed/zh-cn.xml',
            locale: 'zh-cn',
          },
        ],
        base_url: import.meta.env.PROD
          ? 'https://onestepat4time.github.io/lolstonks-rss'
          : 'http://localhost:8000',
      };

      setData(demoFeeds);
      setIsDemoMode(true);
      setIsError(false);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    isError,
    isDemoMode,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook options for useApiWithFallback.
 */
export interface UseApiWithFallbackOptions {
  /** Whether to enable demo mode fallback (default: true) */
  enableDemoMode?: boolean;
  /** Custom demo data to use instead of built-in demo data */
  customDemoData?: Article[];
  /** Delay in ms before showing loading state (default: 300) */
  loadingDelay?: number;
}

/**
 * Universal hook that can handle both articles and feeds API calls.
 *
 * @param apiCall - The API function to call
 * @param demoFallback - Function to provide demo data fallback
 * @param options - Additional options
 * @returns Object containing data, loading states, error info, and demo mode status
 *
 * @example
 * ```tsx
 * const { data, isLoading, isDemoMode } = useApiWithFallback(
 *   () => api.getArticles({ limit: 10 }),
 *   () => demoArticles.slice(0, 10)
 * );
 * ```
 */
export function useApiWithFallback<T>(
  apiCall: () => Promise<T>,
  demoFallback: () => T,
  options: UseApiWithFallbackOptions = {}
): {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  isDemoMode: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const {
    enableDemoMode = true,
    customDemoData,
    loadingDelay = 300,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setIsDemoMode(false);

    // Add artificial delay to prevent flicker
    if (loadingDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, loadingDelay));
    }

    try {
      const result = await apiCall();
      setData(result);
      setIsDemoMode(false);
    } catch (err) {
      if (enableDemoMode) {
        console.warn(
          '[useApiWithFallback] API unavailable, using demo data:',
          err
        );
        const fallbackData = customDemoData
          ? (customDemoData as unknown as T)
          : demoFallback();
        setData(fallbackData);
        setIsDemoMode(true);
        setIsError(false);
        setError(null);
      } else {
        setIsError(true);
        setError(err instanceof Error ? err : new Error('API call failed'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, demoFallback, enableDemoMode, customDemoData, loadingDelay]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    isError,
    isDemoMode,
    error,
    refetch: fetchData,
  };
}

/**
 * Helper hook to determine if we should show demo mode UI.
 * Returns true if in demo mode AND the user hasn't dismissed it.
 */
export function useDemoModeBanner(
  isDemoMode: boolean
): { showBanner: boolean; dismiss: () => void } {
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when demo mode changes
  useEffect(() => {
    if (!isDemoMode) {
      setDismissed(false);
    }
  }, [isDemoMode]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    // Optionally persist to localStorage
    try {
      localStorage.setItem('demo-banner-dismissed', 'true');
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const wasDismissed = localStorage.getItem('demo-banner-dismissed');
      if (wasDismissed === 'true' && isDemoMode) {
        setDismissed(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [isDemoMode]);

  return {
    showBanner: isDemoMode && !dismissed,
    dismiss,
  };
}
