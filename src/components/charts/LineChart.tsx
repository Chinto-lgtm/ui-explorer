import React, { useId } from 'react';
import './Chart.css';

export interface DataPoint {
  label: string;
  value: number;
}

export interface LineChartProps {
  data: DataPoint[];
  height?: number;
  showPoints?: boolean;
  color?: string;
  gradient?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 180,
  showPoints = true,
  color = 'var(--color-accent)',
  gradient = true
}) => {
  const gradientId = useId();
  if (!data || data.length === 0) return null;

  const width = 500;
  // Compact charts (sparklines) need proportionally smaller padding or the plot area collapses.
  const padding = Math.min(30, Math.max(4, Math.round(height * 0.16)));
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = height - padding - ((d.value - minValue) / range) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="ui-chart-container">
      <svg viewBox={`0 0 ${width} ${height}`} className="ui-chart-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * chartHeight;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              className="ui-chart-grid-line"
            />
          );
        })}

        {/* Area fill */}
        {gradient && <path d={areaD} fill={`url(#${gradientId})`} />}

        {/* Line stroke */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive Data points */}
        {showPoints &&
          points.map((p, i) => (
            <g key={i} className="ui-chart-point-group">
              <circle cx={p.x} cy={p.y} r="5" fill={color} stroke="var(--color-surface)" strokeWidth="2" />
              <title>{`${p.label}: ${p.value}`}</title>
            </g>
          ))}
      </svg>
      <div className="ui-chart-labels">
        {data.map((d, i) => (
          <span key={i} className="ui-chart-label">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};
