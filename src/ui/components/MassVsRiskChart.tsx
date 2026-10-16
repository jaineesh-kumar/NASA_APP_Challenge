// Hand-written SVG scatter plot of Launch Mass vs Risk (1 - Survival)
// Spec B2, B4.9, B5.8

import React from 'react';
import { copy } from '../../content/copy.ts';
import { missionPresets } from '../../content/missions.ts';
import { massUsed } from '../../engine/mass.ts';
import { runCampaign } from '../../engine/montecarlo.ts';
import { loadParams } from '../../engine/params.ts';

interface MassVsRiskChartProps {
  currentMass: number;
  currentRiskPct: number; // (1 - survivalRate) * 100
}

interface DataPoint {
  id: string;
  name: string;
  mass: number;
  riskPct: number;
  isCurrent: boolean;
}

const params = loadParams();

export const MassVsRiskChart: React.FC<MassVsRiskChartProps> = ({
  currentMass,
  currentRiskPct,
}) => {
  // Pre-calculate preset data points (using small 20-run samples for stable reference positions)
  const presetPoints: DataPoint[] = React.useMemo(() => {
    return missionPresets.map((p) => {
      const mass = massUsed(p.design, params);
      const res = runCampaign(p.design, p.rules, 20, params);
      const riskPct = Math.round((1 - res.survivalRate) * 100);
      return {
        id: p.id,
        name: p.name,
        mass,
        riskPct,
        isCurrent: false,
      };
    });
  }, []);

  const allPoints: DataPoint[] = [
    ...presetPoints,
    {
      id: 'current',
      name: 'Your Current Design',
      mass: currentMass,
      riskPct: Math.round(currentRiskPct),
      isCurrent: true,
    },
  ];

  const svgWidth = 460;
  const svgHeight = 260;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 45;

  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const toX = (mass: number) => paddingLeft + (mass / 120) * plotWidth;
  const toY = (risk: number) => paddingTop + (1 - risk / 100) * plotHeight;

  return (
    <div className="panel-card" style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
        {copy.review.massRiskChartTitle}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        Trade-off curve comparing payload launch mass (0–120 mu) against mission failure risk.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <svg
          width="100%"
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          role="img"
          aria-label="Scatter plot showing launch mass versus failure risk percentage"
          style={{ display: 'block', maxWidth: '100%' }}
        >
          <title>Launch Mass vs. Failure Risk</title>
          <desc>
            Scatter plot comparing current design mass and risk against documented mission presets.
          </desc>

          {/* Y Axis Gridlines (0%, 25%, 50%, 75%, 100%) */}
          {[0, 25, 50, 75, 100].map((risk) => {
            const y = toY(risk);
            return (
              <g key={risk}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="var(--color-border)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="var(--color-text-muted)"
                  fontSize="11"
                  fontFamily="var(--font-family-mono)"
                  textAnchor="end"
                >
                  {risk}%
                </text>
              </g>
            );
          })}

          {/* X Axis Ticks (0, 30, 60, 90, 120 mu) */}
          {[0, 30, 60, 90, 120].map((mass) => {
            const x = toX(mass);
            return (
              <g key={mass}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={paddingTop + plotHeight}
                  stroke="var(--color-border)"
                  strokeDasharray="2 4"
                  strokeWidth="0.5"
                />
                <text
                  x={x}
                  y={paddingTop + plotHeight + 16}
                  fill="var(--color-text-muted)"
                  fontSize="11"
                  fontFamily="var(--font-family-mono)"
                  textAnchor="middle"
                >
                  {mass}
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text
            x={svgWidth / 2}
            y={svgHeight - 10}
            fill="var(--color-text-muted)"
            fontSize="12"
            textAnchor="middle"
            fontWeight="500"
          >
            {copy.charts.massLabel}
          </text>
          <text
            x={16}
            y={svgHeight / 2}
            fill="var(--color-text-muted)"
            fontSize="12"
            textAnchor="middle"
            fontWeight="500"
            transform={`rotate(-90, 16, ${svgHeight / 2})`}
          >
            {copy.charts.riskLabel}
          </text>

          {/* Data Points */}
          {allPoints.map((pt) => {
            const cx = toX(pt.mass);
            const cy = toY(pt.riskPct);

            if (pt.isCurrent) {
              return (
                <g key={pt.id}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="var(--color-danger)"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  <text
                    x={cx}
                    y={cy - 12}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    You ({pt.mass}mu, {pt.riskPct}%)
                  </text>
                </g>
              );
            }

            return (
              <g key={pt.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill="var(--color-primary)"
                  stroke="var(--color-border)"
                  strokeWidth="1.5"
                />
                <text
                  x={cx}
                  y={cy - 10}
                  fill="var(--color-text-muted)"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {pt.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Accessible Table Fallback */}
      <details style={{ marginTop: '12px', fontSize: '0.85rem' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--color-text-muted)' }}>
          View Mass vs Risk Comparison Table
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
              <th style={{ padding: '6px' }}>Design</th>
              <th style={{ padding: '6px' }}>Mass (mu)</th>
              <th style={{ padding: '6px' }}>Failure Risk</th>
            </tr>
          </thead>
          <tbody>
            {allPoints.map((p) => (
              <tr
                key={p.id}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  fontWeight: p.isCurrent ? 700 : 400,
                }}
              >
                <td style={{ padding: '6px' }}>{p.name}</td>
                <td style={{ padding: '6px' }}>{p.mass} mu</td>
                <td style={{ padding: '6px' }}>{p.riskPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
};
