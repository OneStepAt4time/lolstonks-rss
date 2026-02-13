import type { RSSArticle, FeedMeta, ParsedFeed } from '../types/articles';

const SOURCE_CATEGORY_RE = /^(lol|dotesports)-/;

function getTextContent(parent: Element, tag: string): string {
  return parent.querySelector(tag)?.textContent?.trim() ?? '';
}

function parseItem(item: Element): RSSArticle {
  const title = getTextContent(item, 'title');
  const link = getTextContent(item, 'link');
  const description = getTextContent(item, 'description');
  const pubDate = getTextContent(item, 'pubDate');
  const guid = getTextContent(item, 'guid') || link;
  const author = getTextContent(item, 'author');

  const enclosure = item.querySelector('enclosure');
  const imageUrl = enclosure?.getAttribute('url') || null;

  const categoryEls = item.querySelectorAll('category');
  const categories: string[] = [];
  categoryEls.forEach((el) => {
    const text = el.textContent?.trim();
    if (text && !SOURCE_CATEGORY_RE.test(text)) {
      categories.push(text);
    }
  });

  return {
    title,
    link,
    description,
    pubDate,
    pubDateTs: pubDate ? new Date(pubDate).getTime() : 0,
    categories,
    imageUrl,
    guid,
    author,
  };
}

export function parseRSSFeed(xml: string): ParsedFeed {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid RSS feed XML');
  }

  const channel = doc.querySelector('channel');
  if (!channel) {
    throw new Error('No channel element found in RSS feed');
  }

  const items = channel.querySelectorAll('item');
  const articles: RSSArticle[] = [];
  items.forEach((item) => {
    articles.push(parseItem(item));
  });

  // Build category counts
  const categoryCounts = new Map<string, number>();
  for (const article of articles) {
    for (const cat of article.categories) {
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
    }
  }

  const categories = Array.from(categoryCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const meta: FeedMeta = {
    title: getTextContent(channel, 'title'),
    language: getTextContent(channel, 'language'),
    lastBuildDate: getTextContent(channel, 'lastBuildDate'),
    articleCount: articles.length,
    categories,
  };

  return { articles, meta };
}
