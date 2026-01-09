import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';

export const ArticleFilters = () => {
  const { filter, setFilter, clearFilters, feedsResponse } = useStore();
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filter.locale || filter.category || filter.source || filter.search;

  const categories = feedsResponse?.categories || [];
  const sources = feedsResponse?.sources || [];

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-lol-card border border-lol-gold/20 rounded-lg
                     hover:border-lol-gold/50 transition-all"
        >
          <svg className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs bg-lol-gold text-black rounded-full">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="text-sm text-lol-blue hover:text-lol-gold transition-colors"
          >
            Clear all
          </motion.button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-lol-card border border-lol-gold/20 rounded-lg space-y-4">
              {/* Locale Filter */}
              <FilterSection
                title="Locale"
                options={feedsResponse?.supported_locales || []}
                selected={filter.locale}
                onSelect={(locale) => setFilter({ locale: locale || undefined })}
                formatLabel={(locale) => getLocaleLabel(locale)}
              />

              {/* Category Filter */}
              <FilterSection
                title="Category"
                options={categories}
                selected={filter.category}
                onSelect={(category) => setFilter({ category: category || undefined })}
                formatLabel={(cat) => formatCategory(cat)}
              />

              {/* Source Filter */}
              <FilterSection
                title="Source"
                options={sources.slice(0, 10)} // Show first 10 for now
                selected={filter.source}
                onSelect={(source) => setFilter({ source: source || undefined })}
                formatLabel={(src) => formatSource(src)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface FilterSectionProps {
  title: string;
  options: string[];
  selected?: string;
  onSelect: (value: string) => void;
  formatLabel: (value: string) => string;
}

const FilterSection = ({ title, options, selected, onSelect, formatLabel }: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-medium text-lol-blue">{title}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-2"
          >
            <div className="flex flex-wrap gap-2">
              {/* All Option */}
              <FilterButton
                label="All"
                selected={!selected}
                onClick={() => onSelect('')}
              />
              {/* Options */}
              {options.map((option) => (
                <FilterButton
                  key={option}
                  label={formatLabel(option)}
                  selected={selected === option}
                  onClick={() => onSelect(option)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterButton = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-3 py-1 text-sm rounded-lg transition-all ${
      selected
        ? 'bg-lol-gold text-black font-medium'
        : 'bg-lol-hover text-gray-300 hover:bg-lol-gold/20'
    }`}
  >
    {label}
  </motion.button>
);

// Helper functions
const getLocaleLabel = (locale: string): string => {
  const labels: Record<string, string> = {
    'en-us': '🇺🇸 EN-US',
    'en-gb': '🇬🇧 EN-GB',
    'es-es': '🇪🇸 ES-ES',
    'es-mx': '🇲🇽 ES-MX',
    'fr-fr': '🇫🇷 FR',
    'de-de': '🇩🇪 DE',
    'it-it': '🇮🇹 IT',
    'pt-br': '🇧🇷 PT-BR',
    'ru-ru': '🇷🇺 RU',
    'tr-tr': '🇹🇷 TR',
    'pl-pl': '🇵🇱 PL',
    'ja-jp': '🇯🇵 JA',
    'ko-kr': '🇰🇷 KO',
    'zh-cn': '🇨🇳 ZH-CN',
    'zh-tw': '🇹🇼 ZH-TW',
    'ar-ae': '🇸🇦 AR',
    'vi-vn': '🇻🇳 VI',
    'th-th': '🇹🇭 TH',
    'id-id': '🇮🇩 ID',
    'ph-ph': '🇵🇭 PH',
  };
  return labels[locale] || locale.toUpperCase();
};

const formatCategory = (category: string): string => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatSource = (source: string): string => {
  return source
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
