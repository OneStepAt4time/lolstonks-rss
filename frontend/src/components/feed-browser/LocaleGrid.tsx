import { motion } from 'framer-motion';

export const LocaleGrid = () => {
  // In future, we could fetch actual article counts from API

  const locales = [
    { code: 'en-us', name: 'English (US)', region: 'Americas' },
    { code: 'en-gb', name: 'English (UK)', region: 'Europe' },
    { code: 'es-es', name: 'Spanish (ES)', region: 'Europe' },
    { code: 'es-mx', name: 'Spanish (MX)', region: 'Americas' },
    { code: 'fr-fr', name: 'French', region: 'Europe' },
    { code: 'de-de', name: 'German', region: 'Europe' },
    { code: 'it-it', name: 'Italian', region: 'Europe' },
    { code: 'pt-br', name: 'Portuguese', region: 'Americas' },
    { code: 'ru-ru', name: 'Russian', region: 'Europe' },
    { code: 'tr-tr', name: 'Turkish', region: 'Europe' },
    { code: 'pl-pl', name: 'Polish', region: 'Europe' },
    { code: 'ja-jp', name: 'Japanese', region: 'Asia' },
    { code: 'ko-kr', name: 'Korean', region: 'Asia' },
    { code: 'zh-cn', name: 'Chinese (S)', region: 'Asia' },
    { code: 'zh-tw', name: 'Chinese (T)', region: 'Asia' },
    { code: 'ar-ae', name: 'Arabic', region: 'Middle East' },
    { code: 'vi-vn', name: 'Vietnamese', region: 'Asia' },
    { code: 'th-th', name: 'Thai', region: 'Asia' },
    { code: 'id-id', name: 'Indonesian', region: 'Asia' },
    { code: 'ph-ph', name: 'Filipino', region: 'Asia' },
  ];

  const getArticleCount = (localeCode: string) => {
    // Mock article counts - in real app this would come from API
    const counts: Record<string, number> = {
      'en-us': 234,
      'ja-jp': 189,
      'ko-kr': 167,
      'de-de': 145,
      'fr-fr': 132,
      'es-es': 118,
      'it-it': 98,
      'pt-br': 87,
      'zh-cn': 76,
      'zh-tw': 65,
      'es-mx': 54,
      'ru-ru': 43,
      'tr-tr': 32,
      'pl-pl': 28,
      'ar-ae': 21,
      'vi-vn': 18,
      'th-th': 15,
      'id-id': 12,
      'ph-ph': 9,
    };
    return counts[localeCode] || 0;
  };

  const regions = ['Americas', 'Europe', 'Asia', 'Middle East'];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-lol-gold mb-2">
          Explore by Language
        </h2>
        <p className="text-lol-blue">
          {locales.length} supported locales with {locales.reduce((sum, l) => sum + getArticleCount(l.code), 0)}+ articles
        </p>
      </div>

      {/* Group by Region */}
      {regions.map((region) => {
        const regionLocales = locales.filter(l => l.region === region);

        if (regionLocales.length === 0) return null;

        return (
          <div key={region} className="space-y-4">
            <h3 className="text-xl font-semibold text-lol-blue">
              {region}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {regionLocales.map((locale, index) => {
                const articleCount = getArticleCount(locale.code);
                const feedUrl = `/feed/${locale.code}.xml`;

                return (
                  <motion.a
                    key={locale.code}
                    href={feedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    whileHover={{ y: -8, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative"
                  >
                    <div className="card p-6 text-center h-full">
                      {/* Name */}
                      <h4 className="text-base font-semibold text-white mb-2 group-hover:text-lol-gold transition-colors">
                        {locale.name}
                      </h4>

                      {/* Code */}
                      <p className="text-xs text-gray-400 mb-3 font-mono">
                        {locale.code.toUpperCase()}
                      </p>

                      {/* Article Count */}
                      <div className="inline-flex items-center px-3 py-1 rounded-full
                                        bg-lol-gold/10 border border-lol-gold/30">
                        <span className="text-sm font-medium text-lol-gold">
                          {articleCount} articles
                        </span>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-lol-gold/20 via-transparent to-transparent
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                      rounded-xl pointer-events-none" />
                    </div>

                    {/* RSS Badge on hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="px-2 py-1 bg-lol-gold text-black text-xs font-bold rounded">
                        RSS
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
