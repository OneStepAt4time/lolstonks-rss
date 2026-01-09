/**
 * SEO utility functions for generating meta tags and Open Graph data
 */

export interface MetaTags {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  keywords?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface ArticleStructuredData {
  headline: string;
  description: string;
  image?: string;
  author: string;
  publishedAt: string;
  modifiedAt?: string;
  url: string;
}

const SITE_NAME = 'LoL Stonks RSS';
const DEFAULT_DESCRIPTION =
  'Get the latest League of Legends news from Riot Games in your favorite RSS reader. Available in 20 languages with customizable feeds by source and category.';
const DEFAULT_OG_IMAGE = '/lolstonksrss/og-image.png';
const SITE_URL = 'https://onestepat4time.github.io/lolstonksrss';

/**
 * Generate meta tags for the document head
 */
export function generateMetaTags(tags: MetaTags): Record<string, string> {
  const {
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    canonicalUrl,
    keywords,
    noindex = false,
    nofollow = false,
  } = tags;

  const fullTitle = `${title} | ${SITE_NAME}`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;
  const fullCanonicalUrl = canonicalUrl || `${SITE_URL}/`;

  return {
    title: fullTitle,
    description,

    // Open Graph
    'og:title': ogTitle || fullTitle,
    'og:description': ogDescription || description,
    'og:image': fullOgImage,
    'og:type': ogType,
    'og:url': fullCanonicalUrl,
    'og:site_name': SITE_NAME,

    // Twitter Card
    'twitter:card': twitterCard,
    'twitter:title': ogTitle || fullTitle,
    'twitter:description': ogDescription || description,
    'twitter:image': fullOgImage,
    'twitter:site': '@LoLStonks',

    // SEO
    'keywords': keywords || 'League of Legends, LoL, RSS, news, Riot Games, esports, patch notes',
    'robots': `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`,

    // Canonical
    'canonical': fullCanonicalUrl,
  };
}

/**
 * Generate JSON-LD structured data for a NewsArticle
 */
export function generateArticleStructuredData(article: ArticleStructuredData): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.headline,
    description: article.description,
    image: article.image,
    author: {
      '@type': 'Organization',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LoL Stonks RSS',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt || article.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };

  return JSON.stringify(structuredData);
}

/**
 * Generate JSON-LD structured data for the website
 */
export function generateWebsiteStructuredData(): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/feeds?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return JSON.stringify(structuredData);
}

/**
 * Generate JSON-LD structured data for BreadcrumbList
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>
): string {
  const itemList = breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.url,
  }));

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itemList,
  };

  return JSON.stringify(structuredData);
}

/**
 * Format date for structured data (ISO 8601)
 */
export function formatDateForSEO(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Truncate text to specified length for meta descriptions
 */
export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3).trim() + '...';
}
