import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
          <h1 className="text-6xl font-bold text-lol-gold mb-4">404</h1>
          <p className="text-xl text-lol-blue mb-8">Page not found</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </motion.div>
      </div>
    </>
  );
};
