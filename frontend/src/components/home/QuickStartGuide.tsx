import { motion } from 'framer-motion';

interface StepProps {
  step: number;
  icon: string;
  title: string;
  description: string;
  delay: number;
}

const Step = ({ step, icon, title, description, delay }: StepProps) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="relative group"
  >
    {/* Step number */}
    <motion.div
      className="absolute -left-4 top-0 w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center text-black font-bold text-lg shadow-gold group-hover:scale-110 transition-transform"
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.6 }}
    >
      {step}
    </motion.div>

    {/* Content */}
    <div className="pl-12 pr-6 pb-12 relative">
      {/* Connector line */}
      {step < 3 && (
        <div className="absolute left-1 top-10 w-0.5 h-full bg-gradient-to-b from-lol-gold/50 to-transparent" />
      )}

      {/* Card */}
      <div className="p-6 bg-lol-card rounded-xl border border-lol-gold/20 transition-all duration-300 group-hover:border-lol-gold/50 group-hover:shadow-glow-sm">
        {/* Icon */}
        <motion.div
          className="text-4xl mb-4"
          whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.4 }}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-display font-bold text-white mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </motion.div>
);

export const QuickStartGuide = () => {
  const steps = [
    {
      step: 1,
      icon: '🌍',
      title: 'Choose Your Locale',
      description: 'Select from 20 available locales including English, Japanese, Korean, Chinese, Spanish, and more. Get news in your preferred language.',
      delay: 0,
    },
    {
      step: 2,
      icon: '📂',
      title: 'Select Category',
      description: 'Filter by 9 different categories including esports, patch notes, dev blogs, and community content. Focus on what matters to you.',
      delay: 0.2,
    },
    {
      step: 3,
      icon: '📋',
      title: 'Copy RSS URL',
      description: 'Copy the RSS feed URL and add it to your favorite RSS reader. Stay updated with the latest League of Legends news automatically.',
      delay: 0.4,
    },
  ];

  return (
    <section className="py-20 px-4 bg-lol-dark-secondary">
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
            className="inline-block px-4 py-2 bg-lol-blue/10 border border-lol-blue/30 rounded-full text-lol-blue text-sm font-semibold mb-4"
          >
            GET STARTED
          </motion.span>
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
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <a
            href="/feeds"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-gold text-black font-display font-bold text-lg uppercase tracking-wider rounded-lg transition-all hover:scale-105 active:scale-95 shadow-gold hover:shadow-gold-strong"
          >
            Browse All Feeds
            <svg
              className="w-5 h-5"
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
          </a>
        </motion.div>
      </div>
    </section>
  );
};
