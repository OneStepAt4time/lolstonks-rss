import { useEffect } from 'react';
import { useStore } from '../store';
import { FeedBrowser } from '../components/feed-browser/FeedBrowser';
import { MetaTags } from '../components/seo';
import { generateBreadcrumbStructuredData } from '../utils/seo';
import { StructuredData } from '../components/seo';

export const FeedsPage = () => {
  const { feedsLoading: loading, fetchFeeds } = useStore();

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  const seoTitle = 'Browse RSS Feeds';
  const seoDescription =
    'Explore and customize your League of Legends news feeds. Choose from 20 languages, filter by category (esports, dev, game updates), or select specific sources.';

  const breadcrumbs = [
    { name: 'Home', url: 'https://onestepat4time.github.io/lolstonksrss/' },
    { name: 'Browse Feeds', url: 'https://onestepat4time.github.io/lolstonksrss/feeds' },
  ];

  if (loading) {
    return (
      <>
        <MetaTags
          title={seoTitle}
          description={seoDescription}
          canonicalUrl="https://onestepat4time.github.io/lolstonksrss/feeds"
        />
        <StructuredData data={generateBreadcrumbStructuredData(breadcrumbs)} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-lol-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lol-blue">Loading feeds...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaTags
        title={seoTitle}
        description={seoDescription}
        canonicalUrl="https://onestepat4time.github.io/lolstonksrss/feeds"
      />
      <StructuredData data={generateBreadcrumbStructuredData(breadcrumbs)} />

      <div className="container mx-auto px-4 py-8">
        <FeedBrowser />
      </div>
    </>
  );
};
