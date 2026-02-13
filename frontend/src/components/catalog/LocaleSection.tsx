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
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
      >
        <span className="text-lg flex-shrink-0" aria-hidden="true">
          {localeGroup.flag}
        </span>
        <span className="font-medium text-white flex-1">
          {localeGroup.localeName}
        </span>
        <span className="text-xs text-gray-500 mr-2 font-mono hidden sm:block">
          /feed/{localeGroup.locale}.xml
        </span>
        <ChevronRight
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </button>
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
