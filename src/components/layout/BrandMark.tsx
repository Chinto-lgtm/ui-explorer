import React, { useId } from 'react';
import './BrandMark.css';

/**
 * The UI Explorer mark: three style cards fanned from one point — the same
 * interface in different design languages. Colours come from the brand tokens
 * in src/theme.css; public/favicon.svg is the same drawing with those values.
 */
export const BrandMark: React.FC<{ size?: number; className?: string; title?: string }> = ({ size = 28, className = '', title }) => {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={`brand-mark ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--chrome-brand-tile)" />
          <stop offset="1" stopColor="var(--chrome-bg)" />
        </linearGradient>
        <linearGradient id={`${id}-front`} x1="20" y1="15" x2="44" y2="51" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--chrome-brand-cyan)" />
          <stop offset="1" stopColor="var(--chrome-brand-cyan-deep)" />
        </linearGradient>
        <linearGradient id={`${id}-left`} x1="20" y1="15" x2="44" y2="51" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--chrome-brand-violet)" />
          <stop offset="1" stopColor="var(--chrome-brand-violet-deep)" />
        </linearGradient>
        <linearGradient id={`${id}-right`} x1="20" y1="15" x2="44" y2="51" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--chrome-brand-pink)" />
          <stop offset="1" stopColor="var(--chrome-brand-pink-deep)" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${id}-bg)`} />
      <rect x="0.5" y="0.5" width="63" height="63" rx="14.5" className="brand-mark__edge" />
      <g className="brand-mark__cards">
        <rect x="20" y="15" width="24" height="33" rx="6" fill={`url(#${id}-left)`} className="brand-mark__card brand-mark__card--left" />
        <rect x="20" y="15" width="24" height="33" rx="6" fill={`url(#${id}-right)`} className="brand-mark__card brand-mark__card--right" />
        <rect x="20" y="15" width="24" height="33" rx="6" fill={`url(#${id}-front)`} />
        <rect x="24" y="20.5" width="9" height="3.4" rx="1.7" fill="var(--chrome-brand-ink)" />
        <rect x="24" y="26.5" width="16" height="3.4" rx="1.7" fill="var(--chrome-brand-ink)" fillOpacity="0.45" />
        <circle cx="35.5" cy="39.5" r="4.6" fill="var(--chrome-brand-ink)" />
      </g>
    </svg>
  );
};

/** Mark plus wordmark: a gradient "UI" and a solid "Explorer". */
export const BrandLockup: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <span className={`brand-lockup ${className}`} style={{ '--brand-size': `${size}px` } as React.CSSProperties}>
    <BrandMark size={size} />
    <span className="brand-lockup__word"><span className="brand-lockup__ui">UI</span> Explorer</span>
  </span>
);
