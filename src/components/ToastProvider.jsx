import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_TYPES = {
  success: { icon: CheckCircle, bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  error: { icon: AlertTriangle, bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400' },
  info: { icon: Info, bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400' },
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]); // max 5 toasts
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur ?? 6000),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container — fixed bottom-center */}
      <div className="fixed bottom-20 left-0 right-0 z-[9999] flex flex-col items-center gap-2 px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const config = TOAST_TYPES[t.type] || TOAST_TYPES.info;
            const Icon = config.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`${config.bg} border ${config.border} backdrop-blur-md rounded-xl px-4 py-3 flex items-center gap-2.5 max-w-sm w-full shadow-lg pointer-events-auto`}
              >
                <Icon size={16} className={config.text} />
                <span className={`text-xs font-medium ${config.text} flex-1`}>{t.message}</span>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if used outside provider — silent no-ops
    return { success: () => {}, error: () => {}, warning: () => {}, info: () => {} };
  }
  return ctx;
}
