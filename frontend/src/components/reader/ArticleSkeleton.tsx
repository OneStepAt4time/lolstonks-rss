interface ArticleSkeletonProps {
  featured?: boolean;
}

export const ArticleSkeleton = ({ featured }: ArticleSkeletonProps) => {
  if (featured) {
    return (
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden animate-pulse">
        <div className="aspect-[21/9] bg-lol-dark-secondary" />
        <div className="p-6 space-y-3">
          <div className="h-4 w-24 rounded bg-lol-dark-elevated" />
          <div className="h-7 w-3/4 rounded bg-lol-dark-elevated" />
          <div className="h-4 w-1/2 rounded bg-lol-dark-elevated" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-lol-dark-secondary" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded bg-lol-dark-elevated" />
          <div className="h-5 w-16 rounded bg-lol-dark-elevated" />
        </div>
        <div className="h-5 w-full rounded bg-lol-dark-elevated" />
        <div className="h-5 w-4/5 rounded bg-lol-dark-elevated" />
        <div className="h-4 w-2/5 rounded bg-lol-dark-elevated" />
      </div>
    </div>
  );
};
