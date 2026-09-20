import React from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  className = '',
  id,
  disabled,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`ui-input-wrapper ${error ? 'ui-input-wrapper--error' : ''} ${className}`}>
      {label && <label htmlFor={inputId} className="ui-input-label">{label}</label>}
      <div className="ui-input-container">
        {icon && iconPosition === 'left' && <span className="ui-input-icon ui-input-icon--left">{icon}</span>}
        <input
          id={inputId}
          className={`ui-input ${icon ? `ui-input--has-icon-${iconPosition}` : ''}`}
          disabled={disabled}
          {...props}
        />
        {icon && iconPosition === 'right' && <span className="ui-input-icon ui-input-icon--right">{icon}</span>}
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
