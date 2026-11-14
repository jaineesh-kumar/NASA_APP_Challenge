// Hand-written SVG bar chart of failure causes across Monte Carlo campaign
// Spec B2, B4.9, B5.8

import React from 'react';
import { copy } from '../../content/copy.ts';
import { FailureCause } from '../../engine/types.ts';
import { Icon } from './Icon.tsx';

interface RiskBarChartProps {
  causeCounts: Record<FailureCause | 'science_missed', number>;
  totalRuns: number;
}

export const RiskBarChart: React.FC<RiskBarChartProps> = ({ causeCounts, totalRuns }) => {
  const categories: { key: FailureCause | 'science_missed'; label: string; color: string }[] = [
    { key: 'oxygen', label: copy.causes.oxygen, color: 'var(--viz-cause-1)' },
    { key: 'co2', label: copy.causes.co2, color: 'var(--viz-cause-2)' },
    { key: 'water', label: copy.causes.water, color: 'var(--viz-cause-3)' },
    { key: 'food', label: copy.causes.food, color: 'var(--viz-cause-4)' },
    { key: 'dose', label: copy.causes.dose, color: 'var(--viz-cause-5)' },
    { key: 'science_missed', label: copy.causes.science_missed, color: 'var(--viz-cause-6)' },
  ];

  const maxCount = Math.max(1, ...categories.map((c) => causeCounts[c.key]));
  const totalFailures = categories.reduce((acc, c) => acc + causeCounts[c.key], 0);

  const chartHeight = 220;
  const barWidth = 44;
  const gap = 36;
  const marginLeft = 60;
  const marginTop = 20;
  const marginBottom = 50;
  const chartWidth = marginLeft + categories.length * (barWidth + gap) + 20;

  return (
    <div className="panel-card" style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
        {copy.review.riskChartTitle}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        {copy.charts.intro(totalRuns)}
      </p>

      {totalFailures === 0 ? (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          <Icon name="check" size={18} /> {copy.charts.noFailures}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <svg
            width="100%"
            height={chartHeight + marginBottom}
            viewBox={`0 0 ${chartWidth} ${chartHeight + marginBottom}`}
            role="img"
            aria-label="Bar chart showing counts of failure causes across campaign runs"
            style={{ display: 'block', maxWidth: '100%' }}
          >
            <title>Failure Causes Bar Chart</title>
            <desc>
              Bar chart displaying occurrence counts of oxygen, CO2, water, food, radiation, and
              science missed.
            </desc>

            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
              const y = marginTop + (1 - ratio) * (chartHeight - marginTop);
              const val = Math.round(ratio * maxCount);
              return (
                <g key={ratio}>
                  <line
                    x1={marginLeft}
                    y1={y}
                    x2={chartWidth - 20}
                    y2={y}
                    stroke="var(--color-border)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={marginLeft - 8}
                    y={y + 4}
                    fill="var(--color-text-muted)"
                    fontSize="11"
                    textAnchor="end"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {categories.map((cat, index) => {
              const count = causeCounts[cat.key];
              const barHeight = (count / maxCount) * (chartHeight - marginTop);
              const x = marginLeft + index * (barWidth + gap);
              const y = marginTop + (chartHeight - marginTop) - barHeight;

              return (
                <g key={cat.key}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={cat.color}
                    rx="4"
                    style={{ transition: 'height 0.3s ease' }}
                  />
                  {/* Count on top of bar */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    fill="var(--color-text-main)"
                    fontSize="12"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {count}
                  </text>
                  {/* Category label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 18}
                    fill="var(--color-text-muted)"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {copy.causesShort[cat.key]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Accessible Text Fallback (B4.9) */}
      <details style={{ marginTop: '14px', fontSize: '0.85rem' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--color-text-muted)' }}>
          {copy.charts.tableToggle}
        </summary>
        <table
          style={{
            width: '100%',
            marginTop: '8px',
            borderCollapse: 'collapse',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '6px' }}>Cause</th>
              <th style={{ padding: '6px' }}>Count</th>
              <th style={{ padding: '6px' }}>Rate</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.key} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '6px' }}>{c.label}</td>
                <td style={{ padding: '6px' }}>{causeCounts[c.key]}</td>
                <td style={{ padding: '6px' }}>
                  {((causeCounts[c.key] / totalRuns) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
};
