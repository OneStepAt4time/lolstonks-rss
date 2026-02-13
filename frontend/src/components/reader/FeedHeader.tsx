import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CopyButton } from '../ui/CopyButton';
import { LOCALE_NAMES } from '../../lib/feeds-catalog';
import { formatRelativeDate } from '../../lib/format-date';
import type { FeedMeta } from '../../types/articles';

interface FeedHeaderProps {
  locale: string;
  meta: FeedMeta | null;
}

const BASE_URL = 'https://onestepat4time.github.io/lolstonks-rss';

export const FeedHeader = ({ locale, meta }: FeedHeaderProps) => {
  const info = locale === 'main' ? null : LOCALE_NAMES[locale];
  const flag = info?.flag ?? '🌐';
  const name = info?.name ?? 'All Locales';
  const feedUrl = locale === 'main' ? `${BASE_URL}/feed.xml` : `${BASE_URL}/feed/${locale}.xml`;

  return (
    <div className="space-y-4">
      <Link
        to="/"
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
