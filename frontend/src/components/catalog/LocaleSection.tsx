import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { FeedRow } from './FeedRow';
import { CopyButton } from '../ui/CopyButton';
import {
  getFeedCatalog,
  GAMES,
  type LocaleGroup,
  type GameType,
  type FeedItem,
} from '../../lib/feeds-catalog';
import type { GameFilter } from '../../types/feed';

interface LocaleSectionProps {
  localeGroup: LocaleGroup;
  isExpanded: boolean;
  onToggle: () => void;
  activeGame: GameFilter;
}

const CATEGORY_COLORS: Record<string, string> = {
  'game-updates': 'bg-lol-gold/15 text-lol-gold border-lol-gold/30',
  'dev': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  'esports': 'bg-hextech/15 text-hextech border-hextech/30',
  'community': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'media': 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'lore': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'riot-games': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  'announcements': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  'merch': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

function formatCategoryName(category: string): string {
  return category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const catalog = getFeedCatalog();

export const LocaleSection = ({ localeGroup, isExpanded, onToggle, activeGame }: LocaleSectionProps) => {
  const readLink = activeGame !== 'all' && activeGame !== 'lol'
    ? `/read/${activeGame}/${localeGroup.locale}`
    : `/read/${localeGroup.locale}`;

  const expandedFeeds = useMemo(() => {
    if (activeGame === 'all') {
      // Show one feed per game
      const gameTypes = Object.keys(GAMES) as GameType[];
      return gameTypes
        .map(g => catalog.gameFeeds.find(f => f.game === g && f.locale === localeGroup.locale))
        .filter((f): f is FeedItem => f !== undefined);
    }
    // Specific game: show locale feed + category feeds
    const gameFeed = activeGame === 'lol'
      ? localeGroup.feed
      : catalog.gameFeeds.find(f => f.game === activeGame && f.locale === localeGroup.locale);
    const categoryFeeds = catalog.categoryFeeds.filter(
      f => f.game === activeGame && f.locale === localeGroup.locale
    );
    return { gameFeed, categoryFeeds };
  }, [activeGame, localeGroup]);

  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="flex items-center">
        <Link
          to={readLink}
          className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0 hover:bg-white/[0.03] transition-colors"
        >
          <span className="text-lg flex-shrink-0" aria-hidden="true">
            {localeGroup.flag}
          </span>
          <span className="font-medium text-white truncate">
            {localeGroup.localeName}
          </span>
          <span className="text-xs text-lol-gold/60 hidden sm:inline">Read articles</span>
        </Link>
        <button
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Hide' : 'Show'} feed URLs for ${localeGroup.localeName}`}
          className="px-3 py-3 text-gray-500 hover:text-white hover:bg-white/[0.03] transition-colors flex-shrink-0"
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </button>
      </div>
      <div
        className="grid transition-[grid-template-rows] duration-200"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/[0.04] px-2 py-2 space-y-1">
            {activeGame === 'all' ? (
              // All Games: show one FeedRow per game
              (expandedFeeds as FeedItem[]).map((feed) => (
                <FeedRow key={feed.id} feed={feed} />
              ))
            ) : (
              // Specific game: show game feed + categories
              <>
                {(expandedFeeds as { gameFeed?: FeedItem; categoryFeeds: FeedItem[] }).gameFeed && (
                  <FeedRow feed={(expandedFeeds as { gameFeed: FeedItem; categoryFeeds: FeedItem[] }).gameFeed} />
                )}
                {(expandedFeeds as { gameFeed?: FeedItem; categoryFeeds: FeedItem[] }).categoryFeeds.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold px-4 py-1.5">
                      Categories
                    </p>
                    {(expandedFeeds as { gameFeed?: FeedItem; categoryFeeds: FeedItem[] }).categoryFeeds.map((feed) => (
                      <div
                        key={feed.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                      >
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded border ${
                            CATEGORY_COLORS[feed.category ?? ''] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                          }`}
                        >
                          {formatCategoryName(feed.category ?? '')}
                        </span>
                        <span className="hidden md:block font-mono text-xs text-gray-500 truncate">
                          {feed.url.replace('https://onestepat4time.github.io/lolstonks-rss', '')}
                        </span>
                        <div className="ml-auto flex-shrink-0">
                          <CopyButton url={feed.url} variant="ghost" size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
