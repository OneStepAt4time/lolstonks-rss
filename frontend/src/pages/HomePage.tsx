import { motion } from 'framer-motion';
import { MessageSquare, Send, Webhook } from 'lucide-react';
import { HeroSection } from '../components/home/HeroSection';
import { QuickStats } from '../components/home/QuickStats';
import { FeatureHighlights } from '../components/home/FeatureHighlights';
import { TrendingFeeds } from '../components/home/TrendingFeeds';
import { QuickStartGuide } from '../components/home/QuickStartGuide';
import { MetaTags } from '../components/seo';
import { generateWebsiteStructuredData } from '../utils/seo';
import { StructuredData } from '../components/seo';

export const HomePage = () => {
  const seoTitle = 'League of Legends News';
  const seoDescription =
    'Get the latest League of Legends news, patch notes, and updates from Riot Games. Stay informed with real-time RSS feeds available in 20 languages.';

  return (
    <>
      <MetaTags
        title={seoTitle}
        description={seoDescription}
        ogType="website"
        canonicalUrl="https://onestepat4time.github.io/lolstonks-rss/"
      />
      <StructuredData data={generateWebsiteStructuredData()} />

      <div>
        <HeroSection />
        <QuickStats />
        <FeatureHighlights />
        <TrendingFeeds />
        <QuickStartGuide />

        {/* Coming Soon Section */}
        <section className="py-20 px-4 bg-[#0a0e17]">
          <div className="container mx-auto max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-valorant/10 border border-valorant/30 rounded-full text-valorant text-sm font-semibold mb-4">
                COMING SOON
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
                Multi-Platform Distribution
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
                Get LoL news delivered directly to your Discord server, Telegram channel, or via webhook API
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* Discord Card */}
                <div className="p-6 bg-[#111827] rounded-xl border border-white/[0.08]">
                  <div className="w-12 h-12 bg-[#5865F2]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-6 h-6 text-[#5865F2]" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white mb-2">Discord Bot</h3>
                  <p className="text-sm text-gray-400">Auto-post news to your server with rich embeds</p>
                </div>
                {/* Telegram Card */}
                <div className="p-6 bg-[#111827] rounded-xl border border-white/[0.08]">
                  <div className="w-12 h-12 bg-[#26A5E4]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-[#26A5E4]" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white mb-2">Telegram Channel</h3>
                  <p className="text-sm text-gray-400">Subscribe to multi-language news channels</p>
                </div>
                {/* Webhook Card */}
                <div className="p-6 bg-[#111827] rounded-xl border border-white/[0.08]">
                  <div className="w-12 h-12 bg-hextech/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Webhook className="w-6 h-6 text-hextech" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white mb-2">Webhook API</h3>
                  <p className="text-sm text-gray-400">Push notifications to any endpoint</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};
