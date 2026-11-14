// One resource over the mission hours, as a small multiple (one series, one axis).
// Dark windows and solar storms are shaded bands; the current replay hour is a crosshair.

import React from 'react';
import { copy } from '../../content/copy.ts';

interface Props {
  title: string;
  values: readonly number[];
  totalHours: number;
  hour: number;
  isDark: readonly boolean[];
  isStorm: readonly boolean[];
  /** Optional limit line (e.g. dose limit). */
  limit?: number;
  format: (v: number) => string;
  onPickHour?: (h: number) => void;
}

const W = 600;
const H = 90;
const PAD_L = 4;
const PAD_T = 6;
const PAD_B = 6;

function bands(flags: readonly boolean[]): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let start = -1;
  flags.forEach((f, i) => {
    if (f && start < 0) start = i;
    if (!f && start >= 0) {
      out.push([start, i]);
      start = -1;
    }
  });
  if (start >= 0) out.push([start, flags.length]);
  return out;
}

export const ResourceChart: React.FC<Props> = ({
  title,
  values,
  totalHours,
  hour,
  isDark,
  isStorm,
  limit,
  format,
  onPickHour,
}) => {
  const maxV = Math.max(limit ?? 0, ...values, 1e-9);
  const plotH = H - PAD_T - PAD_B;
  const x = (t: number) => PAD_L + (t / totalHours) * (W - PAD_L);
  const y = (v: number) => PAD_T + plotH - (v / maxV) * plotH;
  const path = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join('');
  const clamped = Math.min(hour, values.length - 1);
  const current = values[clamped];

  const pick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onPickHour) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    onPickHour(Math.max(0, Math.min(totalHours - 1, Math.round(frac * totalHours))));
  };

  return (
    <figure className="chart" style={{ marginBottom: 12 }}>
      <figcaption className="row-between small" style={{ marginBottom: 2 }}>
        <span style={{ fontWeight: 600 }}>{title}</span>
        <span className="chart-tooltip">{current === undefined ? '—' : format(current)}</span>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${title}: ${current === undefined ? '' : format(current)}`}
        onClick={pick}
      >
        {bands(isDark).map(([a, b]) => (
          <rect
            key={`d${a}`}
            x={x(a)}
            y={PAD_T}
            width={x(b) - x(a)}
            height={plotH}
            fill="var(--viz-dark-band)"
          />
        ))}
        {bands(isStorm).map(([a, b]) => (
          <rect
            key={`s${a}`}
            x={x(a)}
            y={PAD_T}
            width={Math.max(2, x(b) - x(a))}
            height={plotH}
            fill="var(--viz-storm-band)"
          />
        ))}
        <line x1={PAD_L} x2={W} y1={y(0)} y2={y(0)} stroke="var(--viz-grid)" strokeWidth={1} />
        {limit !== undefined ? (
          <line
            x1={PAD_L}
            x2={W}
            y1={y(limit)}
            y2={y(limit)}
            stroke="var(--viz-limit)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        ) : null}
        <path
          d={path}
          fill="none"
          stroke="var(--viz-line)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <line
          x1={x(clamped)}
          x2={x(clamped)}
          y1={PAD_T}
          y2={PAD_T + plotH}
          stroke="var(--color-text-main)"
          strokeWidth={1}
        />
        {current !== undefined ? (
          <circle
            cx={x(clamped)}
            cy={y(current)}
            r={4}
            fill="var(--viz-line)"
            stroke="var(--color-bg-surface)"
            strokeWidth={2}
          />
        ) : null}
      </svg>
      <div className="legend" aria-hidden="true">
        <span>
          <span
            className="legend-swatch"
            style={{ background: 'var(--viz-dark-band)', border: '1px solid var(--color-border)' }}
          />
          {copy.replay.darkBand}
        </span>
        <span>
          <span className="legend-swatch" style={{ background: 'var(--viz-storm-band)' }} />
          {copy.replay.stormBand}
        </span>
      </div>
    </figure>
  );
};
