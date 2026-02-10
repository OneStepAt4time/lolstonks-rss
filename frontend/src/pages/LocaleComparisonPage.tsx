/**
 * LocaleComparisonPage - Compare news across multiple locales side by side
 *
 * Features:
 * - Side-by-side article display for 2-4 locales
 * - Sync scrolling between locale columns
 * - Article count badges per locale
 * - Translate button using browser translation API
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import type { Article } from '../types/article';

// Available locales for comparison
const AVAILABLE_LOCALES = [
  { code: 'en-us', name: 'English', flag: '🇺🇸' },
  { code: 'it-it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja-jp', name: '日本語', flag: '🇯🇵' },
  { code: 'ko-kr', name: '한국어', flag: '🇰🇷' },
  { code: 'de-de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr-fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es-es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt-br', name: 'Português', flag: '🇧🇷' },
  { code: 'zh-cn', name: '简体中文', flag: '🇨🇳' },
  { code: 'ru-ru', name: 'Русский', flag: '🇷🇺' },
];

export const LocaleComparisonPage = () => {
  const { articles, fetchArticles } = useStore();
  const [selectedLocales, setSelectedLocales] = useState<string[]>(['en-us', 'it-it']);
  const [localeArticles, setLocaleArticles] = useState<Record<string, Article[]>>({});
  const [syncScroll, setSyncScroll] = useState(true);

  // Fetch articles for selected locales
  useEffect(() => {
    const fetchAllLocaleArticles = async () => {
      const results: Record<string, Article[]> = {};

      for (const locale of selectedLocales) {
        try {
          // Filter articles by locale
          const localeSpecificArticles = articles.filter((a: Article) => a.locale === locale);
          if (localeSpecificArticles.length === 0) {
            // Fetch from API if none cached
            await fetchArticles({ limit: 50 });
            const fresh = articles.filter((a: Article) => a.locale === locale);
            results[locale] = fresh.slice(0, 10); // Show first 10
          } else {
            results[locale] = localeSpecificArticles.slice(0, 10);
          }
        } catch (error) {
          console.error(`Error fetching articles for ${locale}:`, error);
          results[locale] = [];
        }
      }

      setLocaleArticles(results);
    };

    fetchAllLocaleArticles();
  }, [selectedLocales, articles]);

  // Add/remove locale from comparison
  const toggleLocale = (localeCode: string) => {
    if (selectedLocales.includes(localeCode)) {
      if (selectedLocales.length > 1) {
        setSelectedLocales(selectedLocales.filter(l => l !== localeCode));
      }
    } else if (selectedLocales.length < 4) {
      setSelectedLocales([...selectedLocales, localeCode]);
    }
  };

  // Translate article using browser translation
  const translateArticle = (article: Article, locale: string) => {
    const url = `${window.location.origin}/article/${article.guid}`;
    window.open(`https://translate.google.com/translate?sl=auto&tl=${locale}&u=${encodeURIComponent(url)}`, '_blank');
  };

  // Sync scroll handler
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
    <div className="min-h-screen bg-lol-dark">
      {/* Header */}
      <div className="bg-lol-card border-b border-lol-gold/20 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            🌍 Multi-Locale Comparison
          </h1>
          <p className="text-lol-blue mb-6">
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
                    ? 'bg-lol-gold text-black border-lol-gold'
                    : 'bg-lol-hover text-gray-300 border-lol-gold/30 hover:border-lol-gold/50'
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
            <label className="flex items-center gap-2 text-lol-blue cursor-pointer">
              <input
                type="checkbox"
                checked={syncScroll}
                onChange={(e) => setSyncScroll(e.target.checked)}
                className="w-4 h-4 accent-lol-gold"
              />
              <span>Sync scroll between columns</span>
            </label>
            <div className="text-sm text-gray-500">
              {selectedLocales.length} locale{selectedLocales.length > 1 ? 's' : ''} selected
              (max 4)
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
                className="bg-lol-card border border-lol-gold/20 rounded-lg overflow-hidden"
              >
                {/* Locale Header */}
                <div className="bg-lol-gold/10 px-4 py-3 border-b border-lol-gold/20 sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{localeInfo?.flag}</span>
                      {localeInfo?.name}
                    </h2>
                    <span className="text-sm text-lol-blue">{articles.length} articles</span>
                  </div>
                </div>

                {/* Articles List */}
                <div
                  className="locale-articles-container h-[600px] overflow-y-auto px-4 py-4 space-y-4"
                  onScroll={handleScroll}
                >
                  {articles.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No articles available for this locale
                    </div>
                  ) : (
                    articles.map((article) => (
                      <motion.article
                        key={article.guid}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-lol-hover border border-lol-gold/10 rounded-lg p-4 hover:border-lol-gold/30 transition-all"
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
                                translateArticle(article, localeCode);
                              }}
                              className="px-2 py-1 bg-lol-blue/20 text-lol-blue rounded hover:bg-lol-blue/30 transition-colors"
                            >
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

      {/* Info Section */}
      <div className="px-6 pb-8">
        <div className="max-w-3xl mx-auto bg-lol-card border border-lol-gold/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">💡 Tips</h3>
          <ul className="space-y-2 text-lol-blue">
            <li>• <strong className="text-lol-gold">Sync scroll</strong> - Scroll one column to scroll all others simultaneously</li>
            <li>• <strong className="text-lol-gold">Translate</strong> - Opens Google Translate in a new tab for full article translation</li>
            <li>• <strong className="text-lol-gold">Max 4 locales</strong> - Compare up to 4 languages at once for optimal viewing</li>
            <li>• <strong className="text-lol-gold">Real-time data</strong> - Articles are fetched from the latest RSS feeds</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
