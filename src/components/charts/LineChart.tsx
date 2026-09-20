import React, { useId, useMemo, useState } from 'react';
import { niceScale, linePath, formatValue, seriesColor } from './chartUtils';
import type { DataPoint, Series } from './chartUtils';
import { useChartStyle } from './useChartStyle';
import './Chart.css';

export type { DataPoint } from './chartUtils';

export interface LineChartProps {
  /** Single series (legacy) or multiple series. */
  data?: DataPoint[];
  series?: Series[];
  height?: number;
  showPoints?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  showTooltip?: boolean;
  gradient?: boolean;
  /** Fill under the line (area chart). */
  area?: boolean;
  animate?: boolean;
  strokeWidth?: number;
  color?: string;
  onPointClick?: (point: DataPoint, seriesIndex: number) => void;
  /** Force the top of the value axis. */
  yMax?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  series,
  height = 180,
  showPoints = true,
  showGrid = true,
  showLabels = true,
  showTooltip = true,
  gradient = true,
  area = false,
  animate = true,
  strokeWidth = 3,
  color,
  onPointClick,
  yMax
}) => {
  const gradientId = useId();
  const glowId = useId();
  const { smooth, glow, ref } = useChartStyle();
  const [hover, setHover] = useState<{ s: number; i: number } | null>(null);
  const [active, setActive] = useState<{ s: number; i: number } | null>(null);

  const allSeries: Series[] = useMemo(() => series ?? (data ? [{ name: 'Series', data, color }] : []), [series, data, color]);
  const first = allSeries[0];
  if (!first || first.data.length === 0) return null;

  const width = 500;
  // Compact charts (sparklines) need proportionally smaller padding or the plot area collapses.
  const padding = Math.min(30, Math.max(4, Math.round(height * 0.16)));
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const scale = niceScale([...allSeries.flatMap((s) => s.data.map((d) => d.value)), ...(yMax ? [yMax] : [])], 4, true);
  const range = scale.max - scale.min || 1;
  const count = first.data.length;
  const xFor = (i: number) => padding + (count > 1 ? (i / (count - 1)) * chartWidth : chartWidth / 2);
  const yFor = (v: number) => height - padding - ((v - scale.min) / range) * chartHeight;

  const isCompact = height < 90;
  const hovered = hover ?? active;

  return (
    <div ref={ref} className={`ui-chart-container ${animate ? 'ui-chart--animate' : ''}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="ui-chart-svg" preserveAspectRatio="none" role="img" aria-label={`Line chart, ${allSeries.map((s) => s.name).join(', ')}`}>
        <defs>
          {allSeries.map((s, si) => (
            <linearGradient key={si} id={`${gradientId}-${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={seriesColor(s, si)} stopOpacity={area ? 0.55 : 0.4} />
              <stop offset="100%" stopColor={seriesColor(s, si)} stopOpacity="0" />
            </linearGradient>
          ))}
          {glow && (
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          )}
        </defs>

        {showGrid && !isCompact && scale.ticks.map((t) => (
          <g key={t}>
            <line x1={padding} y1={yFor(t)} x2={width - padding} y2={yFor(t)} className="ui-chart-grid-line" />
            <text x={padding - 6} y={yFor(t)} className="ui-chart-axis-label" textAnchor="end" dominantBaseline="middle">{formatValue(t)}</text>
          </g>
        ))}

        {allSeries.map((s, si) => {
          const points = s.data.map((d, i) => ({ x: xFor(i), y: yFor(d.value), ...d }));
          const path = linePath(points, smooth);
          const areaPath = `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
          const stroke = seriesColor(s, si);
          return (
            <g key={si}>
              {(gradient || area) && <path d={areaPath} fill={`url(#${gradientId}-${si})`} className="ui-chart-area" />}
              <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap={smooth ? 'round' : 'square'} strokeLinejoin={smooth ? 'round' : 'miter'} className="ui-chart-line" filter={glow ? `url(#${glowId})` : undefined} />
              {showPoints && points.map((p, i) => {
                const isHot = hovered?.s === si && hovered.i === i;
                return (
                  <g key={i} className="ui-chart-point-group" onMouseEnter={() => setHover({ s: si, i })} onMouseLeave={() => setHover(null)}>
                    <circle cx={p.x} cy={p.y} r={isHot ? 7 : 5} fill={stroke} stroke="var(--color-surface)" strokeWidth="2" className="ui-chart-point" />
                    <circle
                      cx={p.x} cy={p.y} r={14} fill="transparent"
                      tabIndex={0}
                      role="button"
                      aria-label={`${s.name} ${p.label}: ${p.value}`}
                      onFocus={() => setHover({ s: si, i })}
                      onBlur={() => setHover(null)}
                      onClick={() => { setActive({ s: si, i }); onPointClick?.(p, si); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive({ s: si, i }); onPointClick?.(p, si); } }}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        {showTooltip && hovered && (() => {
          const s = allSeries[hovered.s];
          const d = s.data[hovered.i];
          if (!d) return null;
          const x = xFor(hovered.i);
          const y = yFor(d.value);
          const flip = x > width - 90;
          const tx = flip ? x - 8 : x + 8;
          return (
            <g className="ui-chart-tooltip" transform={`translate(${tx} ${Math.max(padding, y - 14)})`}>
              <rect x={flip ? -84 : 0} y="-12" width="84" height="26" rx="6" />
              <text x={flip ? -78 : 6} y="5" className="ui-chart-tooltip__text">{d.label}: {formatValue(d.value)}</text>
            </g>
          );
        })()}
      </svg>

      {showLabels && (
        <div className="ui-chart-labels">
          {first.data.map((d, i) => (
            <span key={i} className="ui-chart-label">{d.label}</span>
          ))}
        </div>
      )}

      {allSeries.length > 1 && (
        <ul className="ui-chart-legend">
          {allSeries.map((s, si) => (
            <li key={si}><span className="ui-chart-legend__swatch" style={{ background: seriesColor(s, si) }} />{s.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
