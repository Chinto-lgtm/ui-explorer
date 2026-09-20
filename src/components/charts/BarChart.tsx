import React from 'react';
import type { DataPoint } from './LineChart';
import './Chart.css';

export interface BarChartProps {
  data: DataPoint[];
  height?: number;
  barColor?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 180,
  barColor = 'var(--color-accent)'
}) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="ui-chart-container">
      <div className="ui-barchart-bars" style={{ height: `${height}px` }}>
        {data.map((d, i) => {
          const heightPercent = (d.value / maxValue) * 100;
          return (
            <div key={i} className="ui-barchart-col">
              <div className="ui-barchart-bar-wrapper">
                <div
                  className="ui-barchart-bar"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: barColor
                  }}
                >
                  <span className="ui-barchart-tooltip">{d.value}</span>
                </div>
              </div>
              <span className="ui-chart-label">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
