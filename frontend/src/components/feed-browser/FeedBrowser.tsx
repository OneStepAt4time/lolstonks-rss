import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { CategoryMatrix } from './CategoryMatrix';
import { LocaleGrid } from './LocaleGrid';
import { AllFeedsList } from './AllFeedsList';
import { FeedPreview } from './FeedPreview';
import { SourceGalaxy } from './SourceGalaxy';
import { InteractiveGlobe } from './InteractiveGlobe';
import { FeedBrowserSkeleton } from './FeedBrowserSkeleton';

type ViewMode = 'globe' | 'locales' | 'categories' | 'sources' | 'all';

interface PreviewState {
  url: string;
  name: string;
  type: string;
  locale?: string;
  category?: string;
  source?: string;
}

export const FeedBrowser = () => {
  const { feedsLoading } = useStore();
  const [activeView, setActiveView] = useState<ViewMode>('categories');
  const [previewFeed, setPreviewFeed] = useState<PreviewState | null>(null);
  const [hoveredTab, setHoveredTab] = useState<ViewMode | null>(null);

  // Show skeleton on initial load
  if (feedsLoading) {
    return <FeedBrowserSkeleton />;
  }

  const tabs = [
    {
      id: 'globe' as ViewMode,
      label: 'Globe',
      description: 'Interactive 3D globe visualization',
      gradient: 'from-lol-blue via-cyan-400 to-lol-blue',
      borderColor: 'border-lol-blue/50',
      glowColor: 'shadow-[0_0_40px_rgba(10,200,185,0.4)]',
      particleColor: 'rgba(10, 200, 185, 0.5)',
    },
    {
      id: 'locales' as ViewMode,
      label: 'Languages',
      description: 'Browse feeds by locale/language',
      gradient: 'from-lol-gold via-yellow-300 to-lol-gold',
      borderColor: 'border-lol-gold/50',
      glowColor: 'shadow-[0_0_40px_rgba(200,155,60,0.4)]',
      particleColor: 'rgba(200, 155, 60, 0.5)',
    },
    {
      id: 'categories' as ViewMode,
      label: 'Categories',
      description: 'Browse feeds by category',
      gradient: 'from-lol-red via-pink-500 to-lol-red',
      borderColor: 'border-lol-red/50',
      glowColor: 'shadow-[0_0_40px_rgba(255,100,100,0.4)]',
      particleColor: 'rgba(255, 100, 100, 0.5)',
    },
    {
      id: 'sources' as ViewMode,
      label: 'Sources',
      description: 'Explore all sources and categories',
      gradient: 'from-purple-500 via-indigo-400 to-purple-500',
      borderColor: 'border-purple-500/50',
      glowColor: 'shadow-[0_0_40px_rgba(168,85,247,0.4)]',
      particleColor: 'rgba(168, 85, 247, 0.5)',
    },
    {
      id: 'all' as ViewMode,
      label: 'All Feeds',
      description: 'Complete alphabetical feed list',
      gradient: 'from-green-400 via-emerald-400 to-green-400',
      borderColor: 'border-green-500/50',
      glowColor: 'shadow-[0_0_40px_rgba(52,211,153,0.4)]',
      particleColor: 'rgba(52, 211, 153, 0.5)',
    },
  ];

  const closePreview = () => {
    setPreviewFeed(null);
  };

  return (
    <div className="space-y-16 pb-16 relative">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-lol-gold/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lol-blue/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-lol-red/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Premium Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center space-y-8 relative"
      >
        {/* Decorative Top Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex justify-center"
        >
          <div className="h-0.5 w-32 bg-gradient-gold rounded-full shadow-gold" />
        </motion.div>

        {/* Main Title with Gradient */}
        <div className="relative">
          <motion.div
            className="absolute -inset-8 bg-gradient-gold/20 blur-3xl rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h1 className="relative font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight">
            <span className="block text-white mb-2">FEED</span>
            <motion.span
              className="block bg-gradient-gold bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            >
              NEXUS
            </motion.span>
          </h1>
        </div>

        {/* Subtitle with Animated Numbers */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-body text-lg md:text-xl text-lol-blue max-w-3xl mx-auto leading-relaxed"
        >
          Explore{' '}
          <motion.span
            className="text-lol-gold font-bold inline-block"
            whileHover={{ scale: 1.1 }}
          >
            2,700+ RSS feeds
          </motion.span>{' '}
          across{' '}
          <motion.span
            className="text-lol-gold font-bold inline-block"
            whileHover={{ scale: 1.1 }}
          >
            20 locales
          </motion.span>
          ,{' '}
          <motion.span
            className="text-lol-gold font-bold inline-block"
            whileHover={{ scale: 1.1 }}
          >
            9 categories
          </motion.span>
          , and{' '}
          <motion.span
            className="text-lol-gold font-bold inline-block"
            whileHover={{ scale: 1.1 }}
          >
            15+ sources
          </motion.span>
        </motion.p>

        {/* Decorative Bottom Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex justify-center gap-4 items-center"
        >
          <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-lol-gold/50" />
          <div className="w-2 h-2 bg-lol-gold rounded-full animate-pulse" />
          <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-lol-gold/50" />
        </motion.div>
      </motion.div>

      {/* Premium Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative"
      >
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-lol-card/60 backdrop-blur-xl rounded-3xl border border-lol-gold/20" />

        <div className="relative flex flex-wrap items-center justify-center gap-4 p-4">
          <AnimatePresence mode="popLayout">
            {tabs.map((tab, index) => {
              const isActive = activeView === tab.id;
              const isHovered = hoveredTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  layout
                  onClick={() => setActiveView(tab.id)}
                  onHoverStart={() => setHoveredTab(tab.id)}
                  onHoverEnd={() => setHoveredTab(null)}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.08,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                  className={`relative group px-6 py-4 rounded-2xl font-display font-bold tracking-wider uppercase text-sm transition-all duration-300 ${
                    isActive
                      ? `${tab.borderColor} ${tab.glowColor} bg-gradient-to-r ${tab.gradient} text-white`
                      : 'bg-lol-dark/50 text-gray-400 border border-lol-gold/20 hover:border-lol-gold/40 hover:text-white'
                  }`}
                >
                  {/* Shimmer Effect for Active Tab */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  )}

                  {/* Tab Content */}
                  <span className="relative z-10">
                    <span className="text-sm sm:text-base">{tab.label}</span>
                  </span>

                  {/* Active Glow Ring */}
                  {isActive && (
                    <motion.div
                      className={`absolute inset-0 rounded-2xl border-2 ${tab.borderColor} opacity-50`}
                      animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Particle Effect on Hover */}
                  {isHovered && !isActive && (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 rounded-full"
                          style={{ backgroundColor: tab.particleColor }}
                          initial={{
                            x: '50%',
                            y: '100%',
                            opacity: 1,
                          }}
                          animate={{
                            y: '-20%',
                            opacity: 0,
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: 'easeOut',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Active Tab Description with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`desc-${activeView}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-lol-card/80 backdrop-blur border border-lol-gold/20">
            <div className="w-2 h-2 bg-lol-gold rounded-full animate-pulse" />
            <p className="text-sm font-display font-semibold tracking-wide uppercase text-lol-gold">
              {tabs.find((t) => t.id === activeView)?.description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content Area with Premium Transitions */}
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {activeView === 'globe' && (
            <motion.div
              key="globe"
              initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.95, rotateY: 10 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="perspective-1000"
            >
              <InteractiveGlobe
                onLocaleFilter={(localeCode) => {
                  console.log('Locale filter requested:', localeCode);
                }}
              />
            </motion.div>
          )}

          {activeView === 'locales' && (
            <motion.div
              key="locales"
              initial={{ opacity: 0, x: 50, rotateX: 5 }}
              animate={{ opacity: 1, x: 0, rotateX: 0 }}
              exit={{ opacity: 0, x: -50, rotateX: -5 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="perspective-1000"
            >
              <LocaleGrid />
            </motion.div>
          )}

          {activeView === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: 50, rotateX: 5 }}
              animate={{ opacity: 1, x: 0, rotateX: 0 }}
              exit={{ opacity: 0, x: -50, rotateX: -5 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="perspective-1000"
            >
              <CategoryMatrix />
            </motion.div>
          )}

          {activeView === 'all' && (
            <motion.div
              key="all"
              initial={{ opacity: 0, x: 50, rotateX: 5 }}
              animate={{ opacity: 1, x: 0, rotateX: 0 }}
              exit={{ opacity: 0, x: -50, rotateX: -5 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="perspective-1000"
            >
              <AllFeedsList />
            </motion.div>
          )}

          {activeView === 'sources' && (
            <motion.div
              key="sources"
              initial={{ opacity: 0, x: 50, rotateX: 5 }}
              animate={{ opacity: 1, x: 0, rotateX: 0 }}
              exit={{ opacity: 0, x: -50, rotateX: -5 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="perspective-1000"
            >
              <SourceGalaxy
                onSourceClick={(sourceId) => {
                  console.log('Source clicked:', sourceId);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Preview Modal */}
      {previewFeed && (
        <FeedPreview
          feedUrl={previewFeed.url}
          feedName={previewFeed.name}
          feedType={previewFeed.type}
          locale={previewFeed.locale}
          category={previewFeed.category}
          source={previewFeed.source}
          onClose={closePreview}
        />
      )}

      {/* Premium Stats Section with Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="relative"
      >
        {/* Background Glow Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-lol-gold/10 via-lol-blue/10 to-lol-red/10 rounded-3xl blur-3xl" />

        <div className="relative bg-lol-card/60 backdrop-blur-2xl border border-lol-gold/30 rounded-3xl p-8 md:p-12 overflow-hidden">
          {/* Animated Border Gradient */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-30"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{
              background: 'linear-gradient(90deg, #C89B3C, #0AC8B9, #FF0A66, #C89B3C)',
              backgroundSize: '300% 100%',
            }}
          />

          {/* Decorative Corner Elements */}
          <div className="absolute top-0 left-0 w-24 h-24">
            <div className="absolute top-4 left-4 w-16 h-0.5 bg-gradient-gold shadow-gold" />
            <div className="absolute top-4 left-4 w-0.5 h-16 bg-gradient-gold shadow-gold" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24">
            <div className="absolute top-4 right-4 w-16 h-0.5 bg-gradient-gold shadow-gold" />
            <div className="absolute top-4 right-4 w-0.5 h-16 bg-gradient-gold shadow-gold" />
          </div>
          <div className="absolute bottom-0 left-0 w-24 h-24">
            <div className="absolute bottom-4 left-4 w-16 h-0.5 bg-gradient-gold shadow-gold" />
            <div className="absolute bottom-4 left-4 w-0.5 h-16 bg-gradient-gold shadow-gold" />
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-24">
            <div className="absolute bottom-4 right-4 w-16 h-0.5 bg-gradient-gold shadow-gold" />
            <div className="absolute bottom-4 right-4 w-0.5 h-16 bg-gradient-gold shadow-gold" />
          </div>

          <div className="relative">
            {/* Section Title */}
            <motion.h3
              className="font-display text-3xl md:text-4xl font-bold text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <span className="bg-gradient-gold bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Feed Universe Statistics
              </span>
            </motion.h3>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  value: '20',
                  label: 'Supported Locales',
                  color: 'text-lol-blue',
                  gradient: 'from-lol-blue to-cyan-400',
                },
                {
                  value: '9',
                  label: 'Categories',
                  color: 'text-lol-gold',
                  gradient: 'from-lol-gold to-yellow-400',
                },
                {
                  value: '15+',
                  label: 'Sources',
                  color: 'text-lol-red',
                  gradient: 'from-lol-red to-pink-500',
                },
                {
                  value: '2,700+',
                  label: 'Total Feeds',
                  color: 'text-green-400',
                  gradient: 'from-green-400 to-emerald-500',
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.08, y: -8 }}
                  className="relative group"
                >
                  {/* Card Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-lol-dark/80 to-lol-card/80 rounded-2xl border border-lol-gold/20 transition-all duration-300 group-hover:border-lol-gold/50" />

                  {/* Hover Glow */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 rounded-2xl blur-xl transition-opacity duration-500`}
                    whileHover={{ opacity: 0.2 }}
                  />

                  {/* Card Content */}
                  <div className="relative p-6 text-center">
                    {/* Value */}
                    <motion.div
                      className={`font-display text-5xl md:text-6xl font-bold ${stat.color} mb-2 bg-clip-text bg-gradient-to-b ${stat.gradient}`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {stat.value}
                    </motion.div>

                    {/* Label */}
                    <div className="text-xs font-display font-semibold tracking-widest uppercase text-gray-400">
                      {stat.label}
                    </div>

                    {/* Corner Accent */}
                    <div className="absolute top-3 right-3 w-8 h-8 opacity-30 group-hover:opacity-100 transition-opacity">
                      <div className={`absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l ${stat.gradient}`} />
                      <div className={`absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b ${stat.gradient}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
