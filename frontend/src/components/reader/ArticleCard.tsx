import { useState } from 'react';
import { formatRelativeDate } from '../../lib/format-date';

const CATEGORY_COLORS: Record<string, string> = {
  'Game Updates': 'bg-lol-gold/15 text-lol-gold border-lol-gold/30',
  'Esports': 'bg-hextech/15 text-hextech border-hextech/30',
  'Dev': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  'Media': 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'Merch': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Lore': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Community': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Announcements': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
};

const DEFAULT_CATEGORY_STYLE = 'bg-gray-500/15 text-gray-400 border-gray-500/30';

interface ArticleCardProps {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  categories: string[];
  imageUrl: string | null;
  featured?: boolean;
  animationDelay?: number;
}

export const ArticleCard = ({
  title,
  link,
  description,
  pubDate,
  categories,
  imageUrl,
  featured,
  animationDelay = 0,
}: ArticleCardProps) => {
  const [imgError, setImgError] = useState(false);
  const category = categories[0];
  const categoryStyle = (category && CATEGORY_COLORS[category]) || DEFAULT_CATEGORY_STYLE;

  if (featured) {
    return (
      <article
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] group cursor-pointer animate-fade-in"
        style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
      >
        <a href={link} target="_blank" rel="noopener noreferrer" className="block">
          <div className="aspect-[21/9] overflow-hidden bg-lol-dark-secondary">
            {imageUrl && !imgError ? (
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="eager"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-lol-dark-secondary to-lol-dark-tertiary" />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 space-y-3">
            <div className="flex items-center gap-3">
              {category && (
                <span className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider border rounded-md ${categoryStyle}`}>
                  {category}
                </span>
              )}
              <span className="text-xs text-gray-400">{formatRelativeDate(pubDate)}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-white line-clamp-2">
              {title}
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-gray-300 line-clamp-2 max-w-3xl">
              {description}
            </p>
          </div>
        </a>
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-lol-gold/25 transition-colors duration-300 pointer-events-none" />
      </article>
    );
  }

  return (
    <article
      className="group rounded-xl overflow-hidden border border-white/[0.06] bg-lol-dark-secondary hover:border-lol-gold/20 hover:bg-lol-dark-tertiary transition-all duration-200 cursor-pointer animate-fade-in"
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'forwards',
        opacity: 0,
      }}
    >
      <a href={link} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-lol-dark-tertiary">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-lol-dark-secondary to-lol-dark-tertiary" />
          )}
          {category && (
            <div className="absolute bottom-3 left-3">
              <span className={`px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[#0a0e17]/80 backdrop-blur-sm border rounded ${categoryStyle}`}>
                {category}
              </span>
            </div>
          )}
        </div>
        <div className="p-5 space-y-2.5">
          <h3 className="text-lg font-semibold leading-snug text-white line-clamp-2 group-hover:text-lol-gold-light transition-colors duration-200">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-gray-300 line-clamp-2">
            {description}
          </p>
          <div className="text-xs text-gray-500">
            <time>{formatRelativeDate(pubDate)}</time>
          </div>
        </div>
      </a>
    </article>
  );
};
