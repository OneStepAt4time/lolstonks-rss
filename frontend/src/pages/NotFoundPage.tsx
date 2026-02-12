import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SearchX, Home } from 'lucide-react';
import { MetaTags } from '../components/seo';

export const NotFoundPage = () => {
  return (
    <>
      <MetaTags
        title="Page Not Found"
        description="The page you are looking for does not exist."
        noindex
        nofollow
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <SearchX className="w-16 h-16 text-lol-gold mx-auto mb-6" />
          <h1 className="text-6xl font-display font-bold text-white mb-4">404</h1>
          <p className="text-xl text-gray-400 mb-8">Page Not Found</p>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </motion.div>
      </div>
    </>
  );
};
