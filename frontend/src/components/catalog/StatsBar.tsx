interface StatsBarProps {
  totalFeeds: number;
  totalLocales: number;
  visibleCount: number;
  hasFilters: boolean;
}

export const StatsBar = ({ totalFeeds, totalLocales, visibleCount, hasFilters }: StatsBarProps) => {
  return (
    <p className="text-sm text-gray-400">
      {hasFilters
        ? `Showing ${visibleCount} of ${totalFeeds} feeds`
        : `${totalFeeds} feeds \u00b7 ${totalLocales} languages`}
    </p>
  );
};
