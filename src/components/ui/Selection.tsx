import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import './Selection.css';

/* ---------------------------------------------------------------- */
/* Checkbox                                                           */
/* ---------------------------------------------------------------- */

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
  indeterminate?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, description, indeterminate, className = '', id, disabled, ...props }) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = Boolean(indeterminate); }, [indeterminate]);
  return (
    <label className={`ui-check ${disabled ? 'ui-check--disabled' : ''} ${className}`} htmlFor={inputId}>
      <input ref={ref} id={inputId} type="checkbox" className="ui-check__input" disabled={disabled} {...props} />
      <span className="ui-check__box" aria-hidden="true"><Check size={12} strokeWidth={3} /></span>
      {(label || description) && (
        <span className="ui-check__text">
          {label && <span className="ui-check__label">{label}</span>}
          {description && <span className="ui-check__desc">{description}</span>}
        </span>
      )}
    </label>
  );
};

/* ---------------------------------------------------------------- */
/* Radio                                                              */
/* ---------------------------------------------------------------- */

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
}

export const Radio: React.FC<RadioProps> = ({ label, description, className = '', id, disabled, ...props }) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label className={`ui-check ui-check--radio ${disabled ? 'ui-check--disabled' : ''} ${className}`} htmlFor={inputId}>
      <input id={inputId} type="radio" className="ui-check__input" disabled={disabled} {...props} />
      <span className="ui-check__box ui-check__box--radio" aria-hidden="true"><span className="ui-check__dot" /></span>
      {(label || description) && (
        <span className="ui-check__text">
          {label && <span className="ui-check__label">{label}</span>}
          {description && <span className="ui-check__desc">{description}</span>}
        </span>
      )}
    </label>
  );
};

/* ---------------------------------------------------------------- */
/* Toggle                                                             */
/* ---------------------------------------------------------------- */

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled, size = 'md', className = '' }) => (
  <label className={`ui-toggle ui-toggle--${size} ${disabled ? 'ui-toggle--disabled' : ''} ${className}`}>
    <input
      type="checkbox"
      role="switch"
      className="ui-toggle__input"
      checked={checked}
      disabled={disabled}
      aria-checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className="ui-toggle__track" aria-hidden="true"><span className="ui-toggle__thumb" /></span>
    {label && <span className="ui-toggle__label">{label}</span>}
  </label>
);

