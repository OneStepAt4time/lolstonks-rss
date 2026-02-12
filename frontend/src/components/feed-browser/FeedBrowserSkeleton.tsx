import { Skeleton } from '../ui/Skeleton';

export const FeedBrowserSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="text-center space-y-4">
        <Skeleton width={300} height={40} className="mx-auto" />
        <Skeleton width={400} height={20} className="mx-auto" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} width={120} height={44} variant="rectangle" />
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[#111827] rounded-xl border border-white/[0.08] p-6 space-y-3">
            <Skeleton width={40} height={40} variant="circle" />
            <Skeleton width="80%" height={20} />
            <Skeleton width="60%" height={16} />
            <Skeleton width={100} height={14} />
          </div>
        ))}
      </div>
    </div>
  );
};
