import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  link: string;
  delay: number;
  gradient: string;
}

const FeatureCard = ({ icon, title, description, link, delay, gradient }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -8 }}
    className="group relative"
  >
    <Link to={link} className="block h-full">
      <div className="relative h-full p-8 bg-lol-card rounded-2xl border border-lol-gold/20 overflow-hidden transition-all duration-300 group-hover:border-lol-gold/40 group-hover:shadow-gold">
        {/* Animated gradient background */}
        <motion.div
          className={`absolute inset-0 opacity-10 ${gradient}`}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundSize: '200% 200%',
          }}
        />

        {/* Icon */}
        <motion.div
          className="text-5xl mb-4"
          whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-lol-gold transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Explore link */}
        <div className="flex items-center text-lol-gold font-semibold text-sm group-hover:gap-3 transition-all">
          <span>Explore</span>
          <svg
            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>

        {/* Decorative element */}
        <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-lol-gold">
            <polygon points="0,100 100,100 100,0" />
          </svg>
        </div>
      </div>
    </Link>
  </motion.div>
);

export const FeatureHighlights = () => {
  const features = [
    {
      icon: '🌍',
      title: 'Multi-Locale Compare',
      description: 'Compare news across 4 languages simultaneously. Stay updated on global League of Legends content from different regions.',
      link: '/compare',
      delay: 0,
      gradient: 'bg-gradient-to-br from-lol-blue to-lol-blue-dark',
    },
    {
      icon: '📂',
      title: 'Category Filtering',
      description: 'Filter by esports, patch notes, dev blogs, and more. Find exactly the type of content you\'re looking for.',
      link: '/feeds',
      delay: 0.2,
      gradient: 'bg-gradient-to-br from-lol-gold to-lol-gold-dark',
    },
    {
      icon: '🔄',
      title: 'Auto-Sync Scrolling',
      description: 'Scroll one news column to scroll all. Experience seamless synchronized browsing when comparing multiple feeds.',
      link: '/compare',
      delay: 0.4,
      gradient: 'bg-gradient-to-br from-lol-red to-lol-red-dark',
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-dark">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-lol-gold/10 border border-lol-gold/30 rounded-full text-lol-gold text-sm font-semibold mb-4"
          >
            POWERFUL FEATURES
          </motion.span>
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
