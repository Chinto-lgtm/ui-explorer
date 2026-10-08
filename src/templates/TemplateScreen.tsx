import React, { useMemo } from 'react';
import type { StyleDefinition } from '../engine/types';
import { getStyleDataAttributes } from '../engine/styleAttributes';
import { ToastProvider } from '../components/ui/Feedback';
import { TemplateNavContext } from './nav';
import type { FamilyDef } from './nav';
import './shared/templates.css';

export interface TemplateScreenProps {
  family: FamilyDef;
  screenId: string;
  style: StyleDefinition;
  vars: Record<string, string>;
  go: (screen: string) => void;
  interactive?: boolean;
  screenRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

/**
 * One rendered template screen: the themed container (style variables and
 * treatment attributes), the template's navigation, toasts, and the family's
 * shared layout around the screen. Overlays portal into this container, so
 * modals and sheets stay inside the device frame.
 */
export const TemplateScreen: React.FC<TemplateScreenProps> = ({ family, screenId, style, vars, go, interactive = true, screenRef, className = '' }) => {
  const screen = family.screens.find((s) => s.id === screenId) ?? family.screens[0];
  const nav = useMemo(() => ({ family: family.id, screen: screen.id, go: interactive ? go : () => undefined, interactive }), [family.id, screen.id, go, interactive]);
  const { Layout, device } = family;
  const Screen = screen.Component;
  return (
    <div
      ref={screenRef}
      className={`tpl-screen tpl-screen--${device} ${interactive ? '' : 'tpl-screen--static'} ${className}`}
      style={vars as React.CSSProperties}
      {...getStyleDataAttributes(style)}
    >
      <TemplateNavContext.Provider value={nav}>
        <ToastProvider position={device === 'phone' ? 'bottom-center' : 'bottom-right'}>
          <Layout>
            <Screen key={screen.id} />
          </Layout>
        </ToastProvider>
      </TemplateNavContext.Provider>
    </div>
  );
};
