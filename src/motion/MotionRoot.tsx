import React from 'react';
import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { useStyle } from '../hooks/useStyle';
import { EASE_OUT } from './presets';

/**
 * Applies one motion policy to every animation in the app: the visitor's
 * "Reduce motion" setting wins, otherwise the operating system preference is
 * respected (movement is dropped, fades stay).
 */
export const MotionRoot: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings } = useStyle();
  return (
    <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'user'} transition={{ duration: 0.28, ease: EASE_OUT }}>
      {children}
    </MotionConfig>
  );
};
