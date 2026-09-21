/**
 * UI Explorer — Colour maths
 * Parsing, HSL/RGB conversion, formatting and WCAG contrast used by the colour
 * picker, anatomy panel and customizer.
 */

export interface HSLA { h: number; s: number; l: number; a: number }
export interface RGBA { r: number; g: number; b: number; a: number }

export function parseColor(input: string): RGBA | null {
  const v = input.trim();
  const hex = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(v);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = h.split('').map((c) => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(v);
  if (rgb) {
    const a = rgb[4] === undefined ? 1 : rgb[4].endsWith('%') ? parseFloat(rgb[4]) / 100 : parseFloat(rgb[4]);
    return { r: +rgb[1], g: +rgb[2], b: +rgb[3], a };
  }
  const hsl = /^hsla?\(\s*([\d.]+)[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(v);
  if (hsl) {
    const a = hsl[4] === undefined ? 1 : hsl[4].endsWith('%') ? parseFloat(hsl[4]) / 100 : parseFloat(hsl[4]);
    return { ...hslToRgb({ h: +hsl[1], s: +hsl[2], l: +hsl[3], a }), a };
  }
  return null;
}

export function rgbToHsl({ r, g, b, a }: RGBA): HSLA {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100), a };
}

export function hslToRgb({ h, s, l, a }: HSLA): RGBA {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;
  const hh = ((h % 360) + 360) % 360;
  if (hh < 60) { r = c; g = x; } else if (hh < 120) { r = x; g = c; } else if (hh < 180) { g = c; b = x; }
  else if (hh < 240) { g = x; b = c; } else if (hh < 300) { r = x; b = c; } else { r = c; b = x; }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255), a };
}

const two = (n: number) => n.toString(16).padStart(2, '0');
export const toHex = ({ r, g, b, a }: RGBA): string => `#${two(r)}${two(g)}${two(b)}${a < 1 ? two(Math.round(a * 255)) : ''}`;
export const toRgbString = ({ r, g, b, a }: RGBA): string => (a < 1 ? `rgba(${r}, ${g}, ${b}, ${Math.round(a * 100) / 100})` : `rgb(${r}, ${g}, ${b})`);
export const toHslString = (c: HSLA): string => (c.a < 1 ? `hsla(${c.h}, ${c.s}%, ${c.l}%, ${Math.round(c.a * 100) / 100})` : `hsl(${c.h}, ${c.s}%, ${c.l}%)`);

/** WCAG relative luminance and contrast. */
export function luminance({ r, g, b }: RGBA): number {
  const f = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a: string, b: string): number | null {
  const ca = parseColor(a), cb = parseColor(b);
  if (!ca || !cb) return null;
  const la = luminance(ca), lb = luminance(cb);
  return Math.round(((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)) * 100) / 100;
}

export const PRESET_SWATCHES: { name: string; value: string }[] = [
  { name: 'White', value: '#ffffff' }, { name: 'Black', value: '#000000' }, { name: 'Gray', value: '#6b7280' }, { name: 'Slate', value: '#475569' },
  { name: 'Blue', value: '#3b82f6' }, { name: 'Indigo', value: '#6366f1' }, { name: 'Purple', value: '#a855f7' }, { name: 'Violet', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' }, { name: 'Red', value: '#ef4444' }, { name: 'Orange', value: '#f97316' }, { name: 'Amber', value: '#f59e0b' },
  { name: 'Green', value: '#22c55e' }, { name: 'Emerald', value: '#10b981' }, { name: 'Teal', value: '#14b8a6' }, { name: 'Cyan', value: '#06b6d4' }
];
