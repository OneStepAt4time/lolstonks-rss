import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export type ApiStatus = 'connected' | 'demo' | 'error' | 'loading' | 'unknown';

interface ApiStatusIndicatorProps {
  position?: 'fixed' | 'inline';
  className?: string;
  apiBaseUrl?: string;
  checkInterval?: number;
  showLabel?: boolean;
}

const STATUS_CONFIG = {
  connected: {
    Icon: Wifi,
    label: 'Connected',
    description: 'API is reachable',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  demo: {
    Icon: Wifi,
    label: 'Demo Mode',
    description: 'Using mock data',
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  error: {
    Icon: WifiOff,
    label: 'Error',
    description: 'API unreachable',
    dotColor: 'bg-rose-500',
    textColor: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
  loading: {
    Icon: Loader2,
    label: 'Loading',
    description: 'Checking status...',
    dotColor: 'bg-gray-500',
    textColor: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
  },
  unknown: {
    Icon: Wifi,
    label: 'Unknown',
    description: 'Status unknown',
    dotColor: 'bg-gray-500',
    textColor: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
  },
};

const DEFAULT_API_BASE = import.meta.env.PROD
  ? 'https://onestepat4time.github.io/lolstonks-rss'
  : 'http://localhost:8000';

export const ApiStatusIndicator = ({
  position = 'fixed',
  className = '',
  apiBaseUrl,
  checkInterval = 30000,
  showLabel = false,
}: ApiStatusIndicatorProps) => {
  const [status, setStatus] = useState<ApiStatus>('loading');
  const [isHovered, setIsHovered] = useState(false);

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

      const demoResponse = await fetch(`${baseUrl}/api/demo`, {
        method: 'HEAD',
        signal: controller.signal,
      });

      if (demoResponse.ok) {
        return 'demo';
      }

      return 'error';
    } catch {
      try {
        const demoResponse = await fetch(`${(apiBaseUrl || DEFAULT_API_BASE)}/api/demo`, {
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

  useEffect(() => {
    let isActive = true;

    const performCheck = async () => {
      if (!isActive) return;

      const newStatus = await checkApiStatus();
      if (isActive) {
        setStatus(newStatus);
      }
    };

    performCheck();

    const intervalId = setInterval(performCheck, checkInterval);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [apiBaseUrl, checkInterval]);

  const config = STATUS_CONFIG[status];
  const Icon = config.Icon;

  const positionClasses = position === 'fixed'
    ? 'fixed bottom-4 right-4 z-50'
    : 'inline-flex';

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.borderColor} transition-all duration-300 ${positionClasses} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={config.description}
    >
      <div className="relative">
        <Icon className={`w-3.5 h-3.5 ${config.textColor} ${status === 'loading' ? 'animate-spin' : ''}`} />
      </div>

      {(showLabel || isHovered) && (
        <span className={`${config.textColor} text-xs font-semibold uppercase tracking-wider`}>
          {config.label}
        </span>
      )}
    </div>
  );
};

export default ApiStatusIndicator;
