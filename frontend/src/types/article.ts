export interface Article {
  guid: string;
  title: string;
  url: string;
  pub_date: string;
  description: string | null;
  content: string | null;
  author: string | null;
  image_url: string | null;
  categories: string[];
  locale: string;
  source: string;
  source_category: string;
}

export interface ArticleFilters {
  locale?: string;
  category?: string;
  source?: string;
  search?: string;
  limit?: number;
}
