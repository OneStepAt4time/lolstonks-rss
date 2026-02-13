import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  message: string;
  variant: ToastVariant;
  onClose: (id: string) => void;
  duration?: number;
}

const toastConfig = {
  success: {
    borderColor: 'border-l-emerald-500',
    icon: CheckCircle,
    iconColor: 'text-emerald-400',
  },
  error: {
    borderColor: 'border-l-red-500',
    icon: AlertCircle,
    iconColor: 'text-red-400',
  },
  warning: {
    borderColor: 'border-l-amber-500',
    icon: AlertCircle,
    iconColor: 'text-amber-400',
  },
  info: {
    borderColor: 'border-l-sky-500',
    icon: Info,
    iconColor: 'text-sky-400',
  },
};

export const Toast = ({ id, message, variant, onClose, duration = 5000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const config = toastConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`animate-fade-in bg-[#111827] border border-white/[0.08] border-l-4 ${config.borderColor} rounded-lg shadow-lg p-4 mb-2 flex items-center gap-3 min-w-[300px] max-w-md`}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
      <p className="flex-1 text-sm text-gray-200">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; variant: ToastVariant }>;
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            variant={toast.variant}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  );
};
