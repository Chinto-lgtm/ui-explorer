import React from 'react';
import type { ReactNode } from 'react';
import { Lock, RotateCw, ChevronLeft, ChevronRight, Signal, Wifi, BatteryFull } from 'lucide-react';
import type { FamilyDef } from '../../templates/nav';

/** Extra size the device adds around the screen, in CSS px at 100%. */
export const PHONE_BEZEL = 12;
export const BROWSER_BAR = 38;
/** The mobile landing family shows a phone browser: OS status row plus address bar. */
export const PHONE_BROWSER_BAR = 78;

export interface TemplateFrameProps {
  family: FamilyDef;
  screenId: string;
  /** CSS zoom applied to the whole device. */
  scale: number;
  /** Screen height for browser frames (they fill the stage); phones use the family height. */
  screenHeight?: number;
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}

const address = (family: FamilyDef, screenId: string) => `${family.host ?? 'orbit.money'}${screenId === 'home' ? '' : `/${screenId}`}`;

/**
 * A browser window or a phone drawn in chrome colours, rendered at the
 * template's true pixel size and zoomed to fit the stage.
 */
export const TemplateFrame: React.FC<TemplateFrameProps> = ({ family, screenId, scale, screenHeight, label, children, className = '' }) => {
  const isPhone = family.device === 'phone';
  const isPhoneBrowser = isPhone && family.id !== 'app';
  const height = isPhone ? family.height : (screenHeight ?? family.height);
  return (
    <figure className={`tp-frame tp-frame--${family.device} ${className}`}>
      {label && <figcaption className="tp-frame__label">{label}</figcaption>}
      <div className="tp-device" style={{ zoom: scale }}>
        {!isPhone && (
          <div className="tp-device__bar" aria-hidden="true">
            <span className="tp-device__dots"><span /><span /><span /></span>
            <span className="tp-device__nav"><ChevronLeft size={14} /><ChevronRight size={14} /><RotateCw size={12} /></span>
            <span className="tp-device__url"><Lock size={11} />{address(family, screenId)}</span>
          </div>
        )}
        {isPhoneBrowser && (
          <div className="tp-device__mobile-bar" aria-hidden="true">
            <span className="tp-device__status"><span>9:41</span><span><Signal size={13} /><Wifi size={13} /><BatteryFull size={16} /></span></span>
            <span className="tp-device__url tp-device__url--mobile"><Lock size={11} />{address(family, screenId)}</span>
          </div>
        )}
        <div className="tp-device__viewport" style={{ width: family.width, height: isPhoneBrowser ? height - PHONE_BROWSER_BAR : height }}>
          {children}
        </div>
        {isPhone && <span className="tp-device__island" aria-hidden="true" />}
        {isPhone && <span className="tp-device__home" aria-hidden="true" />}
      </div>
    </figure>
  );
};
