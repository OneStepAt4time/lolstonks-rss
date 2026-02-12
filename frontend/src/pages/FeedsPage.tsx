import { useEffect } from 'react';
import { useStore } from '../store';
import { FeedBrowser } from '../components/feed-browser/FeedBrowser';
import { MetaTags } from '../components/seo';
import { generateBreadcrumbStructuredData } from '../utils/seo';
import { StructuredData } from '../components/seo';

export const FeedsPage = () => {
  const { fetchFeeds } = useStore();

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  const seoTitle = 'Browse RSS Feeds';
  const seoDescription =
    'Explore and customize your League of Legends news feeds. Choose from 20 languages, filter by category (esports, dev, game updates), or select specific sources.';

  const breadcrumbs = [
    { name: 'Home', url: 'https://onestepat4time.github.io/lolstonks-rss/' },
    { name: 'Browse Feeds', url: 'https://onestepat4time.github.io/lolstonks-rss/feeds' },
  ];

  return (
    <>
      <MetaTags
        title={seoTitle}
        description={seoDescription}
        canonicalUrl="https://onestepat4time.github.io/lolstonks-rss/feeds"
      />
      <StructuredData data={generateBreadcrumbStructuredData(breadcrumbs)} />

      <div className="container mx-auto px-4 py-8">
        <FeedBrowser />
      </div>
    </>
  );
};
