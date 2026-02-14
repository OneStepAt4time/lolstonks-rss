import { GAMES, GAME_CATEGORIES, type GameType } from '../../lib/feeds-catalog';
import type { GameFilter } from '../../types/feed';

interface GameTabsProps {
  activeGame: GameFilter;
  onChange: (game: GameFilter) => void;
}

const GAME_TAB_COLORS: Record<string, string> = {
  all: 'bg-lol-gold text-black',
  lol: 'bg-lol-gold text-black',
  tft: 'bg-hextech text-black',
  wildrift: 'bg-[#5B8DEF] text-black',
};

const GAME_TABS: { key: GameFilter; label: string; icon: string; categoryCount?: number }[] = [
  { key: 'all', label: 'All Games', icon: '🌐' },
  ...Object.entries(GAMES).map(([key, { name, icon }]) => ({
    key: key as GameType,
    label: name,
    icon,
    categoryCount: GAME_CATEGORIES[key as GameType].length,
  })),
];

export const GameTabs = ({ activeGame, onChange }: GameTabsProps) => {
  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-premium pb-1"
      role="tablist"
      aria-label="Filter by game"
    >
      {GAME_TABS.map(({ key, label, icon }) => (
        <button
          key={key}
          role="tab"
          aria-selected={activeGame === key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeGame === key
              ? GAME_TAB_COLORS[key]
              : 'bg-lol-dark-secondary text-gray-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <span aria-hidden="true">{icon}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};
