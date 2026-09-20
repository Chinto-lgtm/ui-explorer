import React, { useId, useState } from 'react';
import { niceScale, formatValue, seriesColor } from './chartUtils';
import type { DataPoint, Series } from './chartUtils';
import { useChartStyle } from './useChartStyle';
import './Chart.css';

export interface BarChartProps {
  data?: DataPoint[];
  series?: Series[];
  height?: number;
  horizontal?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  barColor?: string;
  stacked?: boolean;
  onBarClick?: (point: DataPoint, seriesIndex: number) => void;
  /** Force the top of the value axis. */
  yMax?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data, series, height = 180, horizontal = false, showGrid = true, showLabels = true, showTooltip = true, animate = true, barColor, stacked = false, onBarClick, yMax
}) => {
  const glowId = useId();
  const { smooth, glow, ref } = useChartStyle();
  const [hover, setHover] = useState<{ s: number; i: number } | null>(null);
  const allSeries: Series[] = series ?? (data ? [{ name: 'Series', data, color: barColor }] : []);
  const first = allSeries[0];
  if (!first || first.data.length === 0) return null;

  const width = 500;
  const padding = Math.min(30, Math.max(6, Math.round(height * 0.16)));
  const plotW = width - padding * 2;
  const plotH = height - padding * 2;
  const count = first.data.length;
  const totals = stacked
    ? first.data.map((_, i) => allSeries.reduce((sum, s) => sum + (s.data[i]?.value ?? 0), 0))
    : allSeries.flatMap((s) => s.data.map((d) => d.value));
  const scale = niceScale([...totals, ...(yMax ? [yMax] : [])], 4, true);
  const range = scale.max - scale.min || 1;
  const radius = smooth ? 4 : 0;
  const groupSize = (horizontal ? plotH : plotW) / count;
  const barsPerGroup = stacked ? 1 : allSeries.length;
  const barThickness = Math.min(36, (groupSize * 0.7) / barsPerGroup);

  const valueToLength = (v: number) => ((v - scale.min) / range) * (horizontal ? plotW : plotH);

  return (
    <div ref={ref} className={`ui-chart-container ${animate ? 'ui-chart--animate' : ''}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="ui-chart-svg" preserveAspectRatio="none" role="img" aria-label={`Bar chart, ${allSeries.map((s) => s.name).join(', ')}`}>
        <defs>
          {glow && (
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          )}
        </defs>

        {showGrid && scale.ticks.map((t) => horizontal ? (
          <g key={t}>
            <line x1={padding + valueToLength(t)} y1={padding} x2={padding + valueToLength(t)} y2={height - padding} className="ui-chart-grid-line" />
            <text x={padding + valueToLength(t)} y={height - padding + 12} className="ui-chart-axis-label" textAnchor="middle">{formatValue(t)}</text>
          </g>
        ) : (
          <g key={t}>
            <line x1={padding} y1={height - padding - valueToLength(t)} x2={width - padding} y2={height - padding - valueToLength(t)} className="ui-chart-grid-line" />
            <text x={padding - 6} y={height - padding - valueToLength(t)} className="ui-chart-axis-label" textAnchor="end" dominantBaseline="middle">{formatValue(t)}</text>
          </g>
        ))}

        {first.data.map((_, i) => {
          let offset = 0;
          return allSeries.map((s, si) => {
            const d = s.data[i];
            if (!d) return null;
            const len = valueToLength(d.value) - valueToLength(scale.min);
            const groupStart = (horizontal ? padding : padding) + i * groupSize + (groupSize - barThickness * barsPerGroup) / 2;
            const along = stacked ? groupStart : groupStart + si * barThickness;
            const base = stacked ? offset : 0;
            if (stacked) offset += len;
            const isHot = hover?.s === si && hover.i === i;
            const fill = seriesColor(s, si);
            const common = {
              className: `ui-chart-bar ${isHot ? 'ui-chart-bar--hot' : ''}`,
              fill,
              rx: radius,
              filter: glow ? `url(#${glowId})` : undefined,
              tabIndex: 0,
              role: 'button' as const,
              'aria-label': `${s.name} ${d.label}: ${d.value}`,
              onMouseEnter: () => setHover({ s: si, i }),
              onMouseLeave: () => setHover(null),
              onFocus: () => setHover({ s: si, i }),
              onBlur: () => setHover(null),
              onClick: () => onBarClick?.(d, si),
              onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBarClick?.(d, si); } }
            };
            return horizontal ? (
              <rect key={`${si}-${i}`} x={padding + base} y={along} width={Math.max(0, len)} height={barThickness - 2} {...common} />
            ) : (
              <rect key={`${si}-${i}`} x={along} y={height - padding - base - len} width={barThickness - 2} height={Math.max(0, len)} {...common} />
            );
          });
        })}

        {showTooltip && hover && (() => {
          const s = allSeries[hover.s];
          const d = s.data[hover.i];
          if (!d) return null;
          const groupStart = padding + hover.i * groupSize + (groupSize - barThickness * barsPerGroup) / 2;
          const along = stacked ? groupStart : groupStart + hover.s * barThickness;
          const len = valueToLength(d.value) - valueToLength(scale.min);
          const x = horizontal ? Math.min(width - 96, padding + len + 8) : Math.min(width - 96, along);
          const y = horizontal ? along + barThickness / 2 : Math.max(padding, height - padding - len - 18);
          return (
            <g className="ui-chart-tooltip" transform={`translate(${x} ${y})`}>
              <rect x="0" y="-12" width="90" height="26" rx="6" />
              <text x="6" y="5" className="ui-chart-tooltip__text">{d.label}: {formatValue(d.value)}</text>
            </g>
          );
        })()}
      </svg>

      {showLabels && !horizontal && (
        <div className="ui-chart-labels">
          {first.data.map((d, i) => <span key={i} className="ui-chart-label">{d.label}</span>)}
        </div>
      )}
      {showLabels && horizontal && (
        <div className="ui-chart-labels ui-chart-labels--rows" style={{ height }}>
          {first.data.map((d, i) => <span key={i} className="ui-chart-label">{d.label}</span>)}
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
