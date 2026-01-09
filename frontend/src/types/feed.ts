export interface Feed {
  type: 'locale' | 'source_locale' | 'category_locale';
  url: string;
  locale?: string;
  source?: string;
  category?: string;
}

export interface Locale {
  id: string;
  code: string;
  name: string;
  flag: string;
  articleCount?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  articleCount?: number;
  localeCount?: number;
}

export interface Source {
  id: string;
  name: string;
  category: string;
  articleCount?: number;
  localeCount?: number;
}

export interface FeedsResponse {
  supported_locales: string[];
  available_locales: string[];
  sources: string[];
  categories: string[];
  feeds: Feed[];
  base_url: string;
}

export interface LocalePin {
  code: string;
  name: string;
  flag: string;
  lat: number;
  lon: number;
  articleCount: number;
}
