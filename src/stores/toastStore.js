import { create } from 'zustand';
import { APP_CONFIG, getToastDuration } from '../config/appConfig';

const MAX_VISIBLE_TOASTS = APP_CONFIG.toast.maxVisible;

const useToastStore = create((set, get) => ({
  toasts: [],
  queue: [], // Várakozó toast-ok

  addToast: (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: toast.type || 'info', // 'success', 'error', 'warning', 'info'
      message: toast.message || '',
      duration: toast.duration || getToastDuration(toast.type || 'info'), // ms
      ...toast
    };
    
    set((state) => {
      const currentToasts = state.toasts || [];
      
      // Ha van hely, azonnal megjelenítjük
      if (currentToasts.length < MAX_VISIBLE_TOASTS) {
        return {
          toasts: [...currentToasts, newToast]
        };
      }
      
      // Ha nincs hely, a queue-ba tesszük
      return {
        queue: [...(state.queue || []), newToast]
      };
    });

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => {
      const updatedToasts = (state.toasts || []).filter((t) => t.id !== id);
      const queue = state.queue || [];
      
      // Ha van hely és van várakozó toast, akkor megjelenítjük a következt
      if (updatedToasts.length < MAX_VISIBLE_TOASTS && queue.length > 0) {
        const nextToast = queue[0];
        const remainingQueue = queue.slice(1);
        
        // Auto remove after duration for the next toast
        if (nextToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(nextToast.id);
          }, nextToast.duration);
        }
        
        return {
          toasts: [...updatedToasts, nextToast],
          queue: remainingQueue
        };
      }
      
      return {
        toasts: updatedToasts,
        queue
      };
    });
  },

  clearAll: () => {
    set({ toasts: [] });
  },

  // Helper methods
  success: (message, duration) => {
    return get().addToast({ type: 'success', message, duration });
  },

  error: (message, duration) => {
    return get().addToast({ type: 'error', message, duration: duration || getToastDuration('error') });
  },

  warning: (message, duration) => {
    return get().addToast({ type: 'warning', message, duration });
  },

  info: (message, duration) => {
    return get().addToast({ type: 'info', message, duration });
  }
}));

export default useToastStore;

