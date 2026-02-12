/**
 * Toast hook - thin wrapper around the main store's toast system.
 * Provides a consistent API for showing toast notifications.
 */

import { useStore } from '../store';
import { useCallback } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

let toastId = 0;

/**
 * Hook for managing toast notifications.
 * Uses a local array of toasts with auto-dismiss.
 */
export function useToast() {
  const store = useStore();

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `toast-${++toastId}`;
    store.showToast(message, variant === 'warning' ? 'info' : variant);
    return id;
  }, [store]);

  const removeToast = useCallback((_id: string) => {
    store.hideToast();
  }, [store]);

  const clearToasts = useCallback(() => {
    store.hideToast();
  }, [store]);

  return {
    toasts: store.toast ? [{
      id: 'store-toast',
      message: store.toast.message,
      variant: (store.toast.type || 'info') as ToastVariant,
    }] : [] as Toast[],
    showToast,
    removeToast,
    clearToasts,
  };
}
