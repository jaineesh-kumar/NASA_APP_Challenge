// Storm picker: random storms or Real Storm Replay of an archived DONKI event (B10.3, B5.11)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { getDonkiArchive } from '../../engine/params.ts';
import { DonkiEvent, StormMode } from '../../engine/types.ts';
import { WhyThisNumber } from './WhyThisNumber.tsx';
import { Icon } from './Icon.tsx';

const archive = getDonkiArchive();

/** "10 May 2024" (UTC, so every viewer sees the same date as DONKI). */
export function stormDate(e: DonkiEvent): string {
  return new Date(e.eventTime).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function findStorm(mode: StormMode): DonkiEvent | null {
  if (mode.kind !== 'replay') return null;
  return archive.events.find((e) => e.id === mode.eventId) ?? null;
}

export function stormModeName(mode: StormMode): string {
  const e = findStorm(mode);
  return e ? copy.storms.replayName(stormDate(e)) : copy.storms.randomName;
}

export const ArchivedLabel: React.FC = () => (
  <p className="small" role="note" style={{ fontWeight: 600 }}>
    <Icon name="archive" size={18} /> {copy.storms.archivedLabel(archive.retrievedAt)}
  </p>
);

interface Props {
  value: StormMode;
  onChange: (mode: StormMode) => void;
  disabled?: boolean;
}

export const StormPicker: React.FC<Props> = ({ value, onChange, disabled }) => {
  const s = copy.storms;
  return (
    <section className="panel-card" aria-labelledby="storm-title">
      <h3 id="storm-title" className="card-title">
        {s.title}
      </h3>
      <p className="muted small" style={{ marginBottom: 12 }}>
        {s.intro}
      </p>
      <fieldset style={{ border: 'none' }} disabled={disabled}>
        <legend className="small" style={{ fontWeight: 600, marginBottom: 8 }}>
          {s.pickerLabel}
        </legend>
        <div className="choice-list storm-grid">
          <label className="choice">
            <input
              type="radio"
              name="storm-mode"
              checked={value.kind === 'random'}
              onChange={() => onChange({ kind: 'random' })}
            />
            <span>
              <strong>{s.randomName}</strong>
              <WhyThisNumber paramId="radiation.spe_per_month" />
              <br />
              <span className="muted small">{s.randomDesc}</span>
            </span>
          </label>
          {archive.events.map((e) => (
            <label key={e.id} className="choice">
              <input
                type="radio"
                name="storm-mode"
                checked={value.kind === 'replay' && value.eventId === e.id}
                onChange={() => onChange({ kind: 'replay', eventId: e.id })}
              />
              <span>
                <strong>{s.replayName(stormDate(e))}</strong>
                <br />
                <span className="small">{s.replayDesc(e.flareClass)}</span>
                <br />
                <span className="small muted">{s.sourceBadge}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div style={{ marginTop: 12 }}>
        <ArchivedLabel />
        <p className="muted small" style={{ marginTop: 4 }}>
          {s.honesty}
          <WhyThisNumber paramId="radiation.spe_multiplier_by_flare_class" />
        </p>
        {findStorm(value) ? (
          <p className="small" style={{ marginTop: 4 }}>
            <a href={findStorm(value)?.link} target="_blank" rel="noopener noreferrer">
              {s.donkiLink}
            </a>
            {' · '}
            <a href={findStorm(value)?.classEvidence.url} target="_blank" rel="noopener noreferrer">
              {s.evidenceLink}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
};

/** L10 AC7 / B10.3: "Your crew vs the storm of <date>: X out of every 100 came home." */
export const StormResultLine: React.FC<{
  mode: StormMode;
  survivalRate: number;
  shieldLayers: number;
  doseUsvP95: number;
  doseLimitUsv: number;
  stormsPerRunMean: number;
  stormsMaxInRun: number;
}> = ({
  mode,
  survivalRate,
  shieldLayers,
  doseUsvP95,
  doseLimitUsv,
  stormsPerRunMean,
  stormsMaxInRun,
}) => {
  const storm = findStorm(mode);
  const r = copy.stormResult;
  if (!storm) {
    return <p>{r.randomSummary(stormsPerRunMean.toFixed(1), stormsMaxInRun)}</p>;
  }
  return (
    <div>
      <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>
        {r.vsStorm(stormDate(storm), Math.round(survivalRate * 100))}
      </p>
      <p className="small">
        {r.shieldLink(
          shieldLayers,
          Math.round(doseUsvP95).toLocaleString('en-US'),
          doseLimitUsv.toLocaleString('en-US'),
        )}
      </p>
      <ArchivedLabel />
    </div>
  );
};
