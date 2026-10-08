import React from 'react';
import type { ReactNode } from 'react';
import type { FamilyDef } from '../../templates/nav';
import { DeviceFrame } from '../../components/workspace/DeviceFrame';

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

/** A template screen in the app's shared device frame, at the template's true pixel size. */
export const TemplateFrame: React.FC<TemplateFrameProps> = ({ family, screenId, scale, screenHeight, label, children, className = '' }) => {
  const isPhone = family.device === 'phone';
  return (
    <DeviceFrame
      kind={isPhone ? 'phone' : 'browser'}
      width={family.width}
      height={isPhone ? family.height : (screenHeight ?? family.height)}
      scale={scale}
      address={address(family, screenId)}
      phoneBrowser={isPhone && family.id !== 'app'}
      label={label}
      className={className}
      screenClassName="tp-viewport"
    >
      {children}
    </DeviceFrame>
  );
};
