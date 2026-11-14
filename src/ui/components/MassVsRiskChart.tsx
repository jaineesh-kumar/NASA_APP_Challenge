// Mass vs. risk for every design tested this session (Spec B8, L7 AC3). Hand-written SVG.
// Uses stored campaign results only; it never runs simulations on the main thread.

import React, { useState } from 'react';
import { copy } from '../../content/copy.ts';
import { loadParams } from '../../engine/params.ts';
import { TriedDesign } from '../../state/store.tsx';
import { stormModeName } from './StormPicker.tsx';

const budget = loadParams().getNumber('mass.budget');

export const MassVsRiskChart: React.FC<{ history: readonly TriedDesign[] }> = ({ history }) => {
  const [hover, setHover] = useState<number | null>(null);
  const W = 460;
  const H = 240;
  const L = 44;
  const R = 16;
  const T = 12;
  const B = 36;
  const x = (m: number) => L + (m / budget) * (W - L - R);
  const y = (r: number) => T + (1 - r / 100) * (H - T - B);
  const latest = history.at(-1);
  const shown = history.find((p) => p.n === hover) ?? latest;
  const describe = (p: TriedDesign) =>
    `${copy.charts.tried(p.n)}: ${p.massUsed} mu, ${p.riskPct.toFixed(1)}% · ${stormModeName(p.stormMode)}`;

  return (
    <section className="panel-card" aria-labelledby="mvr-title">
      <h3 id="mvr-title" className="card-title">
        {copy.review.massRiskChartTitle}
      </h3>
      {history.length < 2 ? <p className="muted small">{copy.review.massRiskEmpty}</p> : null}
      <div className="chart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={copy.review.massRiskChartTitle}>
          {[0, 25, 50, 75, 100].map((r) => (
            <g key={r}>
              <line x1={L} x2={W - R} y1={y(r)} y2={y(r)} stroke="var(--viz-grid)" />
              <text
                x={L - 6}
                y={y(r) + 4}
                fontSize={10}
                textAnchor="end"
                fill="var(--color-text-muted)"
              >
                {r}%
              </text>
            </g>
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <text
              key={f}
              x={x(f * budget)}
              y={H - B + 16}
              fontSize={10}
              textAnchor="middle"
              fill="var(--color-text-muted)"
            >
              {Math.round(f * budget)}
            </text>
          ))}
          <text
            x={(L + W - R) / 2}
            y={H - 4}
            fontSize={11}
            textAnchor="middle"
            fill="var(--color-text-muted)"
          >
            {copy.charts.massLabel}
          </text>
          <text
            x={12}
            y={(T + H - B) / 2}
            fontSize={11}
            textAnchor="middle"
            fill="var(--color-text-muted)"
            transform={`rotate(-90 12 ${(T + H - B) / 2})`}
          >
            {copy.charts.riskLabel}
          </text>
          {history.map((p) => {
            const isLatest = p === latest;
            return (
              <g key={p.n} onMouseEnter={() => setHover(p.n)} onMouseLeave={() => setHover(null)}>
                <circle cx={x(p.massUsed)} cy={y(p.riskPct)} r={12} fill="transparent" />
                <circle
                  cx={x(p.massUsed)}
                  cy={y(p.riskPct)}
                  r={isLatest ? 7 : 5}
                  fill={isLatest ? 'var(--viz-line)' : 'var(--viz-neutral)'}
                  stroke="var(--color-bg-surface)"
                  strokeWidth={2}
                />
                {isLatest ? (
                  <text
                    x={x(p.massUsed) + 10}
                    y={y(p.riskPct) - 8}
                    fontSize={10}
                    fill="var(--color-text-main)"
                  >
                    {copy.charts.current}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="chart-tooltip" aria-live="polite">
        {shown ? describe(shown) : ' '}
      </p>
      <table className="sr-only">
        <caption>{copy.review.massRiskChartTitle}</caption>
        <tbody>
          {history.map((p) => (
            <tr key={p.n}>
              <td>{describe(p)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
