import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import clsx from 'clsx';
import { createToastId } from '../../lib/ids';
import { ToastContext, type Toast, type ToastApi, type ToastTone } from './toastContext';

const TONES: Record<ToastTone, { ring: string; icon: ReactNode }> = {
  success: {
    ring: 'border-emerald-800 bg-emerald-950/90',
    icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />,
  },
  error: {
    ring: 'border-rose-800 bg-rose-950/90',
    icon: <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden />,
  },
  info: {
    ring: 'border-slate-700 bg-slate-900/95',
    icon: <Info className="h-4 w-4 shrink-0 text-blue-400" aria-hidden />,
  },
};

/** Replaces the 11 blocking `alert()` calls in the original. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (tone: ToastTone, title: string, body?: string) => {
      const id = createToastId();
      setToasts((prev) => [...prev.slice(-3), { id, tone, title, body }]);
      // Errors linger; they usually carry something the user must read.
      const ttl = tone === 'error' ? 8000 : 4500;
      timers.current.set(id, window.setTimeout(() => dismiss(id), ttl));
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, body) => push('success', title, body),
      error: (title, body) => push('error', title, body),
      info: (title, body) => push('info', title, body),
      dismiss,
    }),
    [push, dismiss],
  );

  // Mounted only after hydration so the portal target exists during SSR-less
  // first render, and so the node is created once.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const viewport = (
    <div
        className="pointer-events-none fixed inset-x-3 bottom-3 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:top-20 sm:w-80"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
            className={clsx(
              'pointer-events-auto flex items-start gap-2.5 rounded-xl border p-3 shadow-2xl backdrop-blur',
              'motion-safe:animate-scale-in',
              TONES[toast.tone].ring,
            )}
          >
            {TONES[toast.tone].icon}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-100">{toast.title}</p>
              {toast.body && (
                <p className="mt-0.5 break-words text-[11px] leading-relaxed text-slate-400">
                  {toast.body}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-0.5 text-slate-500 transition hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        ))}
    </div>
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Portalled to <body>, deliberately, for two reasons: it keeps the
          live region out of #root — which Radix marks aria-hidden while a
          dialog is open — and it lets a toast paint above a modal overlay
          instead of being trapped beneath it in the app's stacking context. */}
      {mounted && createPortal(viewport, document.body)}
    </ToastContext.Provider>
  );
}
