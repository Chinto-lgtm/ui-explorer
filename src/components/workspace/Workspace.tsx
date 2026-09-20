import React from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import '../layout/Workspace.css';

/** Collapsible settings group. Native <details> keeps keyboard and screen-reader behaviour. */
export const WorkspaceSection: React.FC<{ title: string; icon: ReactNode; defaultOpen?: boolean; children: ReactNode }> = ({
  title, icon, defaultOpen = true, children
}) => (
  <details className="ws-section" open={defaultOpen}>
    <summary className="ws-section__summary">
      <span className="ws-section__icon">{icon}</span>
      <span className="ws-section__title">{title}</span>
      <ChevronDown size={14} className="ws-section__chevron" aria-hidden="true" />
    </summary>
    <div className="ws-section__body">{children}</div>
  </details>
);

/** Native checkbox visually rendered as a switch. */
export const WorkspaceSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: ReactNode; disabled?: boolean }> = ({
  checked, onChange, label, disabled
}) => (
  <label className="ws-switch">
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    <span className="ws-switch__track" aria-hidden="true"><span className="ws-switch__thumb" /></span>
    <span className="ws-switch__text">{label}</span>
  </label>
);

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  title?: string;
}

/** Exclusive choice rendered as a segmented control with aria-pressed buttons. */
export function WorkspaceSegmented<T extends string>({ value, options, onChange, label, columns }: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (v: T) => void;
  label: string;
  columns?: number;
}) {
  return (
    <div className="ws-segmented" role="group" aria-label={label} style={columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`ws-segmented__btn ${value === o.value ? 'ws-segmented__btn--active' : ''}`}
          aria-pressed={value === o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
