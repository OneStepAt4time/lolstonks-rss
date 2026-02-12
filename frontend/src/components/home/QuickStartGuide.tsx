import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Copy, Rss, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StepProps {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
}

const Step = ({ step, icon: Icon, title, description, delay }: StepProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="relative group"
  >
    {/* Step number */}
    <div className="absolute -left-4 top-0 w-10 h-10 bg-lol-gold rounded-full flex items-center justify-center text-black font-bold text-lg">
      {step}
    </div>

    {/* Content */}
    <div className="pl-12 pr-6 pb-12 relative">
      {/* Connector line */}
      {step < 3 && (
        <div className="absolute left-1 top-10 w-0.5 h-full bg-gradient-to-b from-lol-gold/50 to-transparent" />
      )}

      {/* Card */}
      <div className="p-6 bg-[#111827] rounded-xl border border-white/[0.08] hover:border-lol-gold/30 transition-all">
        <Icon className="w-6 h-6 text-lol-gold mb-4" />

        <h3 className="text-xl font-display font-bold text-white mb-2">
          {title}
        </h3>

        <p className="text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </motion.div>
);

export const QuickStartGuide = () => {
  const steps: StepProps[] = [
    {
      step: 1,
      icon: Search,
      title: 'Choose Your Locale',
      description: 'Select from 20 available locales including English, Japanese, Korean, Chinese, Spanish, and more. Get news in your preferred language.',
      delay: 0,
    },
    {
      step: 2,
      icon: Copy,
      title: 'Copy RSS URL',
      description: 'Browse by category or source, then copy the RSS feed URL for the content you want to follow.',
      delay: 0.15,
    },
    {
      step: 3,
      icon: Rss,
      title: 'Subscribe in Your Reader',
      description: 'Paste the URL into your favorite RSS reader. Stay updated with the latest League of Legends news automatically.',
      delay: 0.3,
    },
  ];

  return (
    <section className="py-20 px-4 bg-[#0a0e17]">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-hextech/10 border border-hextech/30 rounded-full text-hextech text-sm font-semibold mb-4">
            GET STARTED
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Quick Start Guide
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get your RSS feed in three simple steps
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {steps.map((stepData) => (
            <Step key={stepData.step} {...stepData} />
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <Link
            to="/feeds"
            className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-lg"
          >
            Browse All Feeds
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
