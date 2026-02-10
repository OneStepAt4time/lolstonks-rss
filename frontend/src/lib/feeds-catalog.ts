/**
 * Feeds Catalog - Static feed URL generator for LoL Stonks RSS
 *
 * This module provides a programmatic way to generate all available RSS feed URLs
 * without requiring API calls. The catalog is structured as:
 * - 20 locales × (1 main feed + categories + sources) = ~200 feeds total
 *
 * Feed URL Patterns:
 * - Main locale feed: /rss/{locale}/
 * - Category feed: /rss/{locale}/{category}
 * - Source feed: /rss/{source}/
 */

/**
 * Base URL for RSS feeds
 */
const BASE_URL = 'https://onestepat4time.github.io/lolstonksrss';

/**
 * Supported locales (20 Riot Games locales)
 */
export const LOCALES = [
  'en-us', 'it-it', 'en-gb', 'es-es', 'es-mx',
  'fr-fr', 'de-de', 'pt-br', 'ru-ru', 'tr-tr',
  'pl-pl', 'ja-jp', 'ko-kr', 'zh-cn', 'zh-tw',
  'ar-ae', 'vi-vn', 'th-th', 'id-id', 'ph-ph'
] as const;

/**
 * Locale display names with flags
 */
export const LOCALE_NAMES: Record<string, { name: string; flag: string }> = {
  'en-us': { name: 'English (US)', flag: '🇺🇸' },
  'it-it': { name: 'Italiano', flag: '🇮🇹' },
  'en-gb': { name: 'English (UK)', flag: '🇬🇧' },
  'es-es': { name: 'Español (España)', flag: '🇪🇸' },
  'es-mx': { name: 'Español (México)', flag: '🇲🇽' },
  'fr-fr': { name: 'Français', flag: '🇫🇷' },
  'de-de': { name: 'Deutsch', flag: '🇩🇪' },
  'pt-br': { name: 'Português (Brasil)', flag: '🇧🇷' },
  'ru-ru': { name: 'Русский', flag: '🇷🇺' },
  'tr-tr': { name: 'Türkçe', flag: '🇹🇷' },
  'pl-pl': { name: 'Polski', flag: '🇵🇱' },
  'ja-jp': { name: '日本語', flag: '🇯🇵' },
  'ko-kr': { name: '한국어', flag: '🇰🇷' },
  'zh-cn': { name: '简体中文', flag: '🇨🇳' },
  'zh-tw': { name: '繁體中文', flag: '🇹🇼' },
  'ar-ae': { name: 'العربية', flag: '🇦🇪' },
  'vi-vn': { name: 'Tiếng Việt', flag: '🇻🇳' },
  'th-th': { name: 'ภาษาไทย', flag: '🇹🇭' },
  'id-id': { name: 'Bahasa Indonesia', flag: '🇮🇩' },
  'ph-ph': { name: 'Filipino', flag: '🇵🇭' }
};

/**
 * Supported categories
 */
export const CATEGORIES = [
  'OFFICIAL_RIOT',
  'COMMUNITY_HUB',
  'ANALYTICS',
  'REGIONAL',
  'ESPORTS',
  'SOCIAL',
  'AGGREGATOR',
  'PBE',
  'TFT'
] as const;

/**
 * Category display names with icons
 */
export const CATEGORY_NAMES: Record<string, { name: string; icon: string }> = {
  'OFFICIAL_RIOT': { name: 'Official Riot', icon: '🎮' },
  'COMMUNITY_HUB': { name: 'Community Hub', icon: '👥' },
  'ANALYTICS': { name: 'Analytics', icon: '📊' },
  'REGIONAL': { name: 'Regional', icon: '🌍' },
  'ESPORTS': { name: 'Esports', icon: '🏆' },
  'SOCIAL': { name: 'Social', icon: '💬' },
  'AGGREGATOR': { name: 'Aggregator', icon: '📰' },
  'PBE': { name: 'PBE', icon: '🧪' },
  'TFT': { name: 'Teamfight Tactics', icon: '♟️' }
};

/**
 * Supported sources (Riot Games platforms)
 */
