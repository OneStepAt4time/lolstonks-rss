import type { Region } from '../../lib/feeds-catalog';

interface RegionTabsProps {
  activeRegion: Region;
  onChange: (region: Region) => void;
}

const REGIONS: { key: Region; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'americas', label: 'Americas' },
  { key: 'europe', label: 'Europe' },
  { key: 'asia', label: 'Asia' },
  { key: 'mena', label: 'MENA' },
];

export const RegionTabs = ({ activeRegion, onChange }: RegionTabsProps) => {
  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-premium pb-1"
      role="tablist"
      aria-label="Filter by region"
    >
      {REGIONS.map(({ key, label }) => (
        <button
          key={key}
          role="tab"
          aria-selected={activeRegion === key}
          onClick={() => onChange(key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeRegion === key
              ? 'bg-lol-gold text-black'
              : 'bg-lol-dark-secondary text-gray-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
