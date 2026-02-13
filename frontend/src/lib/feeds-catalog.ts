/**
 * Feeds Catalog - Static feed URL generator for LoL Stonks RSS
 *
 * Generates correct URLs matching GitHub Pages deployment:
 * - Main feed: /feed.xml
 * - Per-locale feeds: /feed/{locale}.xml (20 locales)
 */

const BASE_URL = 'https://onestepat4time.github.io/lolstonks-rss';

export const LOCALES = [
  'en-us', 'it-it', 'en-gb', 'es-es', 'es-mx',
  'fr-fr', 'de-de', 'pt-br', 'ru-ru', 'tr-tr',
  'pl-pl', 'ja-jp', 'ko-kr', 'zh-cn', 'zh-tw',
  'ar-ae', 'vi-vn', 'th-th', 'id-id', 'ph-ph'
] as const;

export const LOCALE_NAMES: Record<string, { name: string; flag: string; searchTerms?: string }> = {
  'en-us': { name: 'English (US)', flag: '🇺🇸', searchTerms: 'united states america' },
  'it-it': { name: 'Italiano', flag: '🇮🇹', searchTerms: 'italian italy' },
  'en-gb': { name: 'English (UK)', flag: '🇬🇧', searchTerms: 'united kingdom britain' },
  'es-es': { name: 'Español (España)', flag: '🇪🇸', searchTerms: 'spanish spain' },
  'es-mx': { name: 'Español (México)', flag: '🇲🇽', searchTerms: 'spanish mexico' },
  'fr-fr': { name: 'Français', flag: '🇫🇷', searchTerms: 'french france' },
  'de-de': { name: 'Deutsch', flag: '🇩🇪', searchTerms: 'german germany' },
  'pt-br': { name: 'Português (Brasil)', flag: '🇧🇷', searchTerms: 'portuguese brazil' },
  'ru-ru': { name: 'Русский', flag: '🇷🇺', searchTerms: 'russian russia' },
  'tr-tr': { name: 'Türkçe', flag: '🇹🇷', searchTerms: 'turkish turkey' },
  'pl-pl': { name: 'Polski', flag: '🇵🇱', searchTerms: 'polish poland' },
  'ja-jp': { name: '日本語', flag: '🇯🇵', searchTerms: 'japanese japan' },
  'ko-kr': { name: '한국어', flag: '🇰🇷', searchTerms: 'korean korea' },
  'zh-cn': { name: '简体中文', flag: '🇨🇳', searchTerms: 'chinese china simplified' },
  'zh-tw': { name: '繁體中文', flag: '🇹🇼', searchTerms: 'chinese taiwan traditional' },
  'ar-ae': { name: 'العربية', flag: '🇦🇪', searchTerms: 'arabic emirates' },
  'vi-vn': { name: 'Tiếng Việt', flag: '🇻🇳', searchTerms: 'vietnamese vietnam' },
  'th-th': { name: 'ภาษาไทย', flag: '🇹🇭', searchTerms: 'thai thailand' },
  'id-id': { name: 'Bahasa Indonesia', flag: '🇮🇩', searchTerms: 'indonesian indonesia' },
  'ph-ph': { name: 'Filipino', flag: '🇵🇭', searchTerms: 'philippines tagalog' }
};

/** Region groupings for the catalog UI */
export type Region = 'all' | 'americas' | 'europe' | 'asia' | 'mena';

export const REGION_LOCALES: Record<Exclude<Region, 'all'>, string[]> = {
  americas: ['en-us', 'es-mx', 'pt-br'],
  europe: ['en-gb', 'es-es', 'fr-fr', 'de-de', 'it-it', 'ru-ru', 'tr-tr', 'pl-pl'],
  asia: ['ja-jp', 'ko-kr', 'zh-cn', 'zh-tw', 'vi-vn', 'th-th', 'id-id', 'ph-ph'],
  mena: ['ar-ae'],
};

export type FeedType = 'main' | 'locale';

export interface FeedItem {
  id: string;
  type: FeedType;
  url: string;
  locale?: string;
  displayName: string;
  icon: string;
}

export interface LocaleGroup {
  locale: string;
  localeName: string;
  flag: string;
  feed: FeedItem;
  searchTerms?: string;
}

export interface FeedCatalog {
  mainFeed: FeedItem;
  localeFeeds: FeedItem[];
  byLocale: LocaleGroup[];
  stats: {
    totalFeeds: number;
    localeCount: number;
  };
}

function generateMainFeed(): FeedItem {
  return {
    id: 'main-feed',
    type: 'main',
    url: `${BASE_URL}/feed.xml`,
    displayName: 'All Locales - Combined Feed',
    icon: '🌐'
  };
}

function generateLocaleFeed(locale: string): FeedItem {
  const info = LOCALE_NAMES[locale];
  return {
    id: `locale-${locale}`,
    type: 'locale',
    url: `${BASE_URL}/feed/${locale}.xml`,
    locale,
    displayName: `${info.name}`,
    icon: info.flag
  };
}

/** Generate the complete feed catalog with correct GitHub Pages URLs */
export function getFeedCatalog(): FeedCatalog {
  const mainFeed = generateMainFeed();
  const localeFeeds = LOCALES.map(generateLocaleFeed);

  const byLocale: LocaleGroup[] = LOCALES.map((locale) => {
    const info = LOCALE_NAMES[locale];
    const feed = localeFeeds.find((f) => f.locale === locale)!;
    return { locale, localeName: info.name, flag: info.flag, feed, searchTerms: info.searchTerms };
  });

  return {
    mainFeed,
    localeFeeds,
    byLocale,
    stats: {
      totalFeeds: 1 + localeFeeds.length,
      localeCount: localeFeeds.length,
    },
  };
}

/** Search feeds by query string */
export function searchFeeds(catalog: FeedCatalog, query: string): FeedItem[] {
  if (!query.trim()) return [catalog.mainFeed, ...catalog.localeFeeds];

  const q = query.toLowerCase();
  const all = [catalog.mainFeed, ...catalog.localeFeeds];
  return all.filter((feed) => {
    if (
      feed.displayName.toLowerCase().includes(q) ||
      feed.url.toLowerCase().includes(q) ||
      feed.locale?.toLowerCase().includes(q) ||
      feed.icon.includes(q)
    ) return true;
    // Check English search terms for locale feeds
    if (feed.locale) {
      const info = LOCALE_NAMES[feed.locale];
      if (info?.searchTerms?.toLowerCase().includes(q)) return true;
    }
    return false;
  });
}
