import { motion } from 'framer-motion';
import {
  Gamepad2, Users, BarChart3, Globe, Trophy,
  MessageCircle, Newspaper, FlaskConical, Puzzle,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStore } from '../../store';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  official_riot: Gamepad2,
  community_hub: Users,
  analytics: BarChart3,
  regional: Globe,
  esports: Trophy,
  social: MessageCircle,
  aggregator: Newspaper,
  pbe: FlaskConical,
  tft: Puzzle,
};

export const CategoryMatrix = () => {
  const { feedsResponse } = useStore();

  const categories = [
    { id: 'official_riot', name: 'Official Riot', description: 'News directly from Riot Games' },
    { id: 'analytics', name: 'Analytics', description: 'Statistics & meta analysis' },
    { id: 'esports', name: 'Esports', description: 'Competitive gaming news' },
    { id: 'community_hub', name: 'Community', description: 'Community-driven content' },
    { id: 'regional', name: 'Regional', description: 'Regional Riot sites' },
    { id: 'social', name: 'Social', description: 'Social media aggregators' },
    { id: 'aggregator', name: 'Aggregator', description: 'News aggregators' },
    { id: 'pbe', name: 'PBE', description: 'Public Beta Environment' },
    { id: 'tft', name: 'TFT', description: 'Teamfight Tactics' },
  ];

  const getCategoryCount = (categoryId: string) => {
    if (!feedsResponse?.feeds) return 0;
    return feedsResponse.feeds.filter(
      f => f.type === 'category_locale' && f.category === categoryId
    ).length;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Browse by Category
        </h2>
        <p className="text-gray-400">
          Explore feeds organized by content type
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => {
          const feedCount = getCategoryCount(category.id);
          const Icon = CATEGORY_ICONS[category.id] || Newspaper;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="p-6 bg-[#111827] rounded-xl border border-white/[0.08] hover:border-lol-gold/30 transition-all group cursor-default"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-lol-gold/10 rounded-lg">
                  <Icon className="w-5 h-5 text-lol-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-lol-gold transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-lol-gold font-medium">{feedCount} feeds</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-lol-gold transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
