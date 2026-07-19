import { useState, useEffect, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastCounter = 0;
let addToastGlobal: ((message: string, type: Toast['type']) => void) | null = null;

/* Call from anywhere without needing a hook */
export function showToast(message: string, type: Toast['type'] = 'info') {
  addToastGlobal?.(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
    return () => {
      addToastGlobal = null;
    };
  }, [addToast]);

  const typeStyles: Record<Toast['type'], string> = {
    success: 'border-success/30 bg-success-soft text-success',
    error: 'border-danger/30 bg-danger-soft text-danger',
    info: 'border-border bg-surface text-text-primary',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            'pointer-events-auto px-4 py-2.5 text-sm font-medium',
            'rounded-[var(--radius-lg)] border shadow-md',
            'animate-[slideUp_300ms_var(--ease-out)_forwards]',
            typeStyles[toast.type],
          ].join(' ')}
        >
          {toast.message}
        </div>
      ))}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
