import { useParams, Navigate } from 'react-router-dom';
import { NewsReader } from '../components/reader/NewsReader';
import { LOCALES } from '../lib/feeds-catalog';

const VALID_LOCALES = new Set<string>([...LOCALES, 'main']);

export const ReaderPage = () => {
  const { locale } = useParams<{ locale: string }>();

  if (!locale || !VALID_LOCALES.has(locale)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <NewsReader locale={locale} />
    </div>
  );
};
