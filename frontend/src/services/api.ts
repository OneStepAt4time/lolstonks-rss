import type { FeedsResponse } from '../types/feed';

const API_BASE = import.meta.env.PROD
  ? 'https://onestepat4time.github.io/lolstonks-rss'
  : 'http://localhost:8000';

export const api = {
  /**
   * Fetch all available feeds
   */
  async getFeeds(): Promise<FeedsResponse> {
    const response = await fetch(`${API_BASE}/feeds`);
    if (!response.ok) {
      throw new Error('Failed to fetch feeds');
    }
    return response.json();
  },

  /**
   * Get RSS feed URL for a specific combination
   */
  getFeedUrl(locale: string, category?: string, source?: string): string {
    const baseUrl = `${API_BASE}/feed`;
    if (category) {
      return `${baseUrl}/${locale}/category/${category}.xml`;
    }
    if (source) {
      return `${baseUrl}/${locale}/${source}.xml`;
    }
    return `${baseUrl}/${locale}.xml`;
  },

  /**
   * Get main RSS feed URL
   */
  getMainFeedUrl(): string {
    return `${API_BASE}/feed.xml`;
  },
};
