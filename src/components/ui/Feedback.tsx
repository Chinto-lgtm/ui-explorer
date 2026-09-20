import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X, Inbox } from 'lucide-react';
import './Feedback.css';

export type Tone = 'info' | 'success' | 'warning' | 'error';

const TONE_ICON: Record<Tone, ReactNode> = {
  info: <Info size={18} />,
  success: <CheckCircle2 size={18} />,
  warning: <AlertTriangle size={18} />,
  error: <XCircle size={18} />
};

/* ---------------------------------------------------------------- */
/* Alert                                                              */
/* ---------------------------------------------------------------- */

export interface AlertProps {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  action?: ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ tone = 'info', title, children, onClose, action, className = '' }) => (
  <div className={`ui-alert ui-alert--${tone} ${className}`} role={tone === 'error' ? 'alert' : 'status'}>
    <span className="ui-alert__icon" aria-hidden="true">{TONE_ICON[tone]}</span>
    <div className="ui-alert__body">
      {title && <div className="ui-alert__title">{title}</div>}
      {children && <div className="ui-alert__text">{children}</div>}
      {action && <div className="ui-alert__action">{action}</div>}
    </div>
    {onClose && (
      <button type="button" className="ui-alert__close" onClick={onClose} aria-label="Dismiss"><X size={16} /></button>
    )}
  </div>
);

/* ---------------------------------------------------------------- */
/* Toasts                                                             */
/* ---------------------------------------------------------------- */

export interface ToastOptions {
  tone?: Tone;
  title: string;
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastRecord extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside a ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: ReactNode; position?: 'top-right' | 'bottom-right' | 'bottom-center' }> = ({ children, position = 'bottom-right' }) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  const toast = useCallback((options: ToastOptions) => {
    counter.current += 1;
    const id = counter.current;
    setToasts((prev) => [...prev, { id, ...options }]);
    const duration = options.duration ?? 4500;
    if (duration > 0) window.setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={`ui-toaster ui-toaster--${position}`} aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <div key={t.id} className={`ui-toast ui-toast--${t.tone ?? 'info'}`} role="status">
            <span className="ui-toast__icon" aria-hidden="true">{TONE_ICON[t.tone ?? 'info']}</span>
            <div className="ui-toast__body">
              <div className="ui-toast__title">{t.title}</div>
              {t.description && <div className="ui-toast__desc">{t.description}</div>}
              {t.action && (
                <button type="button" className="ui-toast__action" onClick={() => { t.action?.onClick(); dismiss(t.id); }}>{t.action.label}</button>
              )}
            </div>
            <button type="button" className="ui-toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss"><X size={14} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/* ---------------------------------------------------------------- */
/* Progress                                                           */
/* ---------------------------------------------------------------- */

export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  tone?: 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  indeterminate?: boolean;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, max = 100, label, showValue = true, tone = 'accent', size = 'md', indeterminate, className = '' }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`ui-progress ui-progress--${size} ui-progress--${tone} ${className}`}>
      {(label || showValue) && (
        <div className="ui-progress__head">
          {label && <span className="ui-progress__label">{label}</span>}
          {showValue && !indeterminate && <span className="ui-progress__value">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="ui-progress__track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={indeterminate ? undefined : value}>
        <div className={`ui-progress__fill ${indeterminate ? 'ui-progress__fill--indeterminate' : ''}`} style={indeterminate ? undefined : { width: `${pct}%` }} />
      </div>
    </div>
  );
};

export interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  tone?: 'accent' | 'success' | 'warning' | 'error';
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ value, size = 72, strokeWidth = 8, label, tone = 'accent', className = '' }) => {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={`ui-ring ui-ring--${tone} ${className}`} style={{ width: size, height: size }} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle className="ui-ring__track" cx={size / 2} cy={size / 2} r={r} strokeWidth={strokeWidth} fill="none" />
        <circle
          className="ui-ring__fill"
          cx={size / 2} cy={size / 2} r={r} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ui-ring__value">{Math.round(pct)}%</span>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Skeleton / Spinner / Empty state                                   */
/* ---------------------------------------------------------------- */

export const Skeleton: React.FC<{ width?: string | number; height?: string | number; circle?: boolean; className?: string }> = ({ width = '100%', height = '1rem', circle, className = '' }) => (
  <span className={`ui-skeleton ${circle ? 'ui-skeleton--circle' : ''} ${className}`} style={{ width, height }} aria-hidden="true" />
);

export const Spinner: React.FC<{ size?: number; label?: string; className?: string }> = ({ size = 20, label = 'Loading', className = '' }) => (
  <span className={`ui-spinner ${className}`} style={{ width: size, height: size }} role="status" aria-label={label} />
);

export const EmptyState: React.FC<{ icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }> = ({ icon, title, description, action, className = '' }) => (
  <div className={`ui-empty ${className}`}>
    <span className="ui-empty__icon" aria-hidden="true">{icon ?? <Inbox size={28} />}</span>
    <div className="ui-empty__title">{title}</div>
    {description && <p className="ui-empty__desc">{description}</p>}
    {action && <div className="ui-empty__action">{action}</div>}
  </div>
);

/** Small helper so lab demos can show a live countdown without extra state plumbing. */
export function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback);
  useEffect(() => { saved.current = callback; }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => saved.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}
