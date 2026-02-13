import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { FeedRow } from './FeedRow';
import type { LocaleGroup } from '../../lib/feeds-catalog';

interface LocaleSectionProps {
  localeGroup: LocaleGroup;
  isExpanded: boolean;
  onToggle: () => void;
}

export const LocaleSection = ({ localeGroup, isExpanded, onToggle }: LocaleSectionProps) => {
  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="flex items-center">
        <Link
          to={`/read/${localeGroup.locale}`}
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
          aria-label={`${isExpanded ? 'Hide' : 'Show'} feed URL for ${localeGroup.localeName}`}
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
          <div className="border-t border-white/[0.04] px-2 py-2">
            <FeedRow feed={localeGroup.feed} />
          </div>
        </div>
      </div>
    </div>
  );
};