export const SOURCES = [
  'leagueoflegends.com',
  'riotgames.com',
  'playvalorant.com',
  'playruneterra.com',
  'wildrift.leagueoflegends.com'
] as const;

/**
 * Source display names
 */
export const SOURCE_NAMES: Record<string, string> = {
  'leagueoflegends.com': 'League of Legends',
  'riotgames.com': 'Riot Games',
  'playvalorant.com': 'VALORANT',
  'playruneterra.com': 'Legends of Runeterra',
  'wildrift.leagueoflegends.com': 'Wild Rift'
};

/**
 * Feed type enumeration
 */
export type FeedType = 'locale' | 'category_locale' | 'source';

/**
 * Single feed item in the catalog
 */
export interface FeedItem {
  /** Unique identifier for the feed */
  id: string;
  /** Type of feed */
  type: FeedType;
  /** Full URL to the RSS feed */
  url: string;
  /** Locale code (if applicable) */
  locale?: string;
  /** Category name (if applicable) */
  category?: string;
  /** Source name (if applicable) */
  source?: string;
  /** Display name for the feed */
  displayName: string;
  /** Icon/emoji for the feed */
  icon: string;
}

/**
 * Grouped feeds by locale
 */
export interface LocaleGroup {
  locale: string;
  localeName: string;
  flag: string;
  mainFeed: FeedItem;
  categoryFeeds: FeedItem[];
}

/**
 * Complete feed catalog structure
 */
export interface FeedCatalog {
  /** All feed items flat array */
  allFeeds: FeedItem[];
  /** Feeds grouped by locale */
  byLocale: LocaleGroup[];
  /** Feeds grouped by type */
  byType: {
    locale: FeedItem[];
    category_locale: FeedItem[];
    source: FeedItem[];
  };
  /** Summary statistics */
  stats: {
    totalFeeds: number;
    localeCount: number;
    categoryCount: number;
    sourceCount: number;
  };
}

/**
 * Generate a locale main feed URL
 *
 * @param locale - Locale code (e.g., 'en-us')
 * @returns Feed item for the locale
 */
function generateLocaleFeed(locale: string): FeedItem {
  const url = `${BASE_URL}/rss/${locale}/`;
  const localeInfo = LOCALE_NAMES[locale];

  return {
    id: `locale-${locale}`,
    type: 'locale',
    url,
    locale,
    displayName: `${localeInfo.flag} ${localeInfo.name} - All News`,
    icon: localeInfo.flag
  };
}

/**
 * Generate a category feed URL for a locale
 *
 * @param locale - Locale code
 * @param category - Category name
 * @returns Feed item for the category-locale combination
 */
function generateCategoryFeed(locale: string, category: string): FeedItem {
  const url = `${BASE_URL}/rss/${locale}/${category.toLowerCase()}`;
  const localeInfo = LOCALE_NAMES[locale];
  const categoryInfo = CATEGORY_NAMES[category];

  return {
    id: `category-${locale}-${category}`,
    type: 'category_locale',
    url,
    locale,
    category,
    displayName: `${categoryInfo.icon} ${categoryInfo.name} - ${localeInfo.flag}`,
    icon: categoryInfo.icon
  };
}

/**
 * Generate a source feed URL
 *
 * @param source - Source domain
 * @returns Feed item for the source
 */
function generateSourceFeed(source: string): FeedItem {
  const url = `${BASE_URL}/rss/${source}/`;
  const sourceName = SOURCE_NAMES[source] || source;

  return {
    id: `source-${source.replace('.', '-')}`,
    type: 'source',
    url,
    source,
    displayName: `📰 ${sourceName}`,
    icon: '📰'
  };
}

/**
 * Generate the complete feed catalog
 *
 * This function generates all possible RSS feed URLs for the LoL Stonks RSS
 * service without requiring any API calls. The catalog includes:
 * - 20 locale main feeds
 * - 180 category feeds (20 locales × 9 categories)
 * - 5 source feeds
 * - Total: ~205 feeds
 *
 * @returns Complete feed catalog with all feeds organized by various groupings
 */
