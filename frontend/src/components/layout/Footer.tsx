import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-lol-dark border-t border-lol-gold/20 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-lol-gold mb-3">
              <span className="text-lol-gold">LoL</span> Stonks RSS
            </h3>
            <p className="text-sm text-gray-400">
              Your ultimate source for League of Legends news from Riot Games and
              community sources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-lol-blue mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-lol-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/feeds" className="hover:text-lol-gold transition-colors">
                  Browse Feeds
                </Link>
              </li>
              <li>
                <a
                  href="/feed.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-lol-gold transition-colors"
                >
                  Main RSS Feed
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-lol-blue mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="https://github.com/OneStepAt4time/lolstonks-rss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-lol-gold transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://www.leagueoflegends.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-lol-gold transition-colors"
                >
                  League of Legends
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-lol-gold/10 text-center text-sm text-gray-500">
          <p>
            © {currentYear} LoL Stonks RSS. This project is not affiliated with
            Riot Games.
          </p>
        </div>
      </div>
    </footer>
  );
};
