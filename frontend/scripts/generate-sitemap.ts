/**
 * Generate sitemap.xml for LoL Stonks RSS
 *
 * This script generates a comprehensive sitemap including:
 * - Main pages (/, /feeds)
 * - All locale feeds (/feed/{locale}.xml)
 * - All category feeds (/feed/{locale}/category/{category}.xml)
 * - All source feeds (/feed/{locale}/{source}.xml)
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const SITE_URL = 'https://onestepat4time.github.io/lolstonks-rss';

// Riot supported locales (20 total)
const LOCALES = [
  'en-US', 'de-DE', 'es-ES', 'es-MX', 'fr-FR', 'id-ID', 'it-IT', 'ja-JP',
  'ko-KR', 'pl-PL', 'pt-BR', 'ru-RU', 'th-TH', 'tr-TR', 'vi-VN', 'zh-CN',
  'zh-TW', 'en-GB', 'el-GR', 'ro-RO'
];

// Categories based on Riot sources
const CATEGORIES = [
  'dev', 'esports', 'game', 'media', 'riot-games'
];

// Sources
const SOURCES = [
  'league-client', 'riot-client', 'lolesports', 'lol'
];

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * Generate sitemap XML from entries
 */
function generateSitemapXML(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Get current date in ISO format
 */
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generate all sitemap entries
 */
function generateSitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const currentDate = getCurrentDate();

  // Main pages (highest priority)
  entries.push({
    url: `${SITE_URL}/`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // /feeds redirects to / now, no separate entry needed

  // Locale feeds (high priority, updated hourly)
  LOCALES.forEach((locale) => {
    entries.push({
      url: `${SITE_URL}/feed/${locale}.xml`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.8,
    });
  });

  // Category feeds (medium-high priority)
  LOCALES.forEach((locale) => {
    CATEGORIES.forEach((category) => {
      entries.push({
        url: `${SITE_URL}/feed/${locale}/category/${category}.xml`,
        lastModified: currentDate,
        changeFrequency: 'hourly',
        priority: 0.7,
      });
    });
  });

  // Source feeds (medium priority)
  LOCALES.forEach((locale) => {
    SOURCES.forEach((source) => {
      entries.push({
        url: `${SITE_URL}/feed/${locale}/${source}.xml`,
        lastModified: currentDate,
        changeFrequency: 'hourly',
        priority: 0.6,
      });
    });
  });

  return entries;
}

/**
 * Main function to generate sitemap
 */
async function generateSitemap() {
  console.log('🗺️  Generating sitemap.xml...');

  const entries = generateSitemapEntries();

  console.log(`📊 Total URLs: ${entries.length}`);
  console.log(`   - Main pages: 2`);
  console.log(`   - Locale feeds: ${LOCALES.length}`);
  console.log(`   - Category feeds: ${LOCALES.length * CATEGORIES.length}`);
  console.log(`   - Source feeds: ${LOCALES.length * SOURCES.length}`);

  const xml = generateSitemapXML(entries);

  // Write to dist directory (will be created during build)
  const outputPath = join(process.cwd(), 'dist', 'sitemap.xml');

  try {
    writeFileSync(outputPath, xml, 'utf-8');
    console.log(`✅ Sitemap generated: ${outputPath}`);
    console.log(`📦 File size: ${(xml.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Error writing sitemap:', error);
    process.exit(1);
  }
}

// Run if called directly
generateSitemap().catch(console.error);

export { generateSitemap };
