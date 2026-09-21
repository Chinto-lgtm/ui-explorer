/**
 * UI Explorer — Style preview SVG
 * Renders a faithful miniature of a style from its actual tokens (background,
 * surface, radius, border, shadow, accent, type) as a standalone SVG string.
 * Used for community package previews; nothing here is hand-drawn artwork.
 */

import type { StyleDefinition } from './types';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const px = (v: string | undefined, fallback = 0): number => {
  const n = parseFloat(v ?? '');
  return Number.isFinite(n) ? n : fallback;
};

/** First offset/blur pair of a CSS shadow, enough to approximate it with an SVG filter. */
function shadowParts(shadow: string | undefined): { dx: number; dy: number; blur: number; color: string; inset: boolean } | null {
  if (!shadow || shadow === 'none') return null;
  const first = shadow.split(/,(?![^(]*\))/)[0].trim();
  const nums = first.match(/-?[\d.]+px/g)?.map((n) => parseFloat(n)) ?? [];
  const color = first.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}|[a-z]+)\s*$/)?.[1] ?? 'rgba(0,0,0,0.2)';
  return { dx: nums[0] ?? 0, dy: nums[1] ?? 0, blur: nums[2] ?? 0, color, inset: /inset/.test(first) };
}

export function renderStylePreviewSvg(style: StyleDefinition, width = 480, height = 320): string {
  const t = style.tokens;
  const c = t.colors;
  const radius = Math.min(48, px(t.radii.lg, 12));
  const borderW = Math.min(8, px(t.borders.width, 1));
  const borderColor = t.borders.style === 'none' || borderW === 0 ? 'none' : t.borders.color;
  const dash = t.borders.style === 'dashed' ? `stroke-dasharray="${borderW * 3} ${borderW * 2}"` : '';
  const shadow = shadowParts(t.shadows.md);
  const glow = t.shadows.glow && t.shadows.glow !== 'none' ? shadowParts(t.shadows.glow) : null;
  const font = esc(t.typography.fontFamilySans);
  const heading = esc(t.typography.fontFamilyHeading ?? t.typography.fontFamilySans);
  const bold = t.typography.fontWeightBold;
  const blur = Math.min(60, px(t.materials?.backdropBlur));
  const opacity = t.materials?.opacity ?? 1;
  const cardX = 40, cardY = 48, cardW = width - 80, cardH = height - 96;
  const btnR = Math.min(radius, px(t.radii.md, 8));
  const bars = [38, 62, 46, 84, 70, 96, 58];

  const filters: string[] = [];
  if (shadow && !shadow.inset) {
    filters.push(`<filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="${shadow.dx}" dy="${shadow.dy}" stdDeviation="${shadow.blur / 2}" flood-color="${esc(shadow.color)}"/></filter>`);
  }
  if (glow) {
    filters.push(`<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="0" stdDeviation="${Math.max(2, glow.blur / 2)}" flood-color="${esc(glow.color)}"/></filter>`);
  }
  const gradient = t.materials?.gradient ? `<linearGradient id="surface-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${esc(c.accent)}" stop-opacity="0.18"/><stop offset="1" stop-color="${esc(c.accent)}" stop-opacity="0"/></linearGradient>` : '';
  const backdrop = blur > 0
    ? `<circle cx="${width * 0.2}" cy="${height * 0.25}" r="${height * 0.45}" fill="${esc(c.accent)}" opacity="0.35"/><circle cx="${width * 0.85}" cy="${height * 0.8}" r="${height * 0.4}" fill="${esc(c.accentHover)}" opacity="0.3"/>`
    : '';

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(style.metadata.name)} preview">`,
    `<title>${esc(style.metadata.name)}</title>`,
    `<defs>${filters.join('')}${gradient}</defs>`,
    `<rect width="${width}" height="${height}" fill="${esc(c.bg)}"/>`,
    backdrop,
    `<g${shadow && !shadow.inset ? ' filter="url(#shadow)"' : glow ? ' filter="url(#glow)"' : ''}>`,
    `<rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${radius}" fill="${esc(c.surface)}" fill-opacity="${opacity}" stroke="${esc(borderColor)}" stroke-width="${borderW}" ${dash}/>`,
    t.materials?.gradient ? `<rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${radius}" fill="url(#surface-gradient)"/>` : '',
    `</g>`,
    `<text x="${cardX + 28}" y="${cardY + 44}" font-family="${heading}" font-size="18" font-weight="${bold}" fill="${esc(c.textPrimary)}">${esc(style.metadata.name)}</text>`,
    `<rect x="${cardX + cardW - 108}" y="${cardY + 26}" width="80" height="24" rx="${Math.min(12, btnR)}" fill="${esc(c.accent)}"/>`,
    `<text x="${cardX + cardW - 68}" y="${cardY + 42}" font-family="${font}" font-size="11" font-weight="600" text-anchor="middle" fill="${esc(c.accentText ?? '#ffffff')}">${esc(style.metadata.category)}</text>`,
    `<text x="${cardX + 28}" y="${cardY + 84}" font-family="${heading}" font-size="30" font-weight="${bold}" fill="${esc(c.textPrimary)}">$128,450</text>`,
    `<text x="${cardX + 28}" y="${cardY + 104}" font-family="${font}" font-size="12" fill="${esc(c.textSecondary)}">Revenue overview · last 7 days</text>`,
    ...bars.map((h, i) => {
      const bw = (cardW - 56) / bars.length - 8;
      const barsBottom = cardY + cardH - 72;
      const bh = (h / 100) * 44;
      return `<rect x="${cardX + 28 + i * (bw + 8)}" y="${barsBottom - bh}" width="${bw}" height="${bh}" rx="${Math.min(btnR / 2, bw / 2, 8)}" fill="${esc(c.accent)}" opacity="${0.55 + (h / 100) * 0.45}"/>`;
    }),
    `<rect x="${cardX + 28}" y="${cardY + cardH - 56}" width="104" height="32" rx="${btnR}" fill="${esc(c.accent)}"${glow ? ' filter="url(#glow)"' : ''}/>`,
    `<text x="${cardX + 80}" y="${cardY + cardH - 35}" font-family="${font}" font-size="13" font-weight="600" text-anchor="middle" fill="${esc(c.accentText ?? '#ffffff')}">Primary</text>`,
    `<rect x="${cardX + 144}" y="${cardY + cardH - 56}" width="104" height="32" rx="${btnR}" fill="none" stroke="${esc(c.accent)}" stroke-width="${Math.max(1, Math.min(3, borderW))}"/>`,
    `<text x="${cardX + 196}" y="${cardY + cardH - 35}" font-family="${font}" font-size="13" font-weight="600" text-anchor="middle" fill="${esc(c.accent)}">Outline</text>`,
    `</svg>`
  ].filter(Boolean).join('\n');
}
