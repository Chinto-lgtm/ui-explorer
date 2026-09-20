import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { StyleDefinition } from './types';
import { registry } from './registry';
import { resolveStyleToCssVars } from './resolver';
import { allStyles } from '../styles'; // Ensures all styles register

interface StyleContextType {
  currentStyle: StyleDefinition;
  setStyle: (styleId: string) => void;
  availableStyles: StyleDefinition[];
  resolvedCssVars: Record<string, string>;
  customStyles: StyleDefinition[];
  addCustomStyle: (style: StyleDefinition) => void;
  deleteCustomStyle: (styleId: string) => void;
  compareStyle?: StyleDefinition;
  setCompareStyle: (style: StyleDefinition | undefined) => void;
  isCompareActive: boolean;
  setIsCompareActive: (active: boolean) => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const StyleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStyleId, setCurrentStyleId] = useState<string>(() => {
    return localStorage.getItem('ui_explorer_style_id') || 'neumorphism';
  });

  const [customStyles, setCustomStyles] = useState<StyleDefinition[]>(() => {
    const saved = localStorage.getItem('ui_explorer_custom_styles');
    return saved ? JSON.parse(saved) : [];
  });

  const [compareStyleId, setCompareStyleId] = useState<string | undefined>(undefined);
  const [isCompareActive, setIsCompareActive] = useState<boolean>(false);

  // Register custom styles in registry
  useEffect(() => {
    customStyles.forEach((s) => registry.register(s));
  }, [customStyles]);

  const currentStyle = useMemo(() => {
    return registry.get(currentStyleId) || allStyles[0];
  }, [currentStyleId, customStyles]);

  const compareStyle = useMemo(() => {
    return compareStyleId ? registry.get(compareStyleId) : undefined;
  }, [compareStyleId, customStyles]);

  const resolvedCssVars = useMemo(() => {
    return resolveStyleToCssVars(currentStyle);
  }, [currentStyle]);

  const setStyle = (styleId: string) => {
    if (registry.has(styleId)) {
      setCurrentStyleId(styleId);
      localStorage.setItem('ui_explorer_style_id', styleId);
    }
  };

  const addCustomStyle = (style: StyleDefinition) => {
    registry.register(style);
    setCustomStyles((prev) => {
      const filtered = prev.filter((s) => s.metadata.id !== style.metadata.id);
      const updated = [...filtered, style];
      localStorage.setItem('ui_explorer_custom_styles', JSON.stringify(updated));
      return updated;
    });
    setCurrentStyleId(style.metadata.id);
  };

  const deleteCustomStyle = (styleId: string) => {
    registry.unregister(styleId);
    setCustomStyles((prev) => {
      const updated = prev.filter((s) => s.metadata.id !== styleId);
      localStorage.setItem('ui_explorer_custom_styles', JSON.stringify(updated));
      return updated;
    });
    if (currentStyleId === styleId) {
      setStyle('neumorphism');
    }
  };

  const setCompareStyle = (style: StyleDefinition | undefined) => {
    setCompareStyleId(style ? style.metadata.id : undefined);
  };

  return (
    <StyleContext.Provider
      value={{
        currentStyle,
        setStyle,
        availableStyles: registry.getAll(),
        resolvedCssVars,
        customStyles,
        addCustomStyle,
        deleteCustomStyle,
        compareStyle,
        setCompareStyle,
        isCompareActive,
        setIsCompareActive,
      }}
    >
      {children}
    </StyleContext.Provider>
  );
};

export const useStyleContext = (): StyleContextType => {
  const ctx = useContext(StyleContext);
  if (!ctx) {
    throw new Error('useStyleContext must be used within a StyleProvider');
  }
  return ctx;
};
