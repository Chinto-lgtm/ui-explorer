import React, { useState } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Marks a validated, accepted value. */
  success?: boolean;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  helperText,
  icon,
  iconPosition = 'left',
  className = '',
  id,
  disabled,
  type = 'text',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const showRightIcon = (icon && iconPosition === 'right') || success || isPassword;

  return (
    <div className={`ui-input-wrapper ${error ? 'ui-input-wrapper--error' : ''} ${success ? 'ui-input-wrapper--success' : ''} ${className}`}>
      {label && <label htmlFor={inputId} className="ui-input-label">{label}</label>}
      <div className="ui-input-container">
        {icon && iconPosition === 'left' && <span className="ui-input-icon ui-input-icon--left">{icon}</span>}
        <input
          id={inputId}
          type={isPassword && reveal ? 'text' : type}
          className={`ui-input ${icon && iconPosition === 'left' ? 'ui-input--has-icon-left' : ''} ${showRightIcon ? 'ui-input--has-icon-right' : ''}`}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            className="ui-input-icon ui-input-icon--right ui-input-icon--button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            aria-pressed={reveal}
            tabIndex={disabled ? -1 : 0}
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        ) : success ? (
          <span className="ui-input-icon ui-input-icon--right ui-input-icon--success"><Check size={16} /></span>
        ) : (
          icon && iconPosition === 'right' && <span className="ui-input-icon ui-input-icon--right">{icon}</span>
        )}
      </div>
      {error && <span className="ui-input-error">{error}</span>}
      {!error && helperText && <span className="ui-input-helper">{helperText}</span>}
    </div>
  );
};

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`ui-input-wrapper ${error ? 'ui-input-wrapper--error' : ''} ${className}`}>
      {label && <label htmlFor={textareaId} className="ui-input-label">{label}</label>}
      <textarea id={textareaId} className="ui-input ui-textarea" {...props} />
      {error && <span className="ui-input-error">{error}</span>}
      {!error && helperText && <span className="ui-input-helper">{helperText}</span>}
    </div>
  );
};
