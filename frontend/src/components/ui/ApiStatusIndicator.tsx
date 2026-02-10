import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export type ApiStatus = 'connected' | 'demo' | 'error' | 'loading' | 'unknown';

interface ApiStatusIndicatorProps {
  /**
   * Position of the indicator
   * @default 'fixed'
   */
  position?: 'fixed' | 'inline';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Custom API base URL to check
   * @default Uses environment API_BASE
   */
  apiBaseUrl?: string;
  /**
   * Interval in milliseconds to check API status
   * @default 30000 (30 seconds)
   */
  checkInterval?: number;
  /**
   * Show detailed status text
   * @default false
   */
  showLabel?: boolean;
}

/**
 * Status badge configurations
 */
const STATUS_CONFIG = {
  connected: {
    icon: '🟢',
    label: 'Connected',
    description: 'API is reachable',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    glowColor: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    pulseColor: 'bg-emerald-500',
  },
  demo: {
    icon: '🟡',
    label: 'Demo Mode',
    description: 'Using mock data',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    glowColor: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    pulseColor: 'bg-amber-500',
  },
  error: {
    icon: '🔴',
    label: 'Error',
    description: 'API unreachable',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-400',
    glowColor: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    pulseColor: 'bg-rose-500',
  },
  loading: {
    icon: '⚪',
    label: 'Loading',
    description: 'Checking status...',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    textColor: 'text-gray-400',
    glowColor: 'shadow-[0_0_15px_rgba(107,114,128,0.3)]',
    pulseColor: 'bg-gray-500',
  },
  unknown: {
    icon: '⚪',
    label: 'Unknown',
    description: 'Status unknown',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    textColor: 'text-gray-400',
    glowColor: '',
    pulseColor: 'bg-gray-500',
  },
};

const DEFAULT_API_BASE = import.meta.env.PROD
  ? 'https://onestepat4time.github.io/lolstonksrss'
  : 'http://localhost:8000';

/**
 * ApiStatusIndicator Component
 *
 * Displays a status badge showing the current API connection status.
 * Automatically detects API availability and updates accordingly.
 *
 * @example
 * ```tsx
 * // Fixed position (default)
 * <ApiStatusIndicator />
 *
 * // Inline with label
 * <ApiStatusIndicator position="inline" showLabel />
 *
 * // Custom API URL
 * <ApiStatusIndicator apiBaseUrl="https://api.example.com" />
 * ```
 */
export const ApiStatusIndicator = ({
  position = 'fixed',
  className = '',
  apiBaseUrl,
  checkInterval = 30000,
  showLabel = false,
}: ApiStatusIndicatorProps) => {
  const [status, setStatus] = useState<ApiStatus>('loading');
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Check API availability
   */
  const checkApiStatus = async (): Promise<ApiStatus> => {
    const baseUrl = apiBaseUrl || DEFAULT_API_BASE;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return 'connected';
      }

      // Check if we're in demo mode by looking for demo data
      const demoResponse = await fetch(`${baseUrl}/api/demo`, {
        method: 'HEAD',
        signal: controller.signal,
      });

      if (demoResponse.ok) {
        return 'demo';
      }

      return 'error';
    } catch (error) {
      // Network error - check if demo mode is available
      try {
        const demoResponse = await fetch(`${baseUrl}/api/demo`, {
          method: 'HEAD',
        });
        if (demoResponse.ok) {
          return 'demo';
        }
      } catch {
        // Demo mode also unavailable
      }

      return 'error';
    }
  };

  /**
   * Initial status check and periodic updates
   */
  useEffect(() => {
    let isActive = true;

    const performCheck = async () => {
      if (!isActive) return;

      const newStatus = await checkApiStatus();
      if (isActive) {
        setStatus(newStatus);
      }
    };

    // Initial check
    performCheck();

    // Set up periodic checks
    const intervalId = setInterval(performCheck, checkInterval);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [apiBaseUrl, checkInterval]);

  const config = STATUS_CONFIG[status];

  const baseClasses = 'flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm transition-all duration-300';
  const positionClasses = position === 'fixed'
    ? 'fixed bottom-4 right-4 z-50'
    : 'inline-flex';

  return (
    <motion.div
      className={`${baseClasses} ${positionClasses} ${config.bgColor} ${config.borderColor} ${config.glowColor} ${className}`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={config.description}
    >
      {/* Status icon with pulse */}
      <div className="relative">
        <span className="text-sm" aria-hidden="true">
          {config.icon}
        </span>
        <AnimatePresence>
          {status !== 'unknown' && (
            <motion.span
              className={`absolute -inset-1 rounded-full ${config.pulseColor} opacity-30`}
              initial={{ scale: 1, opacity: 0.3 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Status label */}
      <AnimatePresence>
        {(showLabel || isHovered) && (
          <motion.span
            className={`${config.textColor} text-xs font-semibold uppercase tracking-wider`}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
          >
            {config.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ApiStatusIndicator;
