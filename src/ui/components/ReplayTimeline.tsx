// Replay of the worst run: play / pause / scrub (L7 AC4), resources over time, real storms.

import React, { useEffect, useState } from 'react';
import { Icon } from './Icon.tsx';
import { copy } from '../../content/copy.ts';
import { getSimConstants } from '../../engine/constants.ts';
import { loadParams } from '../../engine/params.ts';
import { ComponentId, LoadId, LogEntry, MissionResult, StormMode } from '../../engine/types.ts';
import { ResourceChart } from './ResourceChart.tsx';
import { findStorm, stormDate } from './StormPicker.tsx';

const k = getSimConstants(loadParams());
const PLAY_STEP_H = 6;
const PLAY_TICK_MS = 80;

export function describeLog(e: LogEntry): string {
  const t = copy.logText;
  switch (e.type) {
    case 'spe_warning':
      return t.spe_warning(e.detail);
    case 'spe_start':
      return t.spe_start(e.detail === 'sheltered');
    case 'component_failed': {
      const [id, flag] = e.detail.split(' ');
      return t.component_failed(
        copy.components[id as ComponentId] ?? id ?? '',
        flag === 'no_spare',
      );
    }
    case 'component_repaired':
      return t.component_repaired(copy.components[e.detail as ComponentId] ?? e.detail);
    case 'load_off':
      return t.load_off(copy.loads[e.detail as LoadId] ?? e.detail);
    case 'shield_layer_built':
      return t.shield_layer_built(e.detail);
    case 'rule_fired':
      return t.rule_fired(e.detail.replace(/_/g, ' '));
    case 'failure':
      return t.failure(copy.causes[e.detail as keyof typeof copy.causes] ?? e.detail);
    default:
      return t[e.type];
  }
}

export const ReplayTimeline: React.FC<{ worstResult: MissionResult; stormMode: StormMode }> = ({
  worstResult,
  stormMode,
}) => {
  const r = worstResult;
  const replayed = findStorm(stormMode);
  const trace = r.trace;
  const lastHour = Math.max(0, (trace?.batteryPct.length ?? k.missionHours) - 1);
  const [hour, setHour] = useState(r.failureHour ?? lastHour);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setHour((h) => {
        if (h >= lastHour) {
          setIsPlaying(false);
          return lastHour;
        }
        return Math.min(lastHour, h + PLAY_STEP_H);
      });
    }, PLAY_TICK_MS);
    return () => clearInterval(id);
  }, [isPlaying, lastHour]);

  const recent = r.log.filter((e) => e.t <= hour && e.t > hour - 24).slice(-8);
  const R = copy.replay;

  return (
    <section className="panel-card" aria-labelledby="replay-title">
      <h3 id="replay-title" className="card-title">
        {R.title(r.seed)}
      </h3>
      <p className="muted small">{R.intro}</p>

      <div className="tile" style={{ margin: '12px 0' }}>
        {replayed ? (
          <p className="small" style={{ fontWeight: 600 }}>
            {R.replayStorm(stormDate(replayed), replayed.flareClass)}{' '}
            <a href={replayed.link} target="_blank" rel="noopener noreferrer">
              {R.donkiLink}
            </a>
          </p>
        ) : (
          <p className="small" style={{ fontWeight: 600 }}>
            {R.stormsTitle}
          </p>
        )}
        {r.storms.length === 0 ? (
          <p className="muted small">{R.noStorms}</p>
        ) : (
          <ul className="small" style={{ paddingLeft: 18, marginTop: 4 }}>
            {r.storms.map((s) => (
              <li key={s.onsetH}>{R.stormLine(s.onsetH, s.wasSheltered)}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="row" style={{ marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => {
            if (!isPlaying && hour >= lastHour) setHour(0);
            setIsPlaying((p) => !p);
          }}
          aria-pressed={isPlaying}
        >
          <Icon name={isPlaying ? 'pause' : 'play'} size={18} /> {isPlaying ? R.pause : R.play}
        </button>
        <label style={{ flex: 1, minWidth: 200 }}>
          <span className="sr-only">{R.scrubberLabel}</span>
          <input
            type="range"
            min={0}
            max={lastHour}
            value={hour}
            onChange={(e) => {
              setIsPlaying(false);
              setHour(Number(e.target.value));
            }}
            aria-valuetext={R.hourNow(hour, k.missionHours)}
          />
        </label>
        <span className="chart-tooltip">{R.hourNow(hour, k.missionHours)}</span>
      </div>

      {trace ? (
        <div>
          <h4 className="small" style={{ fontWeight: 600, margin: '8px 0' }}>
            {R.resourcesTitle}
          </h4>
          <div className="legend" aria-hidden="true" style={{ marginBottom: 8 }}>
            <span>
              <span
                className="legend-swatch"
                style={{
                  background: 'var(--viz-dark-band)',
                  border: '1px solid var(--color-border)',
                }}
              />
              {R.darkBand}
            </span>
            <span>
              <span className="legend-swatch" style={{ background: 'var(--viz-storm-band)' }} />
              {R.stormBand}
            </span>
          </div>
          <ResourceChart
            title={R.battery}
            values={trace.batteryPct}
            hour={hour}
            isDark={trace.isDark}
            isStorm={trace.isStorm}
            format={(v) => `${v.toFixed(0)}%`}
            onPickHour={setHour}
          />
          <ResourceChart
            title={R.o2}
            values={trace.o2Days}
            hour={hour}
            isDark={trace.isDark}
            isStorm={trace.isStorm}
            format={(v) => v.toFixed(1)}
            onPickHour={setHour}
          />
          <ResourceChart
            title={R.dose}
            values={trace.doseUsv}
            hour={hour}
            isDark={trace.isDark}
            isStorm={trace.isStorm}
            limit={k.doseLimitUsv}
            format={(v) => Math.round(v).toLocaleString()}
            onPickHour={setHour}
          />
        </div>
      ) : null}

      <h4 className="small" style={{ fontWeight: 600, margin: '12px 0 6px' }}>
        {R.eventsTitle}
      </h4>
      {recent.length === 0 ? (
        <p className="muted small">{R.noEvents}</p>
      ) : (
        <ul className="small" style={{ paddingLeft: 18 }} aria-live="polite">
          {recent.map((e, i) => (
            <li
              key={`${e.t}-${i}`}
              style={{ color: e.type === 'failure' ? 'var(--color-danger)' : undefined }}
            >
              <span className="muted">h{e.t}</span> {describeLog(e)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
