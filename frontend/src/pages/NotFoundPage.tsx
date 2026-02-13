import { Link } from 'react-router-dom';
import { SearchX, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-fade-in text-center py-20">
        <SearchX className="w-16 h-16 text-lol-gold mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page Not Found</p>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-5 h-5" />
          Go Home
        </Link>
      </div>
    </div>
  );
};
