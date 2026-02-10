import { motion } from 'framer-motion';

interface ArticleCardSkeletonProps {
  variant?: 'default' | 'compact';
  index?: number;
}

/**
 * ArticleCardSkeleton - Loading skeleton for ArticleCard components
 *
 * Features:
 * - Gold shimmer animation (lol-gold color)
 * - Matches actual ArticleCard dimensions
 * - Smooth pulse effect with staggered animation delays
 */
export const ArticleCardSkeleton = ({ variant = 'default', index = 0 }: ArticleCardSkeletonProps) => {
  // Gold shimmer animation base classes
  const shimmerClasses = 'relative overflow-hidden';
  const shimmerBg = 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-lol-card before:via-lol-gold/20 before:to-lol-card before:bg-[length:200%_100%] before:animate-[shimmer_2s_ease-in-out_infinite]';

  if (variant === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="bg-lol-card border border-lol-gold/10 rounded-xl overflow-hidden"
      >
        <div className="flex gap-4 p-4">
          {/* Image Skeleton */}
          <div className={`${shimmerClasses} w-32 h-20 flex-shrink-0 rounded-lg bg-lol-card ${shimmerBg}`} />

          {/* Content Skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Source Badge */}
            <div className={`${shimmerClasses} w-16 h-3 rounded bg-lol-card ${shimmerBg}`} />
            {/* Title lines */}
            <div className={`${shimmerClasses} w-full h-4 rounded bg-lol-card ${shimmerBg}`} />
            <div className={`${shimmerClasses} w-4/5 h-4 rounded bg-lol-card ${shimmerBg}`} />
          </div>

          {/* Actions Skeleton */}
          <div className="flex flex-col gap-2">
            <div className={`${shimmerClasses} w-8 h-8 rounded-full bg-lol-card ${shimmerBg}`} />
            <div className={`${shimmerClasses} w-8 h-8 rounded-full bg-lol-card ${shimmerBg}`} />
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-lol-card border border-lol-gold/10 rounded-2xl overflow-hidden flex flex-col h-full"
    >
      {/* Image Skeleton */}
      <div className={`relative aspect-video bg-lol-card overflow-hidden ${shimmerClasses} ${shimmerBg}`}>
        {/* Source Badge Skeleton */}
        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/50 ${shimmerClasses} ${shimmerBg} w-20 h-6`} />
      </div>

      {/* Content Skeleton */}
      <div className="p-6 flex-1 flex flex-col space-y-3">
        {/* Date Skeleton */}
        <div className={`${shimmerClasses} w-20 h-3.5 rounded bg-lol-card ${shimmerBg}`} />

        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className={`${shimmerClasses} w-full h-6 rounded bg-lol-card ${shimmerBg}`} />
          <div className={`${shimmerClasses} w-11/12 h-6 rounded bg-lol-card ${shimmerBg}`} />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2 flex-1">
          <div className={`${shimmerClasses} w-full h-4 rounded bg-lol-card ${shimmerBg}`} />
          <div className={`${shimmerClasses} w-full h-4 rounded bg-lol-card ${shimmerBg}`} />
          <div className={`${shimmerClasses} w-3/4 h-4 rounded bg-lol-card ${shimmerBg}`} />
        </div>

        {/* Categories Skeleton */}
        <div className="flex gap-2">
          <div className={`${shimmerClasses} w-16 h-6 rounded-full bg-lol-card ${shimmerBg}`} />
          <div className={`${shimmerClasses} w-14 h-6 rounded-full bg-lol-card ${shimmerBg}`} />
        </div>

        {/* Actions Skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-lol-gold/10">
          <div className="flex gap-2">
            <div className={`${shimmerClasses} w-10 h-10 rounded-xl bg-lol-card ${shimmerBg}`} />
            <div className={`${shimmerClasses} w-10 h-10 rounded-xl bg-lol-card ${shimmerBg}`} />
          </div>
          <div className={`${shimmerClasses} w-24 h-9 rounded-xl bg-lol-card ${shimmerBg}`} />
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCardSkeleton;
