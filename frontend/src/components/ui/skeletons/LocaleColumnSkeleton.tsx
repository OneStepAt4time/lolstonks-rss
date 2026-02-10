import { motion } from 'framer-motion';

interface LocaleColumnSkeletonProps {
  localeCount?: number;
  index?: number;
}

/**
 * LocaleColumnSkeleton - Loading skeleton for locale grid items
 *
 * Features:
 * - Gold shimmer animation (lol-gold color)
 * - Matches actual LocaleGrid item dimensions
 * - Smooth pulse effect with staggered animation delays
 */
export const LocaleColumnSkeleton = ({ localeCount = 5, index = 0 }: LocaleColumnSkeletonProps) => {
  // Gold shimmer animation base classes
  const shimmerClasses = 'relative overflow-hidden';
  const shimmerBg = 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-lol-card before:via-lol-gold/20 before:to-lol-card before:bg-[length:200%_100%] before:animate-[shimmer_2s_ease-in-out_infinite]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      {Array.from({ length: localeCount }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
          className="relative group"
        >
          <div className="card p-6 text-center h-full">
            {/* Name Skeleton */}
            <div className={`${shimmerClasses} w-24 h-5 rounded mx-auto mb-2 bg-lol-card ${shimmerBg}`} />

            {/* Code Skeleton */}
            <div className={`${shimmerClasses} w-16 h-4 rounded mx-auto mb-3 bg-lol-card ${shimmerBg}`} />

            {/* Article Count Badge Skeleton */}
            <div className={`${shimmerClasses} inline-flex items-center px-3 py-1 rounded-full bg-lol-card ${shimmerBg} w-24 h-7`} />

            {/* Hover Overlay Skeleton */}
            <div className="absolute inset-0 bg-gradient-to-t from-lol-gold/20 via-transparent to-transparent rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* RSS Badge Skeleton (shown on hover) */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className={`${shimmerClasses} px-2 py-1 rounded bg-lol-card ${shimmerBg} w-10 h-6`} />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * LocaleRegionSectionSkeleton - Loading skeleton for a region section in LocaleGrid
 *
 * Features:
 * - Gold shimmer animation (lol-gold color)
 * - Region heading + locale grid
 * - Smooth pulse effect
 */
interface LocaleRegionSectionSkeletonProps {
  localeCount?: number;
  index?: number;
}

export const LocaleRegionSectionSkeleton = ({
  localeCount = 5,
  index = 0,
}: LocaleRegionSectionSkeletonProps) => {
  const shimmerClasses = 'relative overflow-hidden';
  const shimmerBg = 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-lol-card before:via-lol-gold/20 before:to-lol-card before:bg-[length:200%_100%] before:animate-[shimmer_2s_ease-in-out_infinite]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="space-y-4"
    >
      {/* Region Title */}
      <div className={`${shimmerClasses} w-32 h-8 rounded-lg bg-lol-card ${shimmerBg}`} />

      {/* Locale Grid */}
      <LocaleColumnSkeleton localeCount={localeCount} />
    </motion.div>
  );
};

/**
 * LocaleGridSkeleton - Full loading skeleton for LocaleGrid component
 *
 * Features:
 * - Gold shimmer animation (lol-gold color)
 * - Header with stats + all regions
 * - Smooth pulse effect
 */
interface LocaleGridSkeletonProps {
  regionCount?: number;
  localesPerRegion?: number;
}

export const LocaleGridSkeleton = ({
  regionCount = 4,
  localesPerRegion = 5,
}: LocaleGridSkeletonProps) => {
  const shimmerClasses = 'relative overflow-hidden';
  const shimmerBg = 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-lol-card before:via-lol-gold/20 before:to-lol-card before:bg-[length:200%_100%] before:animate-[shimmer_2s_ease-in-out_infinite]';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className={`${shimmerClasses} w-64 h-10 rounded-lg mx-auto bg-lol-card ${shimmerBg}`} />
        <div className={`${shimmerClasses} w-80 h-6 rounded-lg mx-auto bg-lol-card ${shimmerBg}`} />
      </div>

      {/* Region Sections */}
      {Array.from({ length: regionCount }).map((_, i) => (
        <LocaleRegionSectionSkeleton
          key={i}
          index={i}
          localeCount={localesPerRegion}
        />
      ))}
    </div>
  );
};

export default LocaleColumnSkeleton;
