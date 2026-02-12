import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rss, Filter, Bell, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
  delay: number;
}

const FeatureCard = ({ icon: Icon, title, description, link, delay }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -4 }}
    className="group"
  >
    <Link to={link} className="block h-full">
      <div className="h-full p-8 bg-[#111827] rounded-xl border border-white/[0.08] hover:border-lol-gold/30 transition-all">
        <Icon className="w-6 h-6 text-lol-gold mb-4" />

        <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-lol-gold transition-colors">
          {title}
        </h3>

        <p className="text-gray-400 mb-4 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center text-lol-gold font-semibold text-sm">
          <span>Explore</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  </motion.div>
);

export const FeatureHighlights = () => {
  const features: FeatureCardProps[] = [
    {
      icon: Rss,
      title: 'All Feeds Catalog',
      description: 'Browse our complete catalog of 205+ RSS feeds. Search, filter, and copy any feed URL instantly.',
      link: '/all-feeds',
      delay: 0,
    },
    {
      icon: Filter,
      title: 'Category Filtering',
      description: "Filter by esports, patch notes, dev blogs, and more. Find exactly the type of content you're looking for.",
      link: '/feeds',
      delay: 0.15,
    },
    {
      icon: Bell,
      title: 'RSS Subscriptions',
      description: 'Subscribe to any feed in your favorite RSS reader. Get instant notifications when new content is published.',
      link: '/all-feeds',
      delay: 0.3,
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-lol-gold/10 border border-lol-gold/30 rounded-full text-lol-gold text-sm font-semibold mb-4">
            POWERFUL FEATURES
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover advanced features designed for the ultimate League of Legends news experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};
