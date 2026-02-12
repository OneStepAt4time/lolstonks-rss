import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Radio, Globe, FolderOpen, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  suffix?: string;
  delay: number;
}

const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

const StatCard = ({ icon: Icon, value, label, suffix, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -4 }}
    className="bg-[#111827] rounded-xl p-6 border border-white/[0.08] hover:border-lol-gold/30 transition-colors"
  >
    <Icon className="w-6 h-6 text-lol-gold mb-3" />
    <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
      <AnimatedCounter value={value} suffix={suffix} />
    </div>
    <div className="text-sm text-gray-400 uppercase tracking-wider font-medium">
      {label}
    </div>
  </motion.div>
);

export const QuickStats = () => {
  const stats: StatCardProps[] = [
    { icon: Radio, value: 205, label: 'RSS Feeds', suffix: '+', delay: 0 },
    { icon: Globe, value: 20, label: 'Locales', delay: 0.1 },
    { icon: FolderOpen, value: 9, label: 'Categories', delay: 0.2 },
    { icon: Target, value: 5, label: 'Sources', delay: 0.3 },
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
