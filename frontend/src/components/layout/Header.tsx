import { Link } from 'react-router-dom';
import { Github, Rss } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0e17]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between h-12">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold">
              <span className="text-lol-gold">LoL</span>{' '}
              <span className="text-white">Stonks</span>{' '}
              <span className="text-gray-400 text-sm font-normal">RSS</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="https://onestepat4time.github.io/lolstonks-rss/feed.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-lol-gold transition-colors"
              aria-label="Main RSS feed"
            >
              <Rss className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/OneStepAt4time/lolstonks-rss"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="GitHub repository"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
