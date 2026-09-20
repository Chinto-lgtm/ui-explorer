import React, { useMemo } from 'react';
import type { StyleDefinition } from '../../engine/types';
import { resolveStyleToCssVars } from '../../engine/resolver';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import './StylePreviewCard.css';

export interface StylePreviewCardProps {
  style: StyleDefinition;
  /** "hero" renders a full-size sample; "thumb" a compact tile. */
  size?: 'hero' | 'thumb';
  onClick?: () => void;
  className?: string;
}

const SAMPLE_BARS = [38, 62, 46, 84, 70, 96, 58];

/**
 * A miniature live interface rendered with the real component system under a given style.
 * There is one source of truth: if the style changes, the preview changes.
 */
export const StylePreviewCard: React.FC<StylePreviewCardProps> = ({ style, size = 'thumb', onClick, className = '' }) => {
  const vars = useMemo(() => resolveStyleToCssVars(style), [style]);
  const isHero = size === 'hero';
  const isInteractive = Boolean(onClick);

  // A clickable preview acts as one button; its sample controls are inert so buttons never nest.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`style-preview style-preview--${size} ${className}`}
      style={vars as React.CSSProperties}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `Open ${style.metadata.name}` : undefined}
    >
      <div className="style-preview__surface" inert={isInteractive || undefined}>
        <div className="style-preview__head">
          <span className="style-preview__title">{isHero ? 'Revenue overview' : style.metadata.name}</span>
          <Badge variant="accent" size="sm">{isHero ? 'Live' : style.metadata.category}</Badge>
        </div>

        <div className="style-preview__value">{isHero ? '$128,450' : '$128k'}</div>

        <div className="style-preview__bars" aria-hidden="true">
          {SAMPLE_BARS.map((h, i) => (
            <span key={i} className="style-preview__bar" style={{ height: `${h}%` }} />
          ))}
        </div>

        <div className="style-preview__actions">
          <Button variant="primary" size="sm">{isHero ? 'Export report' : 'Primary'}</Button>
          <Button variant="outline" size="sm">{isHero ? 'Share' : 'Outline'}</Button>
        </div>

        {isHero && (
          <div className="style-preview__field">
            <span className="style-preview__field-label">Email</span>
            <div className="style-preview__input">alex@example.com</div>
          </div>
        )}
      </div>
    </div>
  );
};
