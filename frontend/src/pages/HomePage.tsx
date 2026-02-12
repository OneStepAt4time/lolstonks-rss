import { ArticleGrid } from '../components/articles/ArticleGrid';
import { HeroSection } from '../components/home/HeroSection';
import { QuickStats } from '../components/home/QuickStats';
import { FeatureHighlights } from '../components/home/FeatureHighlights';
import { TrendingFeeds } from '../components/home/TrendingFeeds';
import { QuickStartGuide } from '../components/home/QuickStartGuide';
import { MetaTags } from '../components/seo';
import { generateWebsiteStructuredData } from '../utils/seo';
import { StructuredData } from '../components/seo';

export const HomePage = () => {
  const seoTitle = 'League of Legends News';
  const seoDescription =
    'Get the latest League of Legends news, patch notes, and updates from Riot Games. Stay informed with real-time RSS feeds available in 20 languages.';

  return (
    <>
      <MetaTags
        title={seoTitle}
        description={seoDescription}
        ogType="website"
        canonicalUrl="https://onestepat4time.github.io/lolstonks-rss/"
      />
      <StructuredData data={generateWebsiteStructuredData()} />

      <div>
        <HeroSection />
        <QuickStats />
        <FeatureHighlights />
        <TrendingFeeds />
        <QuickStartGuide />

        <div className="container mx-auto px-4 py-12">
          <ArticleGrid />
        </div>
      </div>
    </>
  );
};
