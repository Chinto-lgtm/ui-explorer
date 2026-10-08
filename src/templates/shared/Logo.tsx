import React from 'react';
import { BRAND } from '../content';

/** The Orbit mark: a planet and its ring, drawn in the style's accent. */
export const OrbitMark: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="tpl-mark">
    <circle cx="12" cy="12" r="6" fill="var(--color-accent)" />
    <ellipse cx="12" cy="12" rx="11" ry="4.2" fill="none" stroke="var(--color-text-primary)" strokeWidth="1.6" transform="rotate(-24 12 12)" />
    <circle cx="20.4" cy="8.2" r="1.6" fill="var(--color-text-primary)" />
  </svg>
);

export const Logo: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <span className="tpl-logo"><OrbitMark size={size} /><span>{BRAND.name}</span></span>
);
