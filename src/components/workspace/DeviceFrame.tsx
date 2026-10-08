import React from 'react';
import type { CSSProperties, ReactNode, Ref } from 'react';
import { Lock, RotateCw, ChevronLeft, ChevronRight, Signal, Wifi, BatteryFull } from 'lucide-react';
import type { StyleDataAttributes } from '../../engine/styleAttributes';
import { DEVICE_CHROME } from './device';
import type { DeviceKind } from './device';
import './DeviceFrame.css';

export interface DeviceFrameProps {
  kind: DeviceKind;
  /** Screen width in CSS px. A browser without a width is fluid and fills its container. */
  width?: number;
  /** Screen height in CSS px (for a phone browser, including its address bar). Fluid browsers fill the height. */
  height?: number;
  /** CSS zoom applied to the whole device, so it renders at true size and shrinks to fit. */
  scale?: number;
  /** Text in the address bar. */
  address?: string;
  /** A phone showing a mobile browser: status row and address bar above the page. */
  phoneBrowser?: boolean;
  /** Caption above the device (compare slot, style name). */
  label?: ReactNode;
  /** Draw a 100px ruler along the top of the screen. */
  rulers?: boolean;
  screenRef?: Ref<HTMLDivElement>;
  screenClassName?: string;
  /** Inline style for the screen, usually a style's resolved CSS variables. */
  screenStyle?: CSSProperties;
  /** The style's treatment attributes (data-style, data-family…), so treatments apply inside the screen. */
  screenAttrs?: StyleDataAttributes;
  className?: string;
  children: ReactNode;
}

/**
 * The one device frame of the app: a browser window, a tablet or a phone drawn
 * in chrome colours. Templates and Components both render through it.
 */
export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  kind, width, height, scale = 1, address, phoneBrowser = false, label, rulers, screenRef, screenClassName = '', screenStyle, screenAttrs, className = '', children
}) => {
  const fluid = kind === 'browser' && width === undefined;
  const screenHeight = phoneBrowser && height !== undefined ? height - DEVICE_CHROME.phoneBrowserBar : height;
  const screenSize: CSSProperties = fluid ? {} : { width, height: screenHeight };
  const rulerWidth = width ?? 1280;

  return (
    <figure className={`dv dv--${kind} ${fluid ? 'dv--fluid' : ''} ${className}`}>
      {label && <figcaption className="dv__label">{label}</figcaption>}
      <div className="dv__device" style={scale !== 1 ? { zoom: scale } : undefined}>
        {kind === 'browser' && (
          <div className="dv__bar" aria-hidden="true">
            <span className="dv__dots"><span /><span /><span /></span>
            <span className="dv__nav"><ChevronLeft size={14} /><ChevronRight size={14} /><RotateCw size={12} /></span>
            <span className="dv__url"><Lock size={11} />{address}</span>
          </div>
        )}
        {kind === 'phone' && phoneBrowser && (
          <div className="dv__mobile-bar" aria-hidden="true">
            <span className="dv__status"><span>9:41</span><span><Signal size={13} /><Wifi size={13} /><BatteryFull size={16} /></span></span>
            <span className="dv__url dv__url--mobile"><Lock size={11} />{address}</span>
          </div>
        )}
        <div className="dv__viewport" style={screenSize}>
          {rulers && (
            <div className="dv__rulers" aria-hidden="true">
              {Array.from({ length: Math.ceil(rulerWidth / 100) }, (_, i) => (
                <span key={i} className="dv__tick" style={{ left: i * 100 }}>{i * 100}</span>
              ))}
            </div>
          )}
          <div ref={screenRef} className={`dv__screen ${rulers ? 'dv__screen--grid' : ''} ${screenClassName}`} style={screenStyle} {...screenAttrs}>
            {children}
          </div>
        </div>
        {kind !== 'browser' && !phoneBrowser && <span className={`dv__camera dv__camera--${kind}`} aria-hidden="true" />}
        {kind === 'phone' && <span className="dv__home" aria-hidden="true" />}
      </div>
    </figure>
  );
};
