import { ArticleCard } from './ArticleCard';
import { ArticleSkeleton } from './ArticleSkeleton';
import { LoadMoreButton } from './LoadMoreButton';
import type { RSSArticle } from '../../types/articles';

interface ArticleGridProps {
  articles: RSSArticle[];
  loading?: boolean;
  hasMore: boolean;
  remainingCount: number;
  onLoadMore: () => void;
}

export const ArticleGrid = ({ articles, loading, hasMore, remainingCount, onLoadMore }: ArticleGridProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <ArticleSkeleton featured />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <ArticleSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  const [featured, ...rest] = articles;

  return (
    <div className="space-y-6">
      <ArticleCard
        key={featured.guid}
        title={featured.title}
        link={featured.link}
        description={featured.description}
        pubDate={featured.pubDate}
        categories={featured.categories}
        imageUrl={featured.imageUrl}
        featured
        animationDelay={0}
      />

      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {rest.map((article, i) => (
            <ArticleCard
              key={article.guid}
              title={article.title}
              link={article.link}
              description={article.description}
              pubDate={article.pubDate}
              categories={article.categories}
              imageUrl={article.imageUrl}
              animationDelay={Math.min(i, 5) * 50}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <LoadMoreButton remaining={remainingCount} onClick={onLoadMore} />
      )}
    </div>
  );
};
