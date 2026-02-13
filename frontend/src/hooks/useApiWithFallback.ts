/**
 * Custom hook for API calls with automatic fallback to demo data.
 * Provides seamless demo mode experience when the API is unavailable.
 */

import { useState, useEffect, useCallback } from 'react';
import type { FeedsResponse } from '../types/feed';
import { api } from '../services/api';

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
  /** Delay in ms before showing loading state (default: 300) */
  loadingDelay?: number;
}

/**
 * Universal hook that can handle API calls with fallback.
 *
 * @param apiCall - The API function to call
 * @param demoFallback - Function to provide demo data fallback
 * @param options - Additional options
 * @returns Object containing data, loading states, error info, and demo mode status
 *
 * @example
 * ```tsx
 * const { data, isLoading, isDemoMode } = useApiWithFallback(
 *   () => api.getFeeds(),
 *   () => demoFeedsResponse
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
        const fallbackData = demoFallback();
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
  }, [apiCall, demoFallback, enableDemoMode, loadingDelay]);

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
