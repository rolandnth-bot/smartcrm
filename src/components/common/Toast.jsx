import { useEffect, memo, useCallback, useMemo } from 'react';
import useToastStore from '../../stores/toastStore';
import Button from './Button';

const Toast = memo(({ toast }) => {
  const { removeToast } = useToastStore();

  const typeStyles = useMemo(() => ({
    success: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200'
  }), []);

  const iconStyles = useMemo(() => ({
    success: '',
    error: '',
    warning: '',
    info: ''
  }), []);

  const handleRemove = useCallback(() => {
    removeToast(toast.id);
  }, [removeToast, toast.id]);

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-[500px] animate-slide-in ${typeStyles[toast.type] || typeStyles.info}`}
      role="alert"
    >
      <span className="text-xl font-bold flex-shrink-0" aria-hidden="true">
        {iconStyles[toast.type] || iconStyles.info}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <Button
        onClick={handleRemove}
        variant="ghost"
        size="sm"
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        aria-label="Bezárás"
      >
        <span className="text-lg" aria-hidden="true">×</span>
      </Button>
    </div>
  );
});

Toast.displayName = 'Toast';

const ToastContainer = () => {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

