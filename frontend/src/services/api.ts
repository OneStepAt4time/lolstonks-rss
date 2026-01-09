import type { Article, ArticleFilters } from '../types/article';
import type { FeedsResponse } from '../types/feed';

const API_BASE = import.meta.env.PROD
  ? 'https://onestepat4time.github.io/lolstonksrss'
  : 'http://localhost:8000';

export const api = {
  /**
   * Fetch articles from the API
   */
  async getArticles(filters?: ArticleFilters): Promise<Article[]> {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.source) params.append('source', filters.source);

    const response = await fetch(`${API_BASE}/api/articles?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return response.json();
  },

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
    const baseUrl = `${API_BASE}/rss`;
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
