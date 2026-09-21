import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, Copy, Pipette } from 'lucide-react';
import { STORAGE_KEYS, readJson, writeJson } from '../../engine/storage';
import { parseColor, rgbToHsl, hslToRgb, toHex, toRgbString, toHslString, contrastRatio, PRESET_SWATCHES } from '../../engine/color';
import type { HSLA } from '../../engine/color';
import './ColorPicker.css';

const MAX_RECENT = 12;

export interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Colour to check contrast against (e.g. background for text). */
  contrastWith?: string;
  allowAlpha?: boolean;
  disabled?: boolean;
  onReset?: () => void;
  resetLabel?: string;
}

type Format = 'hex' | 'rgb' | 'hsl';

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, contrastWith, allowAlpha = true, disabled, onReset, resetLabel = 'Reset' }) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Format>('hex');
  const [text, setText] = useState(value);
  const [copied, setCopied] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => readJson<string[]>(STORAGE_KEYS.recentColors, []));
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const rgba = useMemo(() => parseColor(value) ?? { r: 99, g: 102, b: 241, a: 1 }, [value]);
  const hsla = useMemo(() => rgbToHsl(rgba), [rgba]);
  const valid = parseColor(value) !== null;

  useEffect(() => { setText(format === 'hex' ? toHex(rgba) : format === 'rgb' ? toRgbString(rgba) : toHslString(hsla)); }, [rgba, hsla, format]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const commit = useCallback((next: HSLA) => {
    const rgb = hslToRgb(next);
    onChange(next.a < 1 && allowAlpha ? toHex(rgb) : toHex({ ...rgb, a: 1 }));
  }, [onChange, allowAlpha]);

  const remember = useCallback((hex: string) => {
    setRecent((prev) => {
      const next = [hex, ...prev.filter((c) => c !== hex)].slice(0, MAX_RECENT);
      writeJson(STORAGE_KEYS.recentColors, next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    return () => { if (valid) remember(toHex({ ...rgba, a: 1 })); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fromField = (e: React.PointerEvent | PointerEvent) => {
    const rect = fieldRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    // HSV field: x = saturation, y = value; convert to HSL for storage.
    const sv = x, vv = 1 - y;
    const l = vv * (1 - sv / 2);
    const s = l === 0 || l === 1 ? 0 : (vv - l) / Math.min(l, 1 - l);
    commit({ h: hsla.h, s: Math.round(s * 100), l: Math.round(l * 100), a: hsla.a });
  };

  const onFieldDown = (e: React.PointerEvent) => {
    if (disabled) return;
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    fromField(e);
  };
  const onFieldMove = (e: React.PointerEvent) => { if (dragging.current) fromField(e); };
  const onFieldUp = () => { dragging.current = false; };

  const onFieldKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowLeft') commit({ ...hsla, s: Math.max(0, hsla.s - step) });
    else if (e.key === 'ArrowRight') commit({ ...hsla, s: Math.min(100, hsla.s + step) });
    else if (e.key === 'ArrowUp') commit({ ...hsla, l: Math.min(100, hsla.l + step) });
    else if (e.key === 'ArrowDown') commit({ ...hsla, l: Math.max(0, hsla.l - step) });
    else return;
    e.preventDefault();
  };

  const applyText = () => {
    const parsed = parseColor(text);
    if (parsed) { onChange(toHex(parsed)); remember(toHex({ ...parsed, a: 1 })); }
    else setText(format === 'hex' ? toHex(rgba) : format === 'rgb' ? toRgbString(rgba) : toHslString(hsla));
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const eyedrop = async () => {
    const EyeDropperCtor = (window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
    if (!EyeDropperCtor) return;
    try { const res = await new EyeDropperCtor().open(); onChange(res.sRGBHex); remember(res.sRGBHex); } catch { /* cancelled */ }
  };

  const contrast = contrastWith ? contrastRatio(value, contrastWith) : null;
  const wcag = contrast === null ? null : contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : contrast >= 3 ? 'AA large' : 'Fail';

  // Field marker position from HSL → HSV
  const vv = hsla.l / 100 + (hsla.s / 100) * Math.min(hsla.l / 100, 1 - hsla.l / 100);
  const sv = vv === 0 ? 0 : 2 * (1 - (hsla.l / 100) / vv);

  return (
    <div className={`ui-color ${disabled ? 'ui-color--disabled' : ''}`} ref={rootRef}>
      <div className="ui-color__row">
        <label className="ui-color__label" htmlFor={`${id}-text`}>{label}</label>
        {contrast !== null && (
          <span className={`ui-color__contrast ui-color__contrast--${wcag === 'Fail' ? 'fail' : wcag === 'AA large' ? 'warn' : 'pass'}`} title={`Contrast against ${contrastWith}`}>
            {contrast}:1 · {wcag}
          </span>
        )}
      </div>
      <div className="ui-color__control">
        <button
          type="button"
          className="ui-color__swatch"
          style={{ background: valid ? value : 'transparent' }}
          aria-label={`${label}: ${value}. Open colour picker`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
        />
        <input
          id={`${id}-text`}
          className={`ui-input ui-color__text ${valid ? '' : 'ui-color__text--invalid'}`}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onBlur={applyText}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyText(); } }}
          spellCheck={false}
          aria-invalid={!valid}
        />
        <button type="button" className="ui-color__icon-btn" onClick={copy} aria-label="Copy value" disabled={disabled}>{copied ? <Check size={14} /> : <Copy size={14} />}</button>
        {onReset && <button type="button" className="ui-color__reset" onClick={onReset} disabled={disabled}>{resetLabel}</button>}
      </div>

      {open && (
        <div className="ui-color__panel" id={`${id}-panel`} role="group" aria-label={`${label} colour picker`}>
          <div
            ref={fieldRef}
            className="ui-color__field"
            style={{ backgroundColor: `hsl(${hsla.h}, 100%, 50%)` }}
            role="slider"
            aria-label="Saturation and lightness"
            aria-valuetext={`saturation ${hsla.s}%, lightness ${hsla.l}%`}
            tabIndex={0}
            onPointerDown={onFieldDown}
            onPointerMove={onFieldMove}
            onPointerUp={onFieldUp}
            onKeyDown={onFieldKey}
          >
            <span className="ui-color__field-marker" style={{ left: `${sv * 100}%`, top: `${(1 - vv) * 100}%`, background: toHex({ ...rgba, a: 1 }) }} />
          </div>
          <label className="ui-color__slider ui-color__slider--hue">
            <span className="sr-only">Hue</span>
            <input type="range" min={0} max={360} value={hsla.h} onChange={(e) => commit({ ...hsla, h: Number(e.target.value) })} />
          </label>
          <label className="ui-color__slider ui-color__slider--sat">
            <span className="sr-only">Saturation</span>
            <input type="range" min={0} max={100} value={hsla.s} style={{ background: `linear-gradient(90deg, hsl(${hsla.h}, 0%, ${hsla.l}%), hsl(${hsla.h}, 100%, ${hsla.l}%))` }} onChange={(e) => commit({ ...hsla, s: Number(e.target.value) })} />
          </label>
          <label className="ui-color__slider ui-color__slider--light">
            <span className="sr-only">Lightness</span>
            <input type="range" min={0} max={100} value={hsla.l} style={{ background: `linear-gradient(90deg, #000, hsl(${hsla.h}, ${hsla.s}%, 50%), #fff)` }} onChange={(e) => commit({ ...hsla, l: Number(e.target.value) })} />
          </label>
          {allowAlpha && (
            <label className="ui-color__slider ui-color__slider--alpha">
              <span className="sr-only">Opacity</span>
              <input type="range" min={0} max={100} value={Math.round(hsla.a * 100)} style={{ background: `linear-gradient(90deg, transparent, ${toHex({ ...rgba, a: 1 })})` }} onChange={(e) => commit({ ...hsla, a: Number(e.target.value) / 100 })} />
            </label>
          )}
          <div className="ui-color__formats" role="radiogroup" aria-label="Format">
            {(['hex', 'rgb', 'hsl'] as Format[]).map((f) => (
              <button key={f} type="button" role="radio" aria-checked={format === f} className={`ui-color__format ${format === f ? 'ui-color__format--active' : ''}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>
            ))}
            <span className="ui-color__readout">{toHex(rgba)} · {toRgbString(rgba)} · {toHslString(hsla)}</span>
            {'EyeDropper' in window && <button type="button" className="ui-color__icon-btn" onClick={eyedrop} aria-label="Pick from screen"><Pipette size={14} /></button>}
          </div>
          <div className="ui-color__swatches" aria-label="Presets">
            {PRESET_SWATCHES.map((p) => (
              <button key={p.name} type="button" className="ui-color__preset" style={{ background: p.value }} title={p.name} aria-label={p.name} onClick={() => { onChange(p.value); remember(p.value); }} />
            ))}
          </div>
          {recent.length > 0 && (
            <div className="ui-color__swatches ui-color__swatches--recent" aria-label="Recent colours">
              {recent.map((c) => (
                <button key={c} type="button" className="ui-color__preset" style={{ background: c }} title={c} aria-label={`Recent ${c}`} onClick={() => onChange(c)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
