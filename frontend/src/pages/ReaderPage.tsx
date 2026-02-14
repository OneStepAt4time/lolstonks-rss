import { useParams, Navigate } from 'react-router-dom';
import { NewsReader } from '../components/reader/NewsReader';
import { LOCALES, GAMES, type GameType } from '../lib/feeds-catalog';

const VALID_LOCALES = new Set<string>([...LOCALES, 'main']);
const VALID_GAMES = new Set<string>(Object.keys(GAMES));

export const ReaderPage = () => {
  const { locale, game } = useParams<{ locale: string; game?: string }>();

  const validGame = game && VALID_GAMES.has(game) ? (game as GameType) : undefined;

  if (game && !validGame) {
    return <Navigate to="/" replace />;
  }

  if (!locale || !VALID_LOCALES.has(locale)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <NewsReader locale={locale} game={validGame} />
    </div>
  );
};
