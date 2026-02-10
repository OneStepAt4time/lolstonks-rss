import { motion } from 'framer-motion';
import type { ComponentType, ErrorInfo, ReactNode } from 'react';
import { Component, useState } from 'react';

interface ErrorBoundaryProps {
  /**
   * Fallback component to render when an error occurs
   */
  fallback?: ComponentType<FallbackProps>;
  /**
   * Custom error message
   */
  errorMessage?: string;
  /**
   * Custom error details (for development)
   */
  errorDetails?: string;
  /**
   * Report issue URL
   * @default GitHub issues for this repo
   */
  reportIssueUrl?: string;
  /**
   * Callback when error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Children components to wrap
   */
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

const DEFAULT_REPORT_URL = 'https://github.com/OneStepAt4time/lolstonksrss/issues/new';

/**
 * Default Fallback Component
 */
const DefaultFallback: ComponentType<FallbackProps> = ({
  error,
  resetError,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-lol-dark px-4">
      <motion.div
        className="max-w-lg w-full card p-8 text-center"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Error Icon */}
        <motion.div
          className="mx-auto mb-6 relative"
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center">
            <span className="text-5xl" role="img" aria-label="Error">
              ⚠️
            </span>
          </div>
          <motion.div
            className="absolute inset-0 rounded-full bg-rose-500/20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Error Title */}
        <h1 className="text-2xl font-display font-bold text-rose-400 mb-2">
          Oops! Something went wrong
        </h1>

        {/* Error Message */}
        <p className="text-gray-400 mb-6">
          {error?.message || 'An unexpected error occurred while rendering this page.'}
        </p>

        {/* Error Details Toggle (Development) */}
        {import.meta.env.DEV && error && (
          <details className="mb-6 text-left">
            <summary
              className="cursor-pointer text-lol-gold hover:text-lol-gold-light transition-colors"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Error Details
            </summary>
            {showDetails && (
              <motion.div
                className="mt-4 p-4 bg-lol-dark-secondary rounded-lg border border-lol-gold/20"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <p className="text-rose-400 font-mono text-sm mb-2">
                  {error.toString()}
                </p>
                <pre className="text-gray-500 text-xs overflow-auto max-h-40">
                  {error.stack}
                </pre>
              </motion.div>
            )}
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* Try Again Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetError}
            className="btn-primary"
          >
            Try Again
          </motion.button>

          {/* Report Issue Button */}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={DEFAULT_REPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Report Issue
          </motion.a>
        </div>

        {/* Additional Help Text */}
        <p className="text-gray-500 text-sm mt-6">
          If this problem persists, please check your connection or contact support.
        </p>
      </motion.div>
    </div>
  );
};

/**
 * ErrorBoundary Component
 *
 * Wraps children in a React error boundary to catch JavaScript errors anywhere in the
 * component tree, log those errors, and display a fallback UI instead of crashing.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 *
 * // Custom fallback
 * <ErrorBoundary fallback={CustomFallback}>
 *   <App />
 * </ErrorBoundary>
 *
 * // With error callback
 * <ErrorBoundary onError={(error, info) => console.error(error)}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error reporting service (could add Sentry, etc.)
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
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

/**
 * ErrorBoundary wrapper component with hooks support
 */
export const ErrorBoundary = ErrorBoundaryClass;

export default ErrorBoundary;

/**
 * Higher-order component version of ErrorBoundary
 *
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent);
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