export function getFeedCatalog(): FeedCatalog {
  // Generate all locale feeds
  const localeFeeds: FeedItem[] = LOCALES.map(generateLocaleFeed);

  // Generate all category feeds for each locale
  const categoryFeeds: FeedItem[] = [];
  LOCALES.forEach((locale) => {
    CATEGORIES.forEach((category) => {
      categoryFeeds.push(generateCategoryFeed(locale, category));
    });
  });

  // Generate all source feeds
  const sourceFeeds: FeedItem[] = SOURCES.map(generateSourceFeed);

  // Combine all feeds
  const allFeeds = [...localeFeeds, ...categoryFeeds, ...sourceFeeds];

  // Group by locale
  const byLocale: LocaleGroup[] = LOCALES.map((locale) => {
    const localeInfo = LOCALE_NAMES[locale];
    const mainFeed = localeFeeds.find((f) => f.locale === locale)!;
    const categoryFeedsForLocale = categoryFeeds.filter((f) => f.locale === locale);

    return {
      locale,
      localeName: localeInfo.name,
      flag: localeInfo.flag,
      mainFeed,
      categoryFeeds: categoryFeedsForLocale
    };
  });

  // Group by type
  const byType = {
    locale: localeFeeds,
    category_locale: categoryFeeds,
    source: sourceFeeds
  };

  // Calculate statistics
  const stats = {
    totalFeeds: allFeeds.length,
    localeCount: localeFeeds.length,
    categoryCount: categoryFeeds.length,
    sourceCount: sourceFeeds.length
  };

  return {
    allFeeds,
    byLocale,
    byType,
    stats
  };
}

/**
 * Get all available locales
 *
 * @returns Array of locale codes
 */
export function getAvailableLocales(): string[] {
  return [...LOCALES];
}

/**
 * Get all available categories
 *
 * @returns Array of category names
 */
export function getAvailableCategories(): string[] {
  return [...CATEGORIES];
}

/**
 * Get all available sources
 *
 * @returns Array of source domains
 */
export function getAvailableSources(): string[] {
  return [...SOURCES];
}

/**
 * Get locale display information
 *
 * @param locale - Locale code
 * @returns Locale display info or undefined if not found
 */
export function getLocaleInfo(locale: string) {
  return LOCALE_NAMES[locale];
}

/**
 * Get category display information
 *
 * @param category - Category name
 * @returns Category display info or undefined if not found
 */
export function getCategoryInfo(category: string) {
  return CATEGORY_NAMES[category];
}

/**
 * Search feeds by query string
 *
 * @param catalog - Feed catalog from getFeedCatalog()
 * @param query - Search query (matches URL, locale, category, source, displayName)
 * @returns Filtered array of feeds
 */
export function searchFeeds(catalog: FeedCatalog, query: string): FeedItem[] {
  if (!query.trim()) {
    return catalog.allFeeds;
  }

  const lowerQuery = query.toLowerCase();

  return catalog.allFeeds.filter((feed) => {
    return (
      feed.url.toLowerCase().includes(lowerQuery) ||
      feed.locale?.toLowerCase().includes(lowerQuery) ||
      feed.category?.toLowerCase().includes(lowerQuery) ||
      feed.source?.toLowerCase().includes(lowerQuery) ||
      feed.displayName.toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Filter feeds by locale
 *
 * @param catalog - Feed catalog from getFeedCatalog()
 * @param locale - Locale code to filter by
 * @returns Filtered array of feeds for the locale
 */
export function filterByLocale(catalog: FeedCatalog, locale: string): FeedItem[] {
  return catalog.allFeeds.filter((feed) => feed.locale === locale);
}

/**
 * Filter feeds by category
 *
 * @param catalog - Feed catalog from getFeedCatalog()
 * @param category - Category to filter by
 * @returns Filtered array of feeds for the category
 */
export function filterByCategory(catalog: FeedCatalog, category: string): FeedItem[] {
  return catalog.allFeeds.filter((feed) => feed.category === category);
}

/**
 * Filter feeds by type
 *
 * @param catalog - Feed catalog from getFeedCatalog()
 * @param type - Feed type to filter by
 * @returns Filtered array of feeds of the specified type
 */
export function filterByType(catalog: FeedCatalog, type: FeedType): FeedItem[] {
  return catalog.allFeeds.filter((feed) => feed.type === type);
}
