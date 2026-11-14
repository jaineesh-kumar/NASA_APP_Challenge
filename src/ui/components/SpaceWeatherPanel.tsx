// Real space weather: era picker + storms-per-year chart from NASA DONKI (S12). ADR-005.
// Hand-written SVG (Spec B2). Identity is never color-alone: legend + era text in tooltip/table.

import React, { useState } from 'react';
import { copy } from '../../content/copy.ts';
import { getSpaceWeather } from '../../engine/spaceWeather.ts';
import { SunEra } from '../../engine/types.ts';

const sw = getSpaceWeather();
const ERAS: readonly SunEra[] = ['all', 'quiet', 'stormy'];

function eraOf(year: number): 'quiet' | 'stormy' | 'other' {
  if (sw.quietYears.includes(year)) return 'quiet';
  if (sw.stormyYears.includes(year)) return 'stormy';
  return 'other';
}

const FILL = { quiet: 'var(--viz-calm)', stormy: 'var(--viz-stormy)', other: 'var(--viz-neutral)' };
const LABEL = {
  quiet: copy.spaceWeather.legendQuiet,
  stormy: copy.spaceWeather.legendStormy,
  other: copy.spaceWeather.legendOther,
};

export function eraName(era: SunEra): string {
  return copy.spaceWeather.eras[era].name;
}

export function eraDescription(era: SunEra): string {
  const e = copy.spaceWeather.eras;
  if (era === 'quiet') return e.quiet.desc(sw.quietYears.join(', '));
  if (era === 'stormy') return e.stormy.desc(sw.stormyYears.join(', '));
  return e.all.desc;
}

interface Props {
  value: SunEra;
  onChange: (era: SunEra) => void;
  disabled?: boolean;
}

export const SpaceWeatherPanel: React.FC<Props> = ({ value, onChange, disabled }) => {
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const years = sw.years;
  const max = Math.max(1, ...years.map((y) => y.storms));
  const W = 560;
  const H = 180;
  const padL = 28;
  const padB = 22;
  const padT = 10;
  const plotH = H - padB - padT;
  const slot = (W - padL) / years.length;
  const barW = Math.max(4, slot - 4); // 4px gap between bars
  const ticks = [0, Math.round(max / 2), max];
  const hovered = years.find((y) => y.year === hoverYear);
  const first = years[0]?.year ?? 0;
  const last = years.at(-1)?.year ?? 0;
  const noWarnPct = Math.round(sw.noWarningShare * 100);

  return (
    <section className="panel-card" aria-labelledby="sw-title">
      <h3 id="sw-title" className="card-title">
        {copy.spaceWeather.title}
      </h3>
      <p className="muted small" style={{ marginBottom: 12 }}>
        {copy.spaceWeather.intro}
      </p>

      <fieldset style={{ border: 'none', marginBottom: 16 }} disabled={disabled}>
        <legend className="small" style={{ fontWeight: 600, marginBottom: 8 }}>
          {copy.spaceWeather.eraLabel}
        </legend>
        <div className="choice-list">
          {ERAS.map((era) => (
            <label key={era} className="choice">
              <input
                type="radio"
                name="sun-era"
                value={era}
                checked={value === era}
                onChange={() => onChange(era)}
              />
              <span>
                <strong>{eraName(era)}</strong>
                <br />
                <span className="muted small">{eraDescription(era)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <h4 className="small" style={{ fontWeight: 600, marginBottom: 6 }}>
        {copy.spaceWeather.chartTitle}
      </h4>
      <div className="legend" aria-hidden="true" style={{ marginBottom: 6 }}>
        {(['quiet', 'stormy', 'other'] as const).map((k) => (
          <span key={k}>
            <span className="legend-swatch" style={{ background: FILL[k] }} />
            {LABEL[k]}
          </span>
        ))}
      </div>
      <div className="chart">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={copy.spaceWeather.chartDesc(first, last)}
        >
          {ticks.map((v) => {
            const y = padT + plotH - (v / max) * plotH;
            return (
              <g key={v}>
                <line x1={padL} x2={W} y1={y} y2={y} stroke="var(--viz-grid)" strokeWidth={1} />
                <text
                  x={padL - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill="var(--color-text-muted)"
                >
                  {v}
                </text>
              </g>
            );
          })}
          {years.map((y, i) => {
            const h = (y.storms / max) * plotH;
            const x = padL + i * slot + 2;
            const isHover = hoverYear === y.year;
            return (
              <g
                key={y.year}
                onMouseEnter={() => setHoverYear(y.year)}
                onMouseLeave={() => setHoverYear(null)}
              >
                {/* Hit target taller than the bar so short bars are easy to hover. */}
                <rect x={x - 2} y={padT} width={slot} height={plotH} fill="transparent" />
                <rect
                  x={x}
                  y={padT + plotH - h}
                  width={barW}
                  height={Math.max(h, 0.5)}
                  rx={Math.min(4, barW / 2)}
                  fill={FILL[eraOf(y.year)]}
                  opacity={hoverYear === null || isHover ? 1 : 0.55}
                />
                {i % 2 === 0 || years.length < 10 ? (
                  <text
                    x={x + barW / 2}
                    y={H - 6}
                    textAnchor="middle"
                    fontSize={10}
                    fill="var(--color-text-muted)"
                  >
                    {String(y.year).slice(2)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="chart-tooltip" aria-live="polite">
        {hovered ? `${hovered.year}: ${hovered.storms} · ${LABEL[eraOf(hovered.year)]}` : ' '}
      </p>

      <table className="sr-only">
        <caption>{copy.spaceWeather.chartTitle}</caption>
        <tbody>
          {years.map((y) => (
            <tr key={y.year}>
              <th scope="row">{y.year}</th>
              <td>{y.storms}</td>
              <td>{LABEL[eraOf(y.year)]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="small" style={{ marginTop: 8 }}>
        {copy.spaceWeather.stats(sw.storms.length, sw.medianLeadH, noWarnPct)}
      </p>
      <p className="muted small" style={{ marginTop: 6 }}>
        {copy.spaceWeather.attribution(sw.fetchedAt, sw.coverageStart, sw.coverageEnd)}
      </p>
    </section>
  );
};
