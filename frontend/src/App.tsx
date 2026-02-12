import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';
import { ToastContainer } from './components/ui/Toast';
import { ApiStatusIndicator } from './components/ui/ApiStatusIndicator';
import { LoadingState } from './components/ui/LoadingState';
import { useToast } from './hooks/useToast';
import { HomePage } from './pages/HomePage';
import './styles/globals.css';

// Lazy load non-critical routes for better initial load performance
const FeedsPage = lazy(() => import('./pages/FeedsPage').then(m => ({ default: m.FeedsPage })));
const AllFeedsPage = lazy(() => import('./pages/AllFeedsPage').then(m => ({ default: m.AllFeedsPage })));
const LocaleComparisonPage = lazy(() => import('./pages/LocaleComparisonPage').then(m => ({ default: m.LocaleComparisonPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Loading fallback for lazy routes
function RouteLoading() {
  return <LoadingState variant="spinner" message="Loading..." fullScreen={false} inline />;
}

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={
                <PageTransition>
                  <HomePage />
                </PageTransition>
              } />
              <Route path="/feeds" element={
                <PageTransition>
                  <FeedsPage />
                </PageTransition>
              } />
              <Route path="/all-feeds" element={
                <PageTransition>
                  <AllFeedsPage />
                </PageTransition>
              } />
              <Route path="/compare" element={
                <PageTransition>
                  <LocaleComparisonPage />
                </PageTransition>
              } />
              <Route path="*" element={
                <PageTransition>
                  <NotFoundPage />
                </PageTransition>
              } />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>

      {/* API Status Indicator */}
      <ApiStatusIndicator position="fixed" showLabel={false} />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </BrowserRouter>
  );
}

export default App;
