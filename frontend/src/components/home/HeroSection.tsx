import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rss, ExternalLink } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0e17] via-[#111827] to-[#0a0e17]">
      {/* Subtle hextech accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hextech to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-16 bg-hextech/10 blur-3xl" />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-6"
        >
          <h1 className="font-display text-7xl sm:text-8xl md:text-9xl font-bold leading-none tracking-wider mb-4">
            <span className="block text-gradient-gold">LEGENDS</span>
            <span className="block text-white">NEWS FEED</span>
          </h1>
        </motion.div>

        {/* Decorative Line */}
        <motion.div
          className="flex items-center justify-center gap-4 my-6"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-lol-gold/60" />
          <div className="w-2 h-2 bg-lol-gold rotate-45" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-lol-gold/60" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="font-body text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Your gateway to League of Legends news from{' '}
          <span className="text-lol-gold font-semibold">20+ regions</span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link
            to="/feeds"
            className="btn-primary flex items-center gap-2 px-8 py-4 text-lg"
          >
            <Rss className="w-5 h-5" />
            Explore Feeds
          </Link>

          <a
            href="https://onestepat4time.github.io/lolstonks-rss/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2 px-8 py-4 text-lg"
          >
            <ExternalLink className="w-5 h-5" />
            Get RSS Feed
          </a>
        </motion.div>
      </div>
    </section>
  );
};
