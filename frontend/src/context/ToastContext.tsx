import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconPlayerPlayFilled, IconCircleCheck, IconAlertTriangle, IconX } from '@tabler/icons-react';

type ToastVariant = 'default' | 'success' | 'error';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  variant?: ToastVariant;
  action?: ToastAction;
  duration?: number;
}

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const VARIANT_ICON: Record<ToastVariant, React.ReactNode> = {
  default: <IconPlayerPlayFilled className="w-3.5 h-3.5 text-spotlight" />,
  success: <IconCircleCheck className="w-4 h-4 text-mint-400" />,
  error: <IconAlertTriangle className="w-4 h-4 text-spotlight" />,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    const id = crypto.randomUUID();
    const variant = options?.variant ?? 'default';
    const duration = options?.duration ?? (options?.action ? 6000 : 4000);
    setToasts((prev) => [...prev, { id, message, variant, action: options?.action }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              role="status"
              className="flex items-center gap-2.5 bg-surface text-white text-sm font-medium pl-4 pr-2.5 py-2.5 rounded-full shadow-lg max-w-sm"
            >
              {VARIANT_ICON[toast.variant]}
              <span className="flex-1">{toast.message}</span>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => { toast.action?.onClick(); dismiss(toast.id); }}
                  className="text-mint-300 font-semibold hover:text-mint-200 transition-colors shrink-0 px-1"
                >
                  {toast.action.label}
                </button>
              )}
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}
                className="text-muted hover:text-white transition-colors shrink-0 p-1"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
