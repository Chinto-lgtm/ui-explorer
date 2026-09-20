import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { StyleDefinition } from './types';
import { registry } from './registry';
import { resolveStyleToCssVars } from './resolver';
import { coerceStyleDefinition } from './validate';
import { STORAGE_KEYS, readJson, readString, writeJson, writeString } from './storage';
import { allStyles } from '../styles'; // Ensures all styles register

export const DEFAULT_STYLE_ID = 'neumorphism';

/** User preferences that shape how every style is rendered. */
export interface UserSettings {
  /** Force reduced motion regardless of the OS setting. */
  reduceMotion: boolean;
  /** 0.5 = calmer, 1 = as designed, 1.5 = more expressive. */
  motionIntensity: 0.5 | 1 | 1.5;
  /** Stronger blur, glow and shadows. Clearly labelled as experimental. */
  experimental: boolean;
}

const DEFAULT_SETTINGS: UserSettings = { reduceMotion: false, motionIntensity: 1, experimental: false };

const MAX_RECENT_STYLES = 8;

interface StyleContextType {
  currentStyle: StyleDefinition;
  setStyle: (styleId: string) => void;
  availableStyles: StyleDefinition[];
  resolvedCssVars: Record<string, string>;

  customStyles: StyleDefinition[];
  addCustomStyle: (style: StyleDefinition) => void;
  deleteCustomStyle: (styleId: string) => void;
  renameCustomStyle: (styleId: string, name: string, description?: string, tags?: string[]) => void;
  duplicateStyle: (styleId: string) => StyleDefinition | undefined;

  /** A transient style shown in the canvas without being saved (generator, mixer). */
  previewStyle?: StyleDefinition;
  setPreviewStyle: (style: StyleDefinition | undefined) => void;

  favoriteIds: string[];
  toggleFavorite: (styleId: string) => void;
  isFavorite: (styleId: string) => boolean;
  recentStyleIds: string[];

  compareStyleIds: string[];
  setCompareStyleIds: (ids: string[]) => void;
  isCompareActive: boolean;
  setIsCompareActive: (active: boolean) => void;

  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

/** Load stored custom styles, dropping anything that would not render safely. */
function loadCustomStyles(): StyleDefinition[] {
  const raw = readJson<unknown[]>(STORAGE_KEYS.customStyles, []);
  if (!Array.isArray(raw)) return [];
  const valid: StyleDefinition[] = [];
  for (const entry of raw) {
    const style = coerceStyleDefinition(entry);
    if (style) valid.push(style);
  }
  if (valid.length !== raw.length) writeJson(STORAGE_KEYS.customStyles, valid);
  return valid;
}

function scaleDuration(value: string, factor: number): string {
  const match = /^([\d.]+)(ms|s)$/.exec(value.trim());
  if (!match) return value;
  const n = parseFloat(match[1]) * factor;
  return `${Math.round(n * 100) / 100}${match[2]}`;
}

export const StyleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Custom styles must be in the registry before the first render so a saved custom style can be current.
  const [customStyles, setCustomStyles] = useState<StyleDefinition[]>(() => {
    const loaded = loadCustomStyles();
    loaded.forEach((s) => registry.register(s));
    return loaded;
  });

  const [currentStyleId, setCurrentStyleId] = useState<string>(() => {
    const saved = readString(STORAGE_KEYS.styleId, DEFAULT_STYLE_ID);
    return registry.has(saved) ? saved : DEFAULT_STYLE_ID;
  });

