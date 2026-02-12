/**
 * LocaleComparisonPage - Compare news across multiple locales side by side
 *
 * Features:
 * - Side-by-side article display for 2-4 locales
 * - Sync scrolling between locale columns
 * - Article count badges per locale
 * - Translate button using Google Translate
 */

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Globe, Languages, Lightbulb } from 'lucide-react';
import { useStore } from '../store';
import type { Article } from '../types/article';

const AVAILABLE_LOCALES = [
  { code: 'en-us', name: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'it-it', name: 'Italiano', flag: '\u{1F1EE}\u{1F1F9}' },
  { code: 'ja-jp', name: '\u65E5\u672C\u8A9E', flag: '\u{1F1EF}\u{1F1F5}' },
  { code: 'ko-kr', name: '\uD55C\uAD6D\uC5B4', flag: '\u{1F1F0}\u{1F1F7}' },
  { code: 'de-de', name: 'Deutsch', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: 'fr-fr', name: 'Fran\u00E7ais', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'es-es', name: 'Espa\u00F1ol', flag: '\u{1F1EA}\u{1F1F8}' },
  { code: 'pt-br', name: 'Portugu\u00EAs', flag: '\u{1F1E7}\u{1F1F7}' },
  { code: 'zh-cn', name: '\u7B80\u4F53\u4E2D\u6587', flag: '\u{1F1E8}\u{1F1F3}' },
  { code: 'ru-ru', name: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439', flag: '\u{1F1F7}\u{1F1FA}' },
];

export const LocaleComparisonPage = () => {
  const { fetchArticles } = useStore();
  const [selectedLocales, setSelectedLocales] = useState<string[]>(['en-us', 'it-it']);
  const [localeArticles, setLocaleArticles] = useState<Record<string, Article[]>>({});
  const [syncScroll, setSyncScroll] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fetch articles for selected locales
  const fetchLocaleArticles = useCallback(async () => {
    setLoading(true);
    const results: Record<string, Article[]> = {};

    for (const locale of selectedLocales) {
      try {
        await fetchArticles({ locale, limit: 50 });
        // After fetch completes, get the articles from the store
        const storeArticles = useStore.getState().articles;
        const localeSpecific = storeArticles.filter((a: Article) => a.locale === locale);
        results[locale] = localeSpecific.slice(0, 10);
      } catch (error) {
        console.error(`Error fetching articles for ${locale}:`, error);
        results[locale] = [];
      }
    }

    setLocaleArticles(results);
    setLoading(false);
  }, [selectedLocales, fetchArticles]);

  useEffect(() => {
    fetchLocaleArticles();
  }, [fetchLocaleArticles]);

  const toggleLocale = (localeCode: string) => {
    if (selectedLocales.includes(localeCode)) {
      if (selectedLocales.length > 1) {
        setSelectedLocales(selectedLocales.filter(l => l !== localeCode));
      }
    } else if (selectedLocales.length < 4) {
      setSelectedLocales([...selectedLocales, localeCode]);
    }
  };

  // Use actual article URL for Google Translate
  const translateArticle = (article: Article) => {
    window.open(
      `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(article.url)}`,
      '_blank'
    );
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!syncScroll) return;
    const scrollTop = e.currentTarget.scrollTop;
    const containers = document.querySelectorAll('.locale-articles-container');
    containers.forEach(container => {
      if (container !== e.currentTarget) {
        (container as HTMLElement).scrollTop = scrollTop;
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      {/* Header */}
      <div className="bg-[#111827] border-b border-white/[0.08] px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-4 flex items-center gap-3">
            <Globe className="w-8 h-8 text-lol-gold" />
            Multi-Locale Comparison
          </h1>
          <p className="text-gray-400 mb-6">
            Compare the latest League of Legends news across different languages and regions
          </p>

          {/* Locale Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {AVAILABLE_LOCALES.map((locale) => (
              <button
                key={locale.code}
                onClick={() => toggleLocale(locale.code)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  selectedLocales.includes(locale.code)
                    ? 'bg-lol-gold text-black border-lol-gold font-semibold'
                    : 'bg-[#1f2937] text-gray-300 border-white/[0.08] hover:border-lol-gold/30'
                }`}
              >
                <span className="mr-2">{locale.flag}</span>
                {locale.name}
                {selectedLocales.includes(locale.code) && (
                  <span className="ml-2 text-xs">
                    ({localeArticles[locale.code]?.length || 0})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={syncScroll}
                onChange={(e) => setSyncScroll(e.target.checked)}
                className="w-4 h-4 accent-lol-gold"
              />
              <span>Sync scroll between columns</span>
            </label>
            <div className="text-sm text-gray-500">
              {selectedLocales.length} locale{selectedLocales.length > 1 ? 's' : ''} selected (max 4)
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {selectedLocales.map((localeCode) => {
            const localeInfo = AVAILABLE_LOCALES.find(l => l.code === localeCode);
            const articles = localeArticles[localeCode] || [];

            return (
              <motion.div
                key={localeCode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111827] border border-white/[0.08] rounded-xl overflow-hidden"
              >
                {/* Locale Header */}
                <div className="bg-lol-gold/10 px-4 py-3 border-b border-white/[0.08] sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{localeInfo?.flag}</span>
                      {localeInfo?.name}
                    </h2>
                    <span className="text-sm text-gray-400">{articles.length} articles</span>
                  </div>
                </div>

                {/* Articles List */}
                <div
                  className="locale-articles-container h-[600px] overflow-y-auto px-4 py-4 space-y-4"
                  onScroll={handleScroll}
                >
                  {loading ? (
                    <div className="text-center text-gray-500 py-8">Loading articles...</div>
                  ) : articles.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No articles available for this locale
                    </div>
                  ) : (
                    articles.map((article) => (
                      <motion.article
                        key={article.guid}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-[#0a0e17] border border-white/[0.08] rounded-lg p-4 hover:border-lol-gold/30 transition-all"
                      >
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <h3 className="text-white font-medium mb-2 line-clamp-2 hover:text-lol-gold transition-colors">
                            {article.title}
                          </h3>
                          {article.description && (
                            <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                              {article.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{new Date(article.pub_date).toLocaleDateString()}</span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                translateArticle(article);
                              }}
                              className="px-2 py-1 bg-hextech/20 text-hextech rounded hover:bg-hextech/30 transition-colors flex items-center gap-1"
                            >
                              <Languages className="w-3.5 h-3.5" />
                              Translate
                            </button>
                          </div>
                        </a>
                      </motion.article>
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tips Section */}
      <div className="px-6 pb-8">
        <div className="max-w-3xl mx-auto bg-[#111827] border border-white/[0.08] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-lol-gold" />
            Tips
          </h3>
          <ul className="space-y-2 text-gray-400">
            <li><strong className="text-lol-gold">Sync scroll</strong> - Scroll one column to scroll all others simultaneously</li>
            <li><strong className="text-lol-gold">Translate</strong> - Opens Google Translate for full article translation</li>
            <li><strong className="text-lol-gold">Max 4 locales</strong> - Compare up to 4 languages at once for optimal viewing</li>
            <li><strong className="text-lol-gold">Real-time data</strong> - Articles are fetched from the latest RSS feeds</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
