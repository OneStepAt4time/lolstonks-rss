import { motion } from 'framer-motion';
import { Skeleton } from '../ui/Skeleton';

export const FeedBrowserSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <Skeleton width={400} height={48} className="mx-auto" />
        <Skeleton width={600} height={24} className="mx-auto" />
      </motion.div>

      {/* Tabs Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width={140} height={52} variant="rectangle" />
        ))}
      </motion.div>

      {/* Content Grid Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </motion.div>

      {/* Stats Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <Skeleton width={250} height={28} className="mx-auto mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-lol-dark rounded-lg">
              <Skeleton width={60} height={36} className="mx-auto mb-2" />
              <Skeleton width={100} height={16} className="mx-auto" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const SkeletonCard = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="card p-6 space-y-4"
  >
    <Skeleton width={80} height={32} variant="circle" className="mx-auto" />
    <Skeleton width="100%" height={28} />
    <Skeleton width="80%" height={20} />
    <div className="pt-4 border-t border-lol-gold/10">
      <Skeleton width={120} height={36} variant="rectangle" className="mx-auto" />
    </div>
  </motion.div>
);
