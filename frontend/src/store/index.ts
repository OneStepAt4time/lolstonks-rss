import { create } from 'zustand';

interface UIStore {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  toast: { show: boolean; message: string; type?: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useStore = create<UIStore>()((set) => ({
  mobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { show: true, message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  hideToast: () => set({ toast: null }),
}));
