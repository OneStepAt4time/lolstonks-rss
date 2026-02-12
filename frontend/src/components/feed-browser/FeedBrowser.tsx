import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, FolderOpen, List } from 'lucide-react';
import { useStore } from '../../store';
import { CategoryMatrix } from './CategoryMatrix';
import { LocaleGrid } from './LocaleGrid';
import { AllFeedsList } from './AllFeedsList';
import { FeedBrowserSkeleton } from './FeedBrowserSkeleton';

type ViewMode = 'locales' | 'categories' | 'all';

export const FeedBrowser = () => {
  const { feedsLoading } = useStore();
  const [activeView, setActiveView] = useState<ViewMode>('categories');

  if (feedsLoading) {
    return <FeedBrowserSkeleton />;
  }

  const tabs: { id: ViewMode; label: string; icon: typeof Globe }[] = [
    { id: 'locales', label: 'Languages', icon: Globe },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'all', label: 'All Feeds', icon: List },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white">
          Feed Browser
        </h1>
        <p className="font-body text-lg text-gray-400 max-w-2xl mx-auto">
          Explore RSS feeds across{' '}
          <span className="text-lol-gold font-semibold">20 locales</span>,{' '}
          <span className="text-lol-gold font-semibold">9 categories</span>, and{' '}
          <span className="text-lol-gold font-semibold">5 sources</span>
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex items-center justify-center gap-2"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-display font-semibold text-sm uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-lol-gold text-black'
                  : 'bg-[#111827] text-gray-400 border border-white/[0.08] hover:border-lol-gold/30 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeView === 'locales' && (
          <motion.div
            key="locales"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <LocaleGrid />
          </motion.div>
        )}

        {activeView === 'categories' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <CategoryMatrix />
          </motion.div>
        )}

        {activeView === 'all' && (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <AllFeedsList />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
