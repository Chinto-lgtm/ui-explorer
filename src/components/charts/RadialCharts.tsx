import React, { useId, useState } from 'react';
import { formatValue, CHART_COLORS } from './chartUtils';
import type { DataPoint } from './chartUtils';
import { useChartStyle } from './useChartStyle';
import './Chart.css';

/* ---------------------------------------------------------------- */
/* Donut / Pie                                                        */
/* ---------------------------------------------------------------- */

export interface DonutChartProps {
  data: DataPoint[];
  size?: number;
  thickness?: number;
  /** 0 = pie */
  pie?: boolean;
  showLegend?: boolean;
  centerLabel?: string;
  animate?: boolean;
  colors?: string[];
}

const polar = (cx: number, cy: number, r: number, angle: number) => ({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number): string {
  const large = end - start > Math.PI ? 1 : 0;
  const o1 = polar(cx, cy, rOuter, start);
  const o2 = polar(cx, cy, rOuter, end);
  if (rInner <= 0) {
    return `M ${cx} ${cy} L ${o1.x} ${o1.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${o2.x} ${o2.y} Z`;
  }
  const i1 = polar(cx, cy, rInner, end);
  const i2 = polar(cx, cy, rInner, start);
  return `M ${o1.x} ${o1.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${rInner} ${rInner} 0 ${large} 0 ${i2.x} ${i2.y} Z`;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, size = 180, thickness = 28, pie = false, showLegend = true, centerLabel, animate = true, colors = CHART_COLORS }) => {
  const glowId = useId();
  const { glow, smooth, ref } = useChartStyle();
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2, cy = size / 2;
  const rOuter = size / 2 - 4;
  const rInner = pie ? 0 : rOuter - thickness;
  const gap = smooth ? 0.02 : 0;
  // Arc boundaries are computed up front so nothing is mutated while rendering the paths.
  const sweeps = data.map((d) => (d.value / total) * Math.PI * 2);
  const arcs = sweeps.map((sweep, i) => {
    const from = -Math.PI / 2 + sweeps.slice(0, i).reduce((a, b) => a + b, 0);
    return { start: from + gap / 2, end: from + sweep - gap / 2 };
  });

  return (
    <div ref={ref} className={`ui-chart-container ui-chart-container--radial ${animate ? 'ui-chart--animate' : ''}`}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`${pie ? 'Pie' : 'Donut'} chart`}>
        <defs>
          {glow && (
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          )}
        </defs>
        {data.map((d, i) => {
          const { start, end } = arcs[i];
          const isHot = hover === i;
          const mid = (start + end) / 2;
          const push = isHot ? 4 : 0;
          return (
            <path
              key={i}
              d={arcPath(cx + Math.cos(mid) * push, cy + Math.sin(mid) * push, rOuter, rInner, start, Math.max(start, end))}
              fill={colors[i % colors.length]}
              className="ui-chart-slice"
              filter={glow ? `url(#${glowId})` : undefined}
              tabIndex={0}
              role="button"
              aria-label={`${d.label}: ${d.value} (${Math.round((d.value / total) * 100)}%)`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            />
          );
        })}
        {!pie && (
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="ui-chart-center">
            {hover !== null ? `${Math.round((data[hover].value / total) * 100)}%` : centerLabel ?? formatValue(total)}
          </text>
        )}
      </svg>
      {showLegend && (
        <ul className="ui-chart-legend ui-chart-legend--column">
          {data.map((d, i) => (
            <li key={i} className={hover === i ? 'ui-chart-legend__item--hot' : ''} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <span className="ui-chart-legend__swatch" style={{ background: colors[i % colors.length] }} />
              <span className="ui-chart-legend__label">{d.label}</span>
              <span className="ui-chart-legend__value">{formatValue(d.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Radial bars                                                        */
/* ---------------------------------------------------------------- */

export const RadialChart: React.FC<{ data: DataPoint[]; size?: number; max?: number; colors?: string[]; animate?: boolean }> = ({ data, size = 180, max, colors = CHART_COLORS, animate = true }) => {
  const { glow, ref } = useChartStyle();
  const glowId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const cx = size / 2, cy = size / 2;
  const top = max ?? Math.max(...data.map((d) => d.value), 1);
  const ringGap = 4;
  const thickness = Math.max(6, (size / 2 - 10) / data.length - ringGap);

  return (
    <div ref={ref} className={`ui-chart-container ui-chart-container--radial ${animate ? 'ui-chart--animate' : ''}`}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Radial chart">
        <defs>
          {glow && (
            <filter id={glowId}><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          )}
        </defs>
        {data.map((d, i) => {
          const r = size / 2 - 6 - i * (thickness + ringGap) - thickness / 2;
          const c = 2 * Math.PI * r;
          const pct = Math.min(1, d.value / top);
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-surface-hover)" strokeWidth={thickness} />
              <circle
                cx={cx} cy={cy} r={r} fill="none"
                stroke={colors[i % colors.length]} strokeWidth={hover === i ? thickness + 2 : thickness} strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
                transform={`rotate(-90 ${cx} ${cy})`}
                className="ui-chart-radial"
                filter={glow ? `url(#${glowId})` : undefined}
              >
                <title>{`${d.label}: ${d.value}`}</title>
              </circle>
            </g>
          );
        })}
      </svg>
      <ul className="ui-chart-legend ui-chart-legend--column">
        {data.map((d, i) => (
          <li key={i} className={hover === i ? 'ui-chart-legend__item--hot' : ''}>
            <span className="ui-chart-legend__swatch" style={{ background: colors[i % colors.length] }} />
            <span className="ui-chart-legend__label">{d.label}</span>
            <span className="ui-chart-legend__value">{Math.round((d.value / top) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Sparkline                                                          */
/* ---------------------------------------------------------------- */

export const Sparkline: React.FC<{ values: number[]; height?: number; color?: string; fill?: boolean; strokeWidth?: number }> = ({ values, height = 40, color = 'var(--color-accent)', fill = true, strokeWidth = 2 }) => {
  const id = useId();
  const { smooth, ref } = useChartStyle();
  if (values.length === 0) return null;
  const width = 160;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({ x: (i / (values.length - 1 || 1)) * width, y: height - 3 - ((v - min) / range) * (height - 6) }));
  const d = smooth
    ? pts.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `S ${p.x} ${p.y}, ${p.x} ${p.y}`).join(' ')
    : pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <div ref={ref} className="ui-sparkline" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={`Trend, latest ${values[values.length - 1]}`}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {fill && <path d={`${d} L ${width} ${height} L 0 ${height} Z`} fill={`url(#${id})`} />}
        <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last.x} cy={last.y} r={3} fill={color} />
      </svg>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Scatter                                                            */
/* ---------------------------------------------------------------- */

export interface ScatterPoint { x: number; y: number; label?: string; size?: number }

export const ScatterChart: React.FC<{ points: ScatterPoint[]; height?: number; color?: string; showGrid?: boolean; animate?: boolean }> = ({ points, height = 200, color = 'var(--color-accent)', showGrid = true, animate = true }) => {
  const { smooth, ref } = useChartStyle();
  const [hover, setHover] = useState<number | null>(null);
  if (points.length === 0) return null;
  const width = 500;
  const padding = 30;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs) || 1;
  const yMin = Math.min(...ys), yMax = Math.max(...ys) || 1;
  const xf = (x: number) => padding + ((x - xMin) / (xMax - xMin || 1)) * (width - padding * 2);
  const yf = (y: number) => height - padding - ((y - yMin) / (yMax - yMin || 1)) * (height - padding * 2);
  return (
    <div ref={ref} className={`ui-chart-container ${animate ? 'ui-chart--animate' : ''}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="ui-chart-svg" preserveAspectRatio="none" role="img" aria-label="Scatter chart">
        {showGrid && [0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={padding} y1={padding + t * (height - padding * 2)} x2={width - padding} y2={padding + t * (height - padding * 2)} className="ui-chart-grid-line" />
            <line x1={padding + t * (width - padding * 2)} y1={padding} x2={padding + t * (width - padding * 2)} y2={height - padding} className="ui-chart-grid-line" />
          </g>
        ))}
        {points.map((p, i) => {
          const r = (p.size ?? 6) * (hover === i ? 1.4 : 1);
          const x = xf(p.x), y = yf(p.y);
          return smooth ? (
            <circle key={i} cx={x} cy={y} r={r} fill={color} fillOpacity={0.75} stroke="var(--color-surface)" strokeWidth="1.5" className="ui-chart-point" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <title>{p.label ?? `${p.x}, ${p.y}`}</title>
            </circle>
          ) : (
            <rect key={i} x={x - r} y={y - r} width={r * 2} height={r * 2} fill={color} fillOpacity={0.75} stroke="var(--color-surface)" strokeWidth="1.5" className="ui-chart-point" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <title>{p.label ?? `${p.x}, ${p.y}`}</title>
            </rect>
          );
        })}
        {hover !== null && (
          <g className="ui-chart-tooltip" transform={`translate(${Math.min(width - 110, xf(points[hover].x) + 10)} ${Math.max(padding, yf(points[hover].y) - 16)})`}>
            <rect x="0" y="-12" width="104" height="26" rx="6" />
            <text x="6" y="5" className="ui-chart-tooltip__text">{points[hover].label ?? `${points[hover].x}, ${points[hover].y}`}</text>
          </g>
        )}
      </svg>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Waveform                                                           */
/* ---------------------------------------------------------------- */

export const Waveform: React.FC<{ samples: number[]; height?: number; color?: string; progress?: number; animate?: boolean }> = ({ samples, height = 64, color = 'var(--color-accent)', progress = 0, animate = true }) => {
  const { smooth, ref } = useChartStyle();
  const width = 500;
  const barW = width / samples.length;
  return (
    <div ref={ref} className={`ui-chart-container ${animate ? 'ui-chart--animate' : ''}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="ui-chart-svg" preserveAspectRatio="none" role="img" aria-label="Waveform">
        {samples.map((s, i) => {
          const h = Math.max(2, Math.abs(s) * (height - 4));
          const played = i / samples.length < progress;
          return <rect key={i} x={i * barW + barW * 0.2} y={(height - h) / 2} width={barW * 0.6} height={h} rx={smooth ? barW * 0.3 : 0} fill={color} fillOpacity={played ? 1 : 0.35} className="ui-chart-bar" />;
        })}
      </svg>
    </div>
  );
};
