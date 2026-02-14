import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CopyButton } from '../ui/CopyButton';
import { LOCALE_NAMES, GAMES } from '../../lib/feeds-catalog';
import { formatRelativeDate } from '../../lib/format-date';
import type { FeedMeta } from '../../types/articles';
import type { GameType } from '../../types/feed';

interface FeedHeaderProps {
  locale: string;
  game?: GameType;
  meta: FeedMeta | null;
}

const BASE_URL = 'https://onestepat4time.github.io/lolstonks-rss';

export const FeedHeader = ({ locale, game, meta }: FeedHeaderProps) => {
  const info = locale === 'main' ? null : LOCALE_NAMES[locale];
  const flag = info?.flag ?? '🌐';
  const localeName = info?.name ?? 'All Locales';
  const gameName = game ? GAMES[game].name : null;
  const name = gameName ? `${gameName} - ${localeName}` : localeName;

  const feedUrl = (() => {
    if (locale === 'main') return `${BASE_URL}/feed.xml`;
    if (game && game !== 'lol') return `${BASE_URL}/feed/${game}/${locale}.xml`;
    return `${BASE_URL}/feed/${locale}.xml`;
  })();

  return (
    <div className="space-y-4">
      <Link
        to={game ? `/?game=${game}` : '/'}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All feeds
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0" aria-hidden="true">{flag}</span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {meta && (
                <>
                  <span>{meta.articleCount} articles</span>
                  {meta.lastBuildDate && (
                    <>
                      <span className="text-gray-600">·</span>
                      <span>Updated {formatRelativeDate(meta.lastBuildDate)}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <CopyButton url={feedUrl} variant="primary" size="sm" showLabel label="Copy RSS" copiedLabel="Copied!" />
      </div>
    </div>
  );
};
