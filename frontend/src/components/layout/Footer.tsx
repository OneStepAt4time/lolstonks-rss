import { Link } from 'react-router-dom';
import { Github, ExternalLink, Rss } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0e17] border-t border-white/[0.08] mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-3">
              <span className="text-lol-gold">LoL</span>{' '}
              <span className="text-white">Stonks RSS</span>
            </h3>
            <p className="text-sm text-gray-400">
              Your ultimate source for League of Legends news from Riot Games and
              community sources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-hextech mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-lol-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/feeds" className="text-gray-400 hover:text-lol-gold transition-colors">
                  Browse Feeds
                </Link>
              </li>
              <li>
                <a
                  href="/feed.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-gray-400 hover:text-lol-gold transition-colors"
                >
                  <Rss className="w-3.5 h-3.5" />
                  Main RSS Feed
                </a>
              </li>
            </ul>
          </div>

          {/* External */}
          <div>
            <h4 className="text-sm font-semibold text-hextech mb-3">External</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/OneStepAt4time/lolstonks-rss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-gray-400 hover:text-lol-gold transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://www.leagueoflegends.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-gray-400 hover:text-lol-gold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  League of Legends
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/[0.06] text-center text-sm text-gray-500">
          <p>
            &copy; {currentYear} LoL Stonks RSS. This project is not affiliated with
            Riot Games.
          </p>
        </div>
      </div>
    </footer>
  );
};
