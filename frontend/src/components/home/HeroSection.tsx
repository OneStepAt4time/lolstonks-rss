import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useMemo, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';

// Lazy load the 3D crystal component for better performance
const HextechCrystal = lazy(() => import('./HextechCrystal').then(m => ({ default: m.HextechCrystal })));

export const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });

  // Floating particles data (stable reference)
  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    // eslint-disable-next-line react-hooks/purity -- Stable: computed once with empty deps
    x: Math.random() * 100 - 50,
    // eslint-disable-next-line react-hooks/purity -- Stable: computed once with empty deps
    y: Math.random() * 100 - 50,
    // eslint-disable-next-line react-hooks/purity -- Stable: computed once with empty deps
    size: Math.random() * 4 + 2,
    // eslint-disable-next-line react-hooks/purity -- Stable: computed once with empty deps
    duration: Math.random() * 3 + 4,
    // eslint-disable-next-line react-hooks/purity -- Stable: computed once with empty deps
    delay: Math.random() * 2,
  })), []); // Empty deps = computed once

  // Runes/symbols for background
  const runes = ['⚔', '🛡', '👑', '💎', '🔮', '🌟', '⚡', '🔥'];

  return (
    <div
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-primary"
        style={{
          y,
          opacity,
        }}
      />

      {/* Dynamic Gradient Mesh */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lol-gold/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lol-blue/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-lol-red/10 rounded-full blur-3xl animate-pulse-slow delay-2000" />
      </div>

      {/* 3D Hextech Crystal - League of Legends themed */}
      <div className="absolute right-4 md:right-20 top-1/2 transform -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 z-20 pointer-events-auto">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 md:w-24 md:h-24 border-4 border-lol-gold/30 border-t-lol-blue/30 rounded-full animate-spin" />
          </div>
        }>
          <HextechCrystal autoRotate={true} scale={1.2} />
        </Suspense>
      </div>

      {/* Animated Grid Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5">
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-lol-gold/30"
            style={{
              width: particle.size,
              height: particle.size,
              left: '50%',
              top: '50%',
            }}
            initial={{
              x: particle.x * 10,
              y: particle.y * 10,
              opacity: 0,
            }}
            animate={{
              x: [particle.x * 10, particle.x * 15, particle.x * 10],
              y: [particle.y * 10, particle.y * 15, particle.y * 10],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      {/* Floating Runes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {runes.map((rune, index) => (
          <motion.div
            key={index}
            className="absolute text-6xl opacity-10"
            style={{
              left: `${15 + index * 12}%`,
              top: `${10 + (index % 3) * 30}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + index * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.3,
            }}
          >
            {rune}
          </motion.div>
        ))}
      </div>

      {/* Hero Content */}
      <motion.div
        className="relative z-10 text-center px-4 max-w-6xl mx-auto"
        style={{ scale: smoothScale }}
      >
        {/* Main Title with Premium Typography */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-8"
        >
          <h1 className="font-display text-7xl sm:text-8xl md:text-9xl lg:text-10xl font-bold leading-none tracking-wider mb-4">
            <span className="block text-white drop-shadow-2xl">LEGENDS</span>
            <motion.span
              className="block bg-gradient-gold bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              NEWS FEED
            </motion.span>
          </h1>

          {/* Decorative Line */}
          <motion.div
            className="flex items-center justify-center gap-4 my-8"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-lol-gold" />
            <div className="w-2 h-2 bg-lol-gold rotate-45 shadow-glow" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-lol-gold" />
          </motion.div>
        </motion.div>

        {/* Subtitle with Enhanced Typography */}
        <motion.p
          className="font-body text-xl sm:text-2xl md:text-3xl text-lol-blue max-w-4xl mx-auto mb-12 font-medium tracking-wide"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          Your gateway to the{' '}
          <span className="text-lol-gold font-semibold">ultimate</span> League of
          Legends news experience
        </motion.p>

        {/* Description */}
        <motion.p
          className="font-body text-base sm:text-lg text-gray-400 max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        >
          Access over{' '}
          <span className="text-lol-gold font-bold">2,700+ RSS feeds</span> from
          Riot Games and community sources across{' '}
          <span className="text-lol-blue font-bold">20 locales</span> and{' '}
          <span className="text-lol-red font-bold">9 categories</span>
        </motion.p>

        {/* Premium Stats Pills */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
        >
          {[
            {
              label: '2,700+ Feeds',
              color: 'border-lol-gold/30 bg-lol-gold/10 text-lol-gold',
              icon: '📡',
            },
            {
              label: '20 Locales',
              color: 'border-lol-blue/30 bg-lol-blue/10 text-lol-blue',
              icon: '🌍',
            },
            {
              label: '9 Categories',
              color: 'border-lol-red/30 bg-lol-red/10 text-lol-red',
              icon: '📂',
            },
            {
              label: '15+ Sources',
              color: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
              icon: '🎯',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className={`px-6 py-3 rounded-xl border ${stat.color} font-semibold backdrop-blur-sm`}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <span className="mr-2">{stat.icon}</span>
              {stat.label}
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
        >
          <Link
            to="/feeds"
            className="group relative px-8 py-4 bg-gradient-gold text-black font-display font-bold text-lg uppercase tracking-wider rounded-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-gold hover:shadow-gold-strong"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Feeds
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
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
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>

          <a
            href="/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative px-8 py-4 bg-transparent border-2 border-lol-gold text-lol-gold font-display font-bold text-lg uppercase tracking-wider rounded-lg overflow-hidden transition-all hover:scale-105 active:scale-95 hover:bg-lol-gold/10"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z" />
              </svg>
              RSS Feed
            </span>
          </a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 1.2,
            ease: 'easeOut',
          }}
        >
          <motion.div
            className="flex flex-col items-center gap-2 text-lol-gold/70"
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span className="text-sm font-display tracking-widest uppercase">
              Scroll to explore
            </span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-lol-gold/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-lol-gold/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-lol-gold/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-lol-gold/30" />

      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(1,10,19,0.4)_100%)]" />
    </div>
  );
};