/* ---------------------------------------------------------------- */
/* Slider                                                             */
/* ---------------------------------------------------------------- */

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  format?: (v: number) => string;
  disabled?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({ value, onChange, min = 0, max = 100, step = 1, label, showValue = true, format, disabled, className = '' }) => {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={`ui-slider ${disabled ? 'ui-slider--disabled' : ''} ${className}`}>
      {(label || showValue) && (
        <div className="ui-slider__head">
          {label && <label htmlFor={id} className="ui-slider__label">{label}</label>}
          {showValue && <span className="ui-slider__value">{format ? format(value) : value}</span>}
        </div>
      )}
      <input
        id={id}
        type="range"
        className="ui-slider__input"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        style={{ '--slider-pct': `${pct}%` } as React.CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Segmented control                                                  */
/* ---------------------------------------------------------------- */

export interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; disabled?: boolean }[];
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function Segmented<T extends string>({ value, onChange, options, label, size = 'md', className = '' }: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    let next = index;
    for (let i = 0; i < options.length; i++) {
      next = (next + dir + options.length) % options.length;
      if (!options[next].disabled) break;
    }
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div className={`ui-segmented ui-segmented--${size} ${className}`} role="radiogroup" aria-label={label}>
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => { refs.current[i] = el; }}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          tabIndex={value === o.value ? 0 : -1}
          disabled={o.disabled}
          className={`ui-segmented__btn ${value === o.value ? 'ui-segmented__btn--active' : ''}`}
          onClick={() => onChange(o.value)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Select (custom listbox) and Combobox                               */
/* ---------------------------------------------------------------- */

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface BaseSelectProps {
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export interface SelectProps extends BaseSelectProps {
  value: string | null;
  onChange: (value: string) => void;
}

/** A listbox-based select: keyboard navigable, styled entirely by tokens (no native popup). */
export const Select: React.FC<SelectProps> = ({ options, value, onChange, label, placeholder = 'Select…', disabled, error, className = '' }) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number>(() => Math.max(0, options.findIndex((o) => o.value === value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const commit = (index: number) => {
    const o = options[index];
    if (!o || o.disabled) return;
    onChange(o.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); if (!open) setOpen(true); else setActive((i) => Math.min(i + 1, options.length - 1)); break;
      case 'ArrowUp': e.preventDefault(); if (!open) setOpen(true); else setActive((i) => Math.max(i - 1, 0)); break;
      case 'Home': if (open) { e.preventDefault(); setActive(0); } break;
      case 'End': if (open) { e.preventDefault(); setActive(options.length - 1); } break;
      case 'Enter': case ' ': e.preventDefault(); if (open) commit(active); else setOpen(true); break;
      case 'Escape': if (open) { e.preventDefault(); setOpen(false); } break;
      default: break;
    }
  };

  return (
    <div className={`ui-select ${disabled ? 'ui-select--disabled' : ''} ${error ? 'ui-select--error' : ''} ${className}`} ref={rootRef}>
      {label && <span className="ui-input-label" id={`${id}-label`}>{label}</span>}
      <button
        type="button"
        className={`ui-select__trigger ${open ? 'ui-select__trigger--open' : ''}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
      >
        <span className={`ui-select__value ${selected ? '' : 'ui-select__value--placeholder'}`}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={16} className="ui-select__chevron" aria-hidden="true" />
      </button>
      {open && (
        <ul className="ui-select__list" role="listbox" id={`${id}-list`}>
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={o.value === value}
              aria-disabled={o.disabled}
              className={`ui-select__option ${i === active ? 'ui-select__option--active' : ''} ${o.value === value ? 'ui-select__option--selected' : ''} ${o.disabled ? 'ui-select__option--disabled' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(i)}
            >
              <span className="ui-select__option-text">
                <span>{o.label}</span>
                {o.description && <span className="ui-select__option-desc">{o.description}</span>}
              </span>
              {o.value === value && <Check size={14} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
      {error && <span className="ui-input-error">{error}</span>}
    </div>
  );
};

export interface MultiSelectProps extends BaseSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange, label, placeholder = 'Select…', disabled, className = '' }) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); if (!open) setOpen(true); else setActive((i) => Math.min(i + 1, options.length - 1)); break;
      case 'ArrowUp': e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); break;
      case 'Enter': case ' ': e.preventDefault(); if (open) toggle(options[active].value); else setOpen(true); break;
      case 'Escape': setOpen(false); break;
      default: break;
    }
  };

  return (
    <div className={`ui-select ${disabled ? 'ui-select--disabled' : ''} ${className}`} ref={rootRef}>
      {label && <span className="ui-input-label" id={`${id}-label`}>{label}</span>}
      <button
        type="button"
        className={`ui-select__trigger ${open ? 'ui-select__trigger--open' : ''}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-multiselectable="true"
        aria-labelledby={label ? `${id}-label` : undefined}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
      >
        <span className="ui-select__chips">
          {value.length === 0 && <span className="ui-select__value--placeholder">{placeholder}</span>}
          {value.map((v) => (
            <span key={v} className="ui-select__chip">
              {options.find((o) => o.value === v)?.label ?? v}
              <span role="button" tabIndex={-1} className="ui-select__chip-remove" aria-label={`Remove ${v}`} onClick={(e) => { e.stopPropagation(); toggle(v); }}><X size={10} /></span>
            </span>
          ))}
        </span>
        <ChevronDown size={16} className="ui-select__chevron" aria-hidden="true" />
      </button>
      {open && (
        <ul className="ui-select__list" role="listbox" aria-multiselectable="true">
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={value.includes(o.value)}
              className={`ui-select__option ${i === active ? 'ui-select__option--active' : ''} ${value.includes(o.value) ? 'ui-select__option--selected' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggle(o.value)}
            >
              <span className={`ui-check__box ${value.includes(o.value) ? 'ui-check__box--on' : ''}`} aria-hidden="true"><Check size={12} strokeWidth={3} /></span>
              <span className="ui-select__option-text">{o.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export interface ComboboxProps extends BaseSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  emptyText?: string;
}

/** Searchable select: type to filter, arrow keys to move, Enter to choose. */
export const Combobox: React.FC<ComboboxProps> = ({ options, value, onChange, label, placeholder = 'Search…', disabled, emptyText = 'No matches', className = '' }) => {
  const id = useId();
  const selected = options.find((o) => o.value === value);
  const [query, setQueryState] = useState(selected?.label ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  // Typing resets the highlighted row; no effect needed.
  const setQuery = (q: string) => { setQueryState(q); setActive(0); };
  // When the selected value changes from outside, mirror it into the input during render.
  const [seenValue, setSeenValue] = useState(value);
  if (seenValue !== value) { setSeenValue(value); setQueryState(selected?.label ?? ''); }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) { setOpen(false); setQuery(selected?.label ?? ''); } };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, selected]);

  const commit = (o?: SelectOption) => {
    if (!o) return;
    onChange(o.value);
    setQuery(o.label);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, filtered.length - 1)); break;
      case 'ArrowUp': e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); break;
      case 'Enter': e.preventDefault(); commit(filtered[active]); break;
      case 'Escape': setOpen(false); setQuery(selected?.label ?? ''); break;
      default: break;
    }
  };

  return (
    <div className={`ui-select ui-combobox ${disabled ? 'ui-select--disabled' : ''} ${className}`} ref={rootRef}>
      {label && <label htmlFor={id} className="ui-input-label">{label}</label>}
      <div className="ui-combobox__field">
        <Search size={16} className="ui-combobox__icon" aria-hidden="true" />
        <input
          id={id}
          className="ui-input ui-combobox__input"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-activedescendant={open && filtered[active] ? `${id}-opt-${active}` : undefined}
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {value && (
          <button type="button" className="ui-combobox__clear" aria-label="Clear" onClick={() => { onChange(null); setQuery(''); }}><X size={14} /></button>
        )}
      </div>
      {open && (
        <ul className="ui-select__list" role="listbox" id={`${id}-list`}>
          {filtered.length === 0 && <li className="ui-select__empty">{emptyText}</li>}
          {filtered.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={o.value === value}
              className={`ui-select__option ${i === active ? 'ui-select__option--active' : ''} ${o.value === value ? 'ui-select__option--selected' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(o)}
            >
              <span className="ui-select__option-text">{o.label}</span>
              {o.value === value && <Check size={14} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
