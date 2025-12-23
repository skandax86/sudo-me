'use client';

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// ============================================================================
// TOAST ITEM
// ============================================================================

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 2500);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const configs = {
    success: {
      bg: 'bg-emerald-500',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-500',
      icon: '✕',
    },
    info: {
      bg: 'bg-blue-500',
      icon: 'ℹ',
    },
    warning: {
      bg: 'bg-amber-500',
      icon: '⚠',
    },
  };

  const config = configs[toast.type];

  return (
    <div
      className={`${config.bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up`}
    >
      <span className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full text-sm font-bold">
        {config.icon}
      </span>
      <span className="font-medium">{toast.message}</span>
    </div>
  );
}

// ============================================================================
// TOAST PROVIDER
// ============================================================================

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success', duration?: number) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error', 4000), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ============================================================================
// CSS for animation (add to globals.css)
// ============================================================================
// @keyframes slide-up {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-slide-up {
//   animation: slide-up 0.2s ease-out;
// }

