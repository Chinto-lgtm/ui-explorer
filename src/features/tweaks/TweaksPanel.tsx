import React, { useState } from 'react';
import { SlidersHorizontal, X, RotateCcw, Save, Check, Square, Layers, Type, Palette, Zap, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useStyle } from '../../hooks/useStyle';
import { DEFAULT_TWEAKS, MOTION_SPEED, TWEAK_DEFS, formatTweak } from '../../engine/tweaks';
import type { NumericTweak, TweakDef } from '../../engine/tweaks';
import { PRESET_SWATCHES } from '../../engine/color';
import { getStyleDataAttributes } from '../../engine/styleAttributes';
import { WorkspaceSwitch } from '../../components/workspace/Workspace';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import './TweaksPanel.css';

const GROUPS: { title: string; icon: ReactNode; ids: NumericTweak[] }[] = [
  { title: 'Shape', icon: <Square size={14} />, ids: ['radius', 'border'] },
  { title: 'Depth', icon: <Layers size={14} />, ids: ['shadow'] },
  { title: 'Space & type', icon: <Type size={14} />, ids: ['density', 'type'] }
];

const ACCENTS = PRESET_SWATCHES.filter((s) => !['White', 'Black', 'Gray', 'Slate'].includes(s.name));

/** One labelled range input with its value, a fill and a reset. */
const Dial: React.FC<{
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}> = ({ label, hint, value, min, max, step, defaultValue, format, onChange }) => {
  const id = `tw-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  const fill = ((value - min) / (max - min)) * 100;
  const mark = ((defaultValue - min) / (max - min)) * 100;
  const changed = value !== defaultValue;
  return (
    <div className="tw-dial">
      <div className="tw-dial__head">
        <label htmlFor={id} className="tw-dial__label">{label}</label>
        <span className={`tw-dial__value ${changed ? 'tw-dial__value--changed' : ''}`} aria-hidden="true">{format(value)}</span>
        <button type="button" className="tw-dial__reset" onClick={() => onChange(defaultValue)} disabled={!changed} aria-label={`Reset ${label}`} title={`Reset ${label}`}>
          <RotateCcw size={12} />
        </button>
      </div>
      <div className="tw-dial__track" style={{ '--tw-fill': `${fill}%`, '--tw-mark': `${mark}%` } as React.CSSProperties}>
        <input
          id={id}
          type="range"
          className="tw-dial__input"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={format(value)}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      </div>
      {hint && <p id={`${id}-hint`} className="tw-dial__hint">{hint}</p>}
    </div>
  );
};

/**
 * The global Tweaks panel: a few dials layered over whatever style is shown,
 * on every page and in every compare frame. Nothing is saved to a style until
 * "Save as new style".
 */
export const TweaksPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { tweaks, setTweaks, resetTweaks, isTweaked, saveTweaksAsStyle, settings, updateSettings, renderedStyle, resolvedCssVars, previewStyle, currentStyle } = useStyle();
  const [saved, setSaved] = useState<string | null>(null);
  const base = previewStyle ?? currentStyle;
  const defs = new Map<NumericTweak, TweakDef>(TWEAK_DEFS.map((d) => [d.id, d]));
  const motionChanged = settings.motionIntensity !== 1;

  const save = () => {
    const style = saveTweaksAsStyle();
    if (style) setSaved(style.metadata.name);
  };

  return (
    <aside className="tw-panel" role="dialog" aria-modal="false" aria-labelledby="tw-title">
      <header className="tw-panel__head">
        <span className="tw-panel__icon" aria-hidden="true"><SlidersHorizontal size={16} /></span>
        <div className="tw-panel__heading">
          <h2 id="tw-title" className="tw-panel__title">Tweaks</h2>
          <p className="tw-panel__sub">Live on <strong>{base.metadata.name}</strong>{isTweaked ? ' · tweaked' : ''}</p>
        </div>
        <button type="button" className="tw-panel__close" onClick={onClose} aria-label="Close tweaks"><X size={16} /></button>
      </header>

      <div className="tw-specimen" style={resolvedCssVars as React.CSSProperties} {...getStyleDataAttributes(renderedStyle)} aria-hidden="true">
        <div className="tw-specimen__card">
          <span className="tw-specimen__title">Aa · {renderedStyle.metadata.name}</span>
          <span className="tw-specimen__text">The quick brown fox jumps over the lazy dog.</span>
          <span className="tw-specimen__row">
            <Button size="sm" tabIndex={-1}>Primary</Button>
            <Button size="sm" variant="outline" tabIndex={-1}>Outline</Button>
            <Badge variant="accent">New</Badge>
          </span>
        </div>
      </div>

      <div className="tw-panel__body">
        {GROUPS.map((g) => (
          <section key={g.title} className="tw-group" aria-label={g.title}>
            <h3 className="tw-group__title">{g.icon}{g.title}</h3>
            {g.ids.map((id) => {
              const d = defs.get(id)!;
              return (
                <Dial key={id} label={d.label} hint={d.hint} value={tweaks[id]} min={d.min} max={d.max} step={d.step} defaultValue={DEFAULT_TWEAKS[id]} format={formatTweak} onChange={(v) => setTweaks({ [id]: v })} />
              );
            })}
          </section>
        ))}

        <section className="tw-group" aria-label="Accent colour">
          <h3 className="tw-group__title"><Palette size={14} />Accent colour</h3>
          <div className="tw-swatches" role="radiogroup" aria-label="Accent colour">
            <button
              type="button"
              role="radio"
              aria-checked={tweaks.accent === null}
              className={`tw-swatch tw-swatch--default ${tweaks.accent === null ? 'tw-swatch--active' : ''}`}
              style={{ '--tw-swatch': base.tokens.colors.accent } as React.CSSProperties}
              onClick={() => setTweaks({ accent: null })}
              title="Style default"
              aria-label="Style default"
            />
            {ACCENTS.map((s) => (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={tweaks.accent === s.value}
                className={`tw-swatch ${tweaks.accent === s.value ? 'tw-swatch--active' : ''}`}
                style={{ '--tw-swatch': s.value } as React.CSSProperties}
                onClick={() => setTweaks({ accent: s.value })}
                title={s.name}
                aria-label={s.name}
              />
            ))}
            <label className="tw-swatch tw-swatch--custom" title="Pick any colour">
              <input type="color" value={tweaks.accent ?? base.tokens.colors.accent.slice(0, 7)} onChange={(e) => setTweaks({ accent: e.target.value })} aria-label="Custom accent colour" />
            </label>
          </div>
        </section>

        <section className="tw-group" aria-label="Motion">
          <h3 className="tw-group__title"><Zap size={14} />Motion</h3>
          <Dial
            label="Motion speed"
            hint="Durations of every transition. Your preference, kept across styles."
            value={settings.motionIntensity}
            min={MOTION_SPEED.min}
            max={MOTION_SPEED.max}
            step={MOTION_SPEED.step}
            defaultValue={1}
            format={(v) => `${Math.round(v * 100) / 100}×`}
            onChange={(v) => updateSettings({ motionIntensity: v })}
          />
          <WorkspaceSwitch checked={settings.reduceMotion} onChange={(on) => updateSettings({ reduceMotion: on })} label="Reduce motion" />
        </section>

        <section className="tw-group" aria-label="Effects">
          <h3 className="tw-group__title"><Sparkles size={14} />Effects</h3>
          <WorkspaceSwitch checked={settings.experimental} onChange={(on) => updateSettings({ experimental: on })} label="Experimental: stronger blur and glow" />
        </section>
      </div>

      <footer className="tw-panel__foot">
        {saved && !isTweaked ? (
          <p className="tw-panel__saved" role="status"><Check size={14} /> Saved as {saved}</p>
        ) : (
          <p className="tw-panel__note">{isTweaked ? 'Tweaks show on every page and compare frame.' : 'Move a dial to try a change.'}</p>
        )}
        <div className="tw-panel__actions">
          <button type="button" className="ws-btn" onClick={() => { resetTweaks(); if (motionChanged) updateSettings({ motionIntensity: 1 }); setSaved(null); }} disabled={!isTweaked && !motionChanged}>
            <RotateCcw size={14} /> Reset
          </button>
          <button type="button" className="ws-btn ws-btn--primary" onClick={save} disabled={!isTweaked}>
            <Save size={14} /> Save as new style
          </button>
        </div>
      </footer>
    </aside>
  );
};
