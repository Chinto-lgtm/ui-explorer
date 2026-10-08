import React from 'react';
import type { ReactNode } from 'react';
import { Backdrop } from '../../components/svg/Backdrop';
import type { BackdropPreset } from '../../components/svg/Backdrop';
import { useUserImage } from '../userImage';

const PRESETS: BackdropPreset[] = ['mesh', 'aurora', 'blob', 'wave', 'geometric', 'glow', 'ring', 'grid', 'liquid', 'confetti'];

export interface MediaProps {
  /** Picks the placeholder art; the same seed always draws the same picture. */
  seed: number;
  /** Describes the picture for screen readers. */
  label: string;
  icon?: ReactNode;
  /** CSS aspect-ratio, e.g. "16 / 9". Omit to fill the parent. */
  ratio?: string;
  preset?: BackdropPreset;
  className?: string;
}

/**
 * An image slot. Without a visitor image it draws style-driven SVG art (no
 * bundled photos); with one (see userImage.ts) it shows that image instead.
 */
export const Media: React.FC<MediaProps> = ({ seed, label, icon, ratio, preset, className = '' }) => {
  const image = useUserImage();
  return (
    <div className={`tpl-media ${ratio ? '' : 'tpl-media--fill'} ${className}`} style={ratio ? { aspectRatio: ratio } : undefined} role="img" aria-label={image ? `${label} (your image)` : label}>
      {image ? (
        <img className="tpl-media__img" src={image.url} alt="" />
      ) : (
        <>
          <Backdrop preset={preset ?? PRESETS[seed % PRESETS.length]} seed={seed * 37 + 11} intensity={0.55} density={0.5} className="tpl-media__art" />
          {icon && <span className="tpl-media__icon" aria-hidden="true">{icon}</span>}
        </>
      )}
    </div>
  );
};
