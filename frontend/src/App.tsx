import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';
import { ToastContainer } from './components/ui/Toast';
import { useToast } from './hooks/useToast';
import { HomePage } from './pages/HomePage';
import { FeedsPage } from './pages/FeedsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import './styles/globals.css';

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
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
            <Route path="*" element={
              <PageTransition>
                <NotFoundPage />
              </PageTransition>
            } />
          </Routes>
        </main>
        <Footer />
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </BrowserRouter>
  );
}

export default App;
