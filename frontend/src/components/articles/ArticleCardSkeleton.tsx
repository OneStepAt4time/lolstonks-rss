import { motion } from 'framer-motion';
import { Skeleton } from '../ui/Skeleton';

interface ArticleCardSkeletonProps {
  variant?: 'default' | 'compact';
  index?: number;
}

export const ArticleCardSkeleton = ({ variant = 'default', index = 0 }: ArticleCardSkeletonProps) => {
  if (variant === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="card p-4 flex gap-4"
      >
        {/* Image Skeleton */}
        <Skeleton width={128} height={80} className="rounded-lg flex-shrink-0" />

        {/* Content Skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton width={100} height={16} />
          <Skeleton width="100%" height={16} />
          <Skeleton width="80%" height={16} />
          <Skeleton width={60} height={12} className="mt-2" />
        </div>

        {/* Actions Skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton width={32} height={32} variant="circle" />
          <Skeleton width={32} height={32} variant="circle" />
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card flex flex-col h-full"
    >
      {/* Image Skeleton */}
      <div className="relative aspect-video bg-lol-card overflow-hidden">
        <Skeleton width="100%" height="100%" className="rounded-none" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col space-y-3">
        {/* Date Skeleton */}
        <Skeleton width={80} height={14} />

        {/* Title Skeleton */}
        <div className="space-y-2">
          <Skeleton width="100%" height={24} />
          <Skeleton width="90%" height={24} />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2 flex-1">
          <Skeleton width="100%" height={16} />
          <Skeleton width="100%" height={16} />
          <Skeleton width="70%" height={16} />
        </div>

        {/* Categories Skeleton */}
        <div className="flex gap-2">
          <Skeleton width={60} height={24} variant="rectangle" />
          <Skeleton width={50} height={24} variant="rectangle" />
        </div>

        {/* Actions Skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-lol-gold/10">
          <div className="flex gap-2">
            <Skeleton width={40} height={40} variant="circle" />
            <Skeleton width={40} height={40} variant="circle" />
          </div>
          <Skeleton width={100} height={36} variant="rectangle" />
        </div>
      </div>
    </motion.article>
  );
};
