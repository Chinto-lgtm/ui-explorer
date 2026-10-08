import React, { useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { LabFrameContext, LabSharedContext } from './labContext';

export const LabStateProvider: React.FC<{ controlsHost: HTMLElement | null; setStatus: (text: string) => void; children: ReactNode }> = ({ controlsHost, setStatus, children }) => {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const set = useCallback((key: string, value: unknown) => setValues((prev) => ({ ...prev, [key]: value })), []);
  const value = useMemo(() => ({ values, set, controlsHost, setStatus }), [values, set, controlsHost, setStatus]);
  return <LabSharedContext.Provider value={value}>{children}</LabSharedContext.Provider>;
};

/** Marks one rendering of a section; only the primary one draws controls. */
export const LabFrame: React.FC<{ primary: boolean; children: ReactNode }> = ({ primary, children }) => (
  <LabFrameContext.Provider value={{ primary }}>{children}</LabFrameContext.Provider>
);

/** Section settings rendered into the page sidebar, once. */
export const LabControls: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { controlsHost } = useContext(LabSharedContext);
  const { primary } = useContext(LabFrameContext);
  return primary && controlsHost ? createPortal(children, controlsHost) : null;
};
