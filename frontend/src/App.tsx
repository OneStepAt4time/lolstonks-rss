import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useToast } from './hooks/useToast';
import { CatalogPage } from './pages/CatalogPage';
import { ReaderPage } from './pages/ReaderPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/read/:locale" element={<ReaderPage />} />
              <Route path="/read/:game/:locale" element={<ReaderPage />} />
              <Route path="/feeds" element={<Navigate to="/" replace />} />
              <Route path="/all-feeds" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>

        <ToastContainer toasts={toasts} onClose={removeToast} />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