  const [previewStyle, setPreviewStyle] = useState<StyleDefinition | undefined>(undefined);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readJson<string[]>(STORAGE_KEYS.favorites, []));
  const [recentStyleIds, setRecentStyleIds] = useState<string[]>(() => readJson<string[]>(STORAGE_KEYS.recentStyles, []));
  const [compareStyleIds, setCompareStyleIdsState] = useState<string[]>(() => readJson<string[]>(STORAGE_KEYS.compare, []));
  const [isCompareActive, setIsCompareActive] = useState<boolean>(false);
  const [settings, setSettings] = useState<UserSettings>(() => ({ ...DEFAULT_SETTINGS, ...readJson<Partial<UserSettings>>(STORAGE_KEYS.settings, {}) }));

  // Bumped whenever the registry contents change so derived lists refresh.
  const [registryVersion, setRegistryVersion] = useState(0);

  // registryVersion is an intentional dependency: the registry is external mutable state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const availableStyles = useMemo(() => registry.getAll(), [registryVersion]);

  const currentStyle = useMemo(
    () => registry.get(currentStyleId) || registry.get(DEFAULT_STYLE_ID) || allStyles[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStyleId, registryVersion]
  );

  const renderedStyle = previewStyle ?? currentStyle;

  const resolvedCssVars = useMemo(() => {
    const vars = resolveStyleToCssVars(renderedStyle);
    const factor = settings.reduceMotion ? 0 : 1 / settings.motionIntensity;
    for (const key of ['--duration-fast', '--duration-normal', '--duration-slow']) {
      vars[key] = settings.reduceMotion ? '0ms' : scaleDuration(vars[key], factor);
    }
    if (settings.reduceMotion) {
      vars['--hover-scale'] = '1';
      vars['--active-scale'] = '1';
    }
    vars['--experimental'] = settings.experimental ? '1' : '0';
    if (settings.experimental) {
      const blur = parseFloat(vars['--backdrop-blur']) || 0;
      vars['--backdrop-blur'] = `${Math.max(blur * 2, blur > 0 ? 12 : 0)}px`;
      if (vars['--shadow-glow'] === 'none') vars['--shadow-glow'] = `0 0 24px ${vars['--color-accent']}`;
    }
    return vars;
  }, [renderedStyle, settings]);

  useEffect(() => { writeJson(STORAGE_KEYS.settings, settings); }, [settings]);

  const setStyle = useCallback((styleId: string) => {
    if (!registry.has(styleId)) return;
    setCurrentStyleId(styleId);
    setPreviewStyle(undefined);
    writeString(STORAGE_KEYS.styleId, styleId);
    setRecentStyleIds((prev) => {
      const next = [styleId, ...prev.filter((id) => id !== styleId)].slice(0, MAX_RECENT_STYLES);
      writeJson(STORAGE_KEYS.recentStyles, next);
      return next;
    });
  }, []);

  const persistCustom = (next: StyleDefinition[]) => {
    writeJson(STORAGE_KEYS.customStyles, next);
    setCustomStyles(next);
    setRegistryVersion((v) => v + 1);
  };

  const addCustomStyle = useCallback((style: StyleDefinition) => {
    const safe = coerceStyleDefinition(style);
    if (!safe) return;
    registry.register(safe);
    setCustomStyles((prev) => {
      const next = [...prev.filter((s) => s.metadata.id !== safe.metadata.id), safe];
      writeJson(STORAGE_KEYS.customStyles, next);
      return next;
    });
    setRegistryVersion((v) => v + 1);
    setCurrentStyleId(safe.metadata.id);
    setPreviewStyle(undefined);
    writeString(STORAGE_KEYS.styleId, safe.metadata.id);
  }, []);

  const deleteCustomStyle = useCallback((styleId: string) => {
    registry.unregister(styleId);
    setCustomStyles((prev) => {
      const next = prev.filter((s) => s.metadata.id !== styleId);
      writeJson(STORAGE_KEYS.customStyles, next);
      return next;
    });
    setFavoriteIds((prev) => {
      const next = prev.filter((id) => id !== styleId);
      writeJson(STORAGE_KEYS.favorites, next);
      return next;
    });
    setRegistryVersion((v) => v + 1);
    setCurrentStyleId((current) => {
      if (current !== styleId) return current;
      writeString(STORAGE_KEYS.styleId, DEFAULT_STYLE_ID);
      return DEFAULT_STYLE_ID;
    });
  }, []);

  const renameCustomStyle = useCallback((styleId: string, name: string, description?: string, tags?: string[]) => {
    const existing = registry.get(styleId);
    if (!existing || !existing.metadata.isCustom) return;
    const updated: StyleDefinition = {
      ...existing,
      metadata: {
        ...existing.metadata,
        name: name.trim() || existing.metadata.name,
        description: description ?? existing.metadata.description,
        tags: tags ?? existing.metadata.tags
      }
    };
    registry.register(updated);
    setCustomStyles((prev) => {
      const next = prev.map((s) => (s.metadata.id === styleId ? updated : s));
      writeJson(STORAGE_KEYS.customStyles, next);
      return next;
    });
    setRegistryVersion((v) => v + 1);
  }, []);

  const duplicateStyle = useCallback((styleId: string): StyleDefinition | undefined => {
    const source = registry.get(styleId);
    if (!source) return undefined;
    const baseId = source.metadata.id.replace(/-copy(-\d+)?$/, '');
    let n = 1;
    let id = `${baseId}-copy`;
    while (registry.has(id)) { n += 1; id = `${baseId}-copy-${n}`; }
    const copy: StyleDefinition = JSON.parse(JSON.stringify(source));
    copy.metadata = {
      ...copy.metadata,
      id,
      name: `${source.metadata.name.replace(/ \(Copy( \d+)?\)$/, '')} (Copy${n > 1 ? ` ${n}` : ''})`,
      category: 'Custom',
      isCustom: true
    };
    registry.register(copy);
    persistCustom([...customStyles, copy]);
    setCurrentStyleId(id);
    writeString(STORAGE_KEYS.styleId, id);
    return copy;
  }, [customStyles]);

  const toggleFavorite = useCallback((styleId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(styleId) ? prev.filter((id) => id !== styleId) : [...prev, styleId];
      writeJson(STORAGE_KEYS.favorites, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((styleId: string) => favoriteIds.includes(styleId), [favoriteIds]);

  const setCompareStyleIds = useCallback((ids: string[]) => {
    setCompareStyleIdsState(ids);
    writeJson(STORAGE_KEYS.compare, ids);
  }, []);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <StyleContext.Provider
      value={{
        currentStyle,
        setStyle,
        availableStyles,
        resolvedCssVars,
        customStyles,
        addCustomStyle,
        deleteCustomStyle,
        renameCustomStyle,
        duplicateStyle,
        previewStyle,
        setPreviewStyle,
        favoriteIds,
        toggleFavorite,
        isFavorite,
        recentStyleIds,
        compareStyleIds,
        setCompareStyleIds,
        isCompareActive,
        setIsCompareActive,
        settings,
        updateSettings
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
