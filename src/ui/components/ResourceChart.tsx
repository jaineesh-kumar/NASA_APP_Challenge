// One resource over the mission hours, as a small multiple (one series, one axis).
// The x-axis ends where the mission ended. Dark windows and storms are shaded bands; the
// replay hour is a crosshair.

import React from 'react';
import { copy } from '../../content/copy.ts';

interface Props {
  title: string;
  values: readonly number[];
  hour: number;
  isDark: readonly boolean[];
  isStorm: readonly boolean[];
  /** Optional limit line (e.g. dose limit). */
  limit?: number;
  format: (v: number) => string;
  onPickHour?: (h: number) => void;
}

const W = 600;
const H = 96;
const PAD_L = 4;
const PAD_T = 6;
const PAD_B = 20;

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
  hour,
  isDark,
  isStorm,
  limit,
  format,
  onPickHour,
}) => {
  const span = Math.max(1, values.length); // hours actually flown
  const maxV = Math.max(limit ?? 0, ...values, 1e-9);
  const plotH = H - PAD_T - PAD_B;
  const x = (t: number) => PAD_L + (t / span) * (W - PAD_L);
  const y = (v: number) => PAD_T + plotH - (v / maxV) * plotH;
  const path = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join('');
  const clamped = Math.max(0, Math.min(hour, values.length - 1));
  const current = values[clamped];
  const ticks = [0, Math.round(span / 2), span];

  const pick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onPickHour) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    onPickHour(Math.max(0, Math.min(span - 1, Math.round(frac * span))));
  };

  return (
    <figure className="chart" style={{ marginBottom: 12 }}>
      <figcaption className="row-between small" style={{ marginBottom: 2 }}>
        <span style={{ fontWeight: 700 }}>{title}</span>
        <span className="chart-tooltip">{current === undefined ? '' : format(current)}</span>
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
            strokeWidth={1.5}
            strokeDasharray="5 4"
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
          stroke="var(--navy)"
          strokeWidth={1}
        />
        {current !== undefined ? (
          <circle
            cx={x(clamped)}
            cy={y(current)}
            r={4}
            fill="var(--viz-line)"
            stroke="var(--coupon)"
            strokeWidth={2}
          />
        ) : null}
        {ticks.map((t, i) => (
          <text
            key={t}
            x={x(t)}
            y={H - 4}
            fontSize={9}
            fill="var(--color-text-muted)"
            textAnchor={i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : 'middle'}
          >
            {copy.replay.hourTick(t)}
          </text>
        ))}
      </svg>
    </figure>
  );
};
