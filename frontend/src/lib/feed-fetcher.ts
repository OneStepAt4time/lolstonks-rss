import { parseRSSFeed } from './rss-parser';
import type { ParsedFeed } from '../types/articles';

export async function fetchFeed(locale: string): Promise<ParsedFeed> {
  const base = import.meta.env.BASE_URL;
  const feedPath = locale === 'main'
    ? `${base}feed.xml`
    : `${base}feed/${locale}.xml`;

  const res = await fetch(feedPath);
  if (!res.ok) {
    throw new Error(`Failed to fetch feed: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  return parseRSSFeed(xml);
}
