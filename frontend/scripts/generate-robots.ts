/**
 * Generate robots.txt for LoL Stonks RSS
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const SITE_URL = 'https://onestepat4time.github.io/lolstonksrss';

/**
 * Generate robots.txt content
 */
function generateRobotsTxt(): string {
  return `# Allow all crawlers
User-agent: *
Allow: /

# Disallow certain paths if needed
# Disallow: /api/
# Disallow: /private/

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay (optional, be nice to servers)
# Crawl-delay: 1
`;
}

/**
 * Main function to generate robots.txt
 */
async function generateRobots() {
  console.log('🤖 Generating robots.txt...');

  const content = generateRobotsTxt();

  // Write to dist directory (will be created during build)
  const outputPath = join(process.cwd(), 'dist', 'robots.txt');

  try {
    writeFileSync(outputPath, content, 'utf-8');
    console.log(`✅ robots.txt generated: ${outputPath}`);
    console.log(`📦 File size: ${(content.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Error writing robots.txt:', error);
    process.exit(1);
  }
}

// Run if called directly
generateRobots().catch(console.error);

export { generateRobots };
