import { motion } from 'framer-motion';
import { useStore } from '../../store';

export const CategoryMatrix = () => {
  const { feedsResponse } = useStore();

  const categories = [
    {
      id: 'official_riot',
      name: 'Official Riot',
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      description: 'News directly from Riot Games',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
      description: 'Statistics & meta analysis',
    },
    {
      id: 'esports',
      name: 'Esports',
      color: 'from-red-500/20 to-red-600/20',
      borderColor: 'border-red-500/30',
      description: 'Competitive gaming news',
    },
    {
      id: 'community_hub',
      name: 'Community',
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30',
      description: 'Community-driven content',
    },
    {
      id: 'regional',
      name: 'Regional',
      color: 'from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/30',
      description: 'Regional Riot sites',
    },
    {
      id: 'social',
      name: 'Social',
      color: 'from-pink-500/20 to-pink-600/20',
      borderColor: 'border-pink-500/30',
      description: 'Social media aggregators',
    },
    {
      id: 'aggregator',
      name: 'Aggregator',
      color: 'from-indigo-500/20 to-indigo-600/20',
      borderColor: 'border-indigo-500/30',
      description: 'News aggregators',
    },
    {
      id: 'pbe',
      name: 'PBE',
      color: 'from-orange-500/20 to-orange-600/20',
      borderColor: 'border-orange-500/30',
      description: 'Public Beta Environment',
    },
    {
      id: 'tft',
      name: 'TFT',
      color: 'from-cyan-500/20 to-cyan-600/20',
      borderColor: 'border-cyan-500/30',
      description: 'Teamfight Tactics',
    },
  ];

  // Calculate article counts per category
  const getCategoryCount = (categoryId: string) => {
    if (!feedsResponse?.feeds) return 0;
    return feedsResponse.feeds.filter(
      f => f.type === 'category_locale' && f.category === categoryId
    ).length;
  };

  const getLocaleCount = (_categoryId: string) => {
    if (!feedsResponse?.supported_locales) return 0;
    return feedsResponse.supported_locales.length;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-lol-gold mb-2">
          Browse by Category
        </h2>
        <p className="text-lol-blue">
          Explore feeds organized by content type
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => {
          const feedCount = getCategoryCount(category.id);
          const localeCount = getLocaleCount(category.id);

          return (
            <motion.a
              key={category.id}
              href={`#category-${category.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className={`relative block p-6 rounded-2xl bg-gradient-to-br ${category.color}
                         border ${category.borderColor} backdrop-blur
                         hover:shadow-[0_0_30px_rgba(200,155,60,0.2)]
                         transition-all duration-300 cursor-pointer group`}
            >
              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-lol-gold transition-colors">
                {category.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-300 mb-4">
                {category.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-lol-gold">Feeds:</span>
                  <span className="text-white font-medium">{feedCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lol-blue">Locales:</span>
                  <span className="text-white font-medium">{localeCount}</span>
                </div>
              </div>

              {/* Explore Button */}
              <div className="mt-4 flex items-center text-sm text-lol-gold group-hover:text-lol-gold-light">
                <span>Explore feeds</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0
                              group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-2xl`} />
            </motion.a>
          );
        })}
      </div>
    </div>
  );
};
