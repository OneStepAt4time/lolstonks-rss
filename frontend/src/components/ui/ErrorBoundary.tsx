import type { ComponentType, ErrorInfo, ReactNode } from 'react';
import { Component, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  fallback?: ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export interface FallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
}

const REPORT_URL = 'https://github.com/OneStepAt4time/lolstonks-rss/issues/new';

const DefaultFallback: ComponentType<FallbackProps> = ({ error, resetError }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-lol-dark px-4">
      <div className="animate-fade-in max-w-lg w-full bg-lol-dark-secondary border border-white/[0.08] rounded-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-rose-400" />
        </div>

        <h1 className="text-2xl font-bold text-rose-400 mb-2">Something went wrong</h1>
        <p className="text-gray-400 mb-6">
          {error?.message || 'An unexpected error occurred.'}
        </p>

        {import.meta.env.DEV && error && (
          <details className="mb-6 text-left">
            <summary
              className="cursor-pointer text-lol-gold hover:text-lol-gold-light transition-colors"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} details
            </summary>
            {showDetails && (
              <div className="mt-4 p-4 bg-lol-dark rounded-lg border border-lol-gold/20">
                <p className="text-rose-400 font-mono text-sm mb-2">{error.toString()}</p>
                <pre className="text-gray-500 text-xs overflow-auto max-h-40">{error.stack}</pre>
              </div>
            )}
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={resetError} className="btn-primary">
            Try Again
          </button>
          <a href={REPORT_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Report Issue
          </a>
        </div>
      </div>
    </div>
  );
};

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback: Fallback = DefaultFallback, children } = this.props;

    if (hasError) {
      return <Fallback error={error} errorInfo={errorInfo} resetError={this.resetError} />;
    }
    return children;
  }
}

export const ErrorBoundary = ErrorBoundaryClass;
export default ErrorBoundary;
