/**
 * Shared helpers for the SVG chart system. Charts read the active style through
 * CSS variables (colours, corner language, glow) so they adapt without props.
 */

export interface DataPoint {
  label: string;
  value: number;
}

export interface Series {
  name: string;
  data: DataPoint[];
  color?: string;
}

export const CHART_COLORS = [
  'var(--color-accent)',
  'var(--color-info)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-error)',
  'var(--color-text-secondary)'
];

export const seriesColor = (series: Series, index: number): string => series.color ?? CHART_COLORS[index % CHART_COLORS.length];

export interface Scale {
  min: number;
  max: number;
  ticks: number[];
}

/** A "nice" linear scale that always includes zero unless the data is entirely negative. */
export function niceScale(values: number[], tickCount = 4, includeZero = true): Scale {
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  let min = includeZero ? Math.min(0, dataMin) : dataMin;
  let max = includeZero ? Math.max(0, dataMax) : dataMax;
  if (min === max) { max = min + 1; }
  const range = max - min;
  const rough = range / tickCount;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const candidates = [1, 2, 2.5, 5, 10].map((c) => c * pow);
  const step = candidates.find((c) => c >= rough) ?? candidates[candidates.length - 1];
  min = Math.floor(min / step) * step;
  max = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let t = min; t <= max + step / 2; t += step) ticks.push(Math.round(t * 1000) / 1000);
  return { min, max, ticks };
}

export const formatValue = (v: number): string => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
};

/** Catmull-Rom → cubic Bézier path; straight polyline when the style's corner language is sharp. */
export function linePath(points: { x: number; y: number }[], smooth: boolean): string {
  if (points.length === 0) return '';
  if (!smooth || points.length < 3) return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Deterministic pseudo-random for demo datasets and decorative shapes. */
export function mulberry(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeSeries(name: string, points: number, seed: number, base = 50, spread = 40): Series {
  const rnd = mulberry(seed);
  let v = base;
  const data: DataPoint[] = [];
  for (let i = 0; i < points; i++) {
    v = Math.max(2, v + (rnd() - 0.45) * spread);
    data.push({ label: pointLabel(i, points), value: Math.round(v) });
  }
  return { name, data };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function pointLabel(i: number, total: number): string {
  if (total <= 7) return DAYS[i % 7];
  if (total <= 12) return MONTHS[i % 12];
  return `W${i + 1}`;
}
