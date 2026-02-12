import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const BASE_URL = 'https://onestepat4time.github.io/lolstonks-rss';

export const LocaleGrid = () => {
  const { showToast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const locales = [
    { code: 'en-us', name: 'English (US)', flag: '\u{1F1FA}\u{1F1F8}', region: 'Americas' },
    { code: 'en-gb', name: 'English (UK)', flag: '\u{1F1EC}\u{1F1E7}', region: 'Europe' },
    { code: 'es-es', name: 'Spanish (ES)', flag: '\u{1F1EA}\u{1F1F8}', region: 'Europe' },
    { code: 'es-mx', name: 'Spanish (MX)', flag: '\u{1F1F2}\u{1F1FD}', region: 'Americas' },
    { code: 'fr-fr', name: 'French', flag: '\u{1F1EB}\u{1F1F7}', region: 'Europe' },
    { code: 'de-de', name: 'German', flag: '\u{1F1E9}\u{1F1EA}', region: 'Europe' },
    { code: 'it-it', name: 'Italian', flag: '\u{1F1EE}\u{1F1F9}', region: 'Europe' },
    { code: 'pt-br', name: 'Portuguese', flag: '\u{1F1E7}\u{1F1F7}', region: 'Americas' },
    { code: 'ru-ru', name: 'Russian', flag: '\u{1F1F7}\u{1F1FA}', region: 'Europe' },
    { code: 'tr-tr', name: 'Turkish', flag: '\u{1F1F9}\u{1F1F7}', region: 'Europe' },
    { code: 'pl-pl', name: 'Polish', flag: '\u{1F1F5}\u{1F1F1}', region: 'Europe' },
    { code: 'ja-jp', name: 'Japanese', flag: '\u{1F1EF}\u{1F1F5}', region: 'Asia' },
    { code: 'ko-kr', name: 'Korean', flag: '\u{1F1F0}\u{1F1F7}', region: 'Asia' },
    { code: 'zh-cn', name: 'Chinese (S)', flag: '\u{1F1E8}\u{1F1F3}', region: 'Asia' },
    { code: 'zh-tw', name: 'Chinese (T)', flag: '\u{1F1F9}\u{1F1FC}', region: 'Asia' },
    { code: 'ar-ae', name: 'Arabic', flag: '\u{1F1E6}\u{1F1EA}', region: 'Middle East' },
    { code: 'vi-vn', name: 'Vietnamese', flag: '\u{1F1FB}\u{1F1F3}', region: 'Asia' },
    { code: 'th-th', name: 'Thai', flag: '\u{1F1F9}\u{1F1ED}', region: 'Asia' },
    { code: 'id-id', name: 'Indonesian', flag: '\u{1F1EE}\u{1F1E9}', region: 'Asia' },
    { code: 'ph-ph', name: 'Filipino', flag: '\u{1F1F5}\u{1F1ED}', region: 'Asia' },
  ];

  const regions = ['Americas', 'Europe', 'Asia', 'Middle East'];

  const copyFeedUrl = async (localeCode: string) => {
    const url = `${BASE_URL}/feed/${localeCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCode(localeCode);
      showToast('Feed URL copied!', 'success');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      showToast('Failed to copy URL', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          Explore by Language
        </h2>
        <p className="text-gray-400">
          {locales.length} supported locales
        </p>
      </div>

      {regions.map((region) => {
        const regionLocales = locales.filter(l => l.region === region);
        if (regionLocales.length === 0) return null;

        return (
          <div key={region} className="space-y-4">
            <h3 className="text-xl font-semibold text-lol-gold">
              {region}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {regionLocales.map((locale, index) => (
                <motion.div
                  key={locale.code}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  whileHover={{ y: -4 }}
                  className="bg-[#111827] rounded-xl border border-white/[0.08] hover:border-lol-gold/30 transition-all p-5 text-center group"
                >
                  <div className="text-3xl mb-2">{locale.flag}</div>
                  <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-lol-gold transition-colors">
                    {locale.name}
                  </h4>
                  <p className="text-xs text-gray-500 mb-3 font-mono">
                    {locale.code.toUpperCase()}
                  </p>
                  <button
                    onClick={() => copyFeedUrl(locale.code)}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                      copiedCode === locale.code
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-lol-gold/10 text-lol-gold border border-lol-gold/20 hover:bg-lol-gold/20'
                    }`}
                  >
                    {copiedCode === locale.code ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Feed URL
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
