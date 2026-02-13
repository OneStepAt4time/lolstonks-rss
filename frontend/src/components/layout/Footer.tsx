import { Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/[0.06] mt-12">
      <div className="container mx-auto px-4 max-w-4xl py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} LoL Stonks RSS &middot; Not endorsed by Riot Games
          </p>
          <a
            href="https://github.com/OneStepAt4time/lolstonks-rss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};
