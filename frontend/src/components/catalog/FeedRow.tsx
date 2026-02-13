import { ExternalLink } from 'lucide-react';
import { CopyButton } from '../ui/CopyButton';
import type { FeedItem } from '../../lib/feeds-catalog';

interface FeedRowProps {
  feed: FeedItem;
}

export const FeedRow = ({ feed }: FeedRowProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/[0.03] transition-colors group">
      <span className="text-lg flex-shrink-0 w-8 text-center" aria-hidden="true">
        {feed.icon}
      </span>
      <span className="font-medium text-white min-w-0 truncate">
        {feed.displayName}
      </span>
      <span className="hidden md:block font-mono text-xs text-gray-500 truncate ml-auto mr-2">
        {feed.url.replace('https://onestepat4time.github.io/lolstonks-rss', '')}
      </span>
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto md:ml-0">
        <CopyButton url={feed.url} variant="ghost" size="sm" />
        <a
          href={feed.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-gray-500 hover:text-lol-gold transition-colors"
          aria-label={`Open ${feed.displayName} feed`}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
