interface CategoryTabsProps {
  categories: { name: string; count: number }[];
  active: string | null;
  onChange: (cat: string | null) => void;
}

export const CategoryTabs = ({ categories, active, onChange }: CategoryTabsProps) => {
  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-premium pb-1"
      role="tablist"
      aria-label="Filter by category"
    >
      <button
        role="tab"
        aria-selected={active === null}
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
          active === null
            ? 'bg-lol-gold text-black'
            : 'bg-lol-dark-secondary text-gray-400 hover:text-white hover:bg-white/[0.06]'
        }`}
      >
        All
        <span className="ml-1.5 text-xs opacity-70">{totalCount}</span>
      </button>
      {categories.map(({ name, count }) => (
        <button
          key={name}
          role="tab"
          aria-selected={active === name}
          onClick={() => onChange(name)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            active === name
              ? 'bg-lol-gold text-black'
              : 'bg-lol-dark-secondary text-gray-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          {name}
          <span className="ml-1.5 text-xs opacity-70">{count}</span>
        </button>
      ))}
    </div>
  );
};
