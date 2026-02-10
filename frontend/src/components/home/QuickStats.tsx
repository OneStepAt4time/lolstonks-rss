import { motion } from 'framer-motion';

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  color: string;
  delay: number;
}

const StatCard = ({ icon, value, label, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -8, scale: 1.02 }}
    className={`relative group overflow-hidden rounded-2xl p-6 ${color} backdrop-blur-sm border border-white/10`}
  >
    {/* Animated background gradient */}
    <motion.div
      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        backgroundSize: '200% 200%',
      }}
    />

    {/* Content */}
    <div className="relative z-10">
      <motion.div
        className="text-4xl mb-3"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: 3 }}
      >
        {icon}
      </motion.div>
      <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-300 uppercase tracking-wider font-semibold">
        {label}
      </div>
    </div>

    {/* Decorative corner */}
    <div className="absolute top-0 right-0 w-16 h-16">
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
    </div>
  </motion.div>
);

export const QuickStats = () => {
  const stats = [
    {
      icon: '📡',
      value: '202',
      label: 'RSS Feeds',
      color: 'bg-gradient-to-br from-lol-gold/20 to-lol-gold-dark/20',
      delay: 0,
    },
    {
      icon: '🌍',
      value: '20',
      label: 'Locales',
      color: 'bg-gradient-to-br from-lol-blue/20 to-lol-blue-dark/20',
      delay: 0.1,
    },
    {
      icon: '📂',
      value: '9',
      label: 'Categories',
      color: 'bg-gradient-to-br from-lol-red/20 to-lol-red-dark/20',
      delay: 0.2,
    },
    {
      icon: '🎯',
      value: '5',
      label: 'Sources',
      color: 'bg-gradient-to-br from-purple-500/20 to-purple-700/20',
      delay: 0.3,
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
            Comprehensive Coverage
          </h2>
          <p className="text-gray-400 text-lg">
            The ultimate League of Legends news aggregator
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};
