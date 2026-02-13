export interface RSSArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  pubDateTs: number;
  categories: string[];
  imageUrl: string | null;
  guid: string;
  author: string;
}

export interface FeedMeta {
  title: string;
  language: string;
  lastBuildDate: string;
  articleCount: number;
  categories: { name: string; count: number }[];
}

export interface ParsedFeed {
  articles: RSSArticle[];
  meta: FeedMeta;
}

export type FeedStatus = 'idle' | 'loading' | 'success' | 'error';
export type ArticleSortOrder = 'newest' | 'oldest';
