import { parseRSSFeed } from './rss-parser';
import type { ParsedFeed } from '../types/articles';
import type { GameType } from '../types/feed';

function buildFeedPath(
  locale: string,
  game?: GameType,
  category?: string,
): string {
  const base = import.meta.env.BASE_URL;

  if (locale === 'main') {
    return `${base}feed.xml`;
  }

  if (game && category) {
    return `${base}feed/${game}/${locale}/${category}.xml`;
  }

  if (game && game !== 'lol') {
    return `${base}feed/${game}/${locale}.xml`;
  }

  return `${base}feed/${locale}.xml`;
}

export async function fetchFeed(
  locale: string,
  game?: GameType,
  category?: string,
): Promise<ParsedFeed> {
  const feedPath = buildFeedPath(locale, game, category);

  const res = await fetch(feedPath);
  if (!res.ok) {
    throw new Error(`Failed to fetch feed: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  return parseRSSFeed(xml);
}
