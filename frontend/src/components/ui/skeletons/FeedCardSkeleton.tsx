import { motion } from 'framer-motion';

interface FeedCardSkeletonProps {
  index?: number;
  showSampleArticles?: boolean;
}

/**
 * FeedCardSkeleton - Loading skeleton for FeedPreviewCard components
 *
 * Features:
 * - Gold shimmer animation (lol-gold color)
 * - Matches actual FeedPreviewCard dimensions
 * - Smooth pulse effect with staggered animation delays
 */
export const FeedCardSkeleton = ({ index = 0, showSampleArticles = true }: FeedCardSkeletonProps) => {
  // Gold shimmer animation base classes
  const shimmerClasses = 'relative overflow-hidden';
  const shimmerBg = 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-lol-card before:via-lol-gold/20 before:to-lol-card before:bg-[length:200%_100%] before:animate-[shimmer_2s_ease-in-out_infinite]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-lol-card border border-lol-gold/20 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-lol-gold/10 space-y-4">
        {/* Title and metadata */}
        <div className="space-y-3">
          {/* Title */}
          <div className={`${shimmerClasses} w-48 h-7 rounded-lg bg-lol-card ${shimmerBg}`} />

          {/* Metadata tags */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`${shimmerClasses} w-16 h-7 rounded-full bg-lol-card ${shimmerBg}`} />
            <div className={`${shimmerClasses} w-20 h-7 rounded-full bg-lol-card ${shimmerBg}`} />
            <div className={`${shimmerClasses} w-14 h-7 rounded-full bg-lol-card ${shimmerBg}`} />
          </div>
        </div>

        {/* URL display with copy */}
        <div className="flex items-center gap-2">
          <div className={`${shimmerClasses} flex-1 h-10 rounded-lg bg-lol-card ${shimmerBg}`} />
          <div className={`${shimmerClasses} w-20 h-10 rounded-lg bg-lol-card ${shimmerBg}`} />
        </div>
      </div>

      {/* Sample articles */}
      {showSampleArticles && (
        <div className="p-5 border-b border-lol-gold/10 space-y-3">
          {/* Section title */}
          <div className={`${shimmerClasses} w-28 h-4 rounded bg-lol-card ${shimmerBg}`} />

          {/* Article items */}
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg">
                <div className={`${shimmerClasses} w-6 h-5 rounded bg-lol-card ${shimmerBg} flex-shrink-0`} />
                <div className={`${shimmerClasses} flex-1 h-5 rounded bg-lol-card ${shimmerBg}`} />
                <div className={`${shimmerClasses} w-4 h-4 rounded bg-lol-card ${shimmerBg} flex-shrink-0`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="p-5 space-y-4">
        {/* Primary actions */}
        <div className="flex items-center gap-3">
          <div className={`${shimmerClasses} flex-1 h-11 rounded-lg bg-lol-card ${shimmerBg}`} />
          <div className={`${shimmerClasses} w-28 h-11 rounded-lg bg-lol-card ${shimmerBg}`} />
        </div>

        {/* Subscribe section */}
        <div className="space-y-3">
          <div className={`${shimmerClasses} w-32 h-4 rounded bg-lol-card ${shimmerBg}`} />

          {/* Reader buttons grid */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${shimmerClasses} h-10 rounded-lg bg-lol-card ${shimmerBg}`} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeedCardSkeleton;
