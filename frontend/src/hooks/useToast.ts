import { useStore } from '../store';
import { useCallback } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

let toastId = 0;

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

  return {
    toasts: store.toast ? [{
      id: 'store-toast',
      message: store.toast.message,
      variant: (store.toast.type || 'info') as ToastVariant,
    }] : [] as Toast[],
    showToast,
    removeToast,
  };
}
