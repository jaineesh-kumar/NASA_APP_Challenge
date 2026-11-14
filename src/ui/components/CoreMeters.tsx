// Junior Mode's three core meters (B10.7): Power, Life support (the weakest of air, water and
// food, named), and Shield (dose so far vs the limit, plus layers built). Read from the replay
// trace at the current hour.

import React from 'react';
import { copy } from '../../content/copy.ts';
import { getSimConstants } from '../../engine/constants.ts';
import { loadParams } from '../../engine/params.ts';
import { MissionResult } from '../../engine/types.ts';
import { Term } from './Term.tsx';

const k = getSimConstants(loadParams());
const MISSION_DAYS = k.missionHours / 24;

interface MeterProps {
  name: string;
  /** 0..1, how full the meter is (1 = safest). */
  level: number;
  text: string;
}

const Meter: React.FC<MeterProps> = ({ name, level, text }) => {
  const pct = Math.round(Math.max(0, Math.min(1, level)) * 100);
  const tone = pct < 20 ? 'is-low' : pct < 50 ? 'is-mid' : 'is-ok';
  return (
    <div className="meter">
      <div className="row-between">
        <span className="meter-name">{name}</span>
        <span className="meter-pct">{pct}%</span>
      </div>
      <div
        className={`meter-bar ${tone}`}
        role="meter"
        aria-label={name}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={text}
      >
        <div style={{ width: `${pct}%` }} />
      </div>
      <p className="small muted">{text}</p>
    </div>
  );
};

export const CoreMeters: React.FC<{ result: MissionResult; hour: number }> = ({ result, hour }) => {
  const trace = result.trace;
  if (!trace) return null;
  const h = Math.max(0, Math.min(hour, trace.batteryPct.length - 1));
  const m = copy.meters;

  const battery = trace.batteryPct[h] ?? 0;
  // Water days count drinking water without recycling, the worst case a child can picture.
  const supplies: Array<[string, number]> = [
    [m.air, trace.o2Days[h] ?? 0],
    [m.water, (trace.waterKg[h] ?? 0) / (k.waterGrossKgPerH * 24)],
    [m.food, trace.foodDays[h] ?? 0],
  ];
  const weakest = supplies.reduce((a, b) => (b[1] < a[1] ? b : a));
  const dose = trace.doseUsv[h] ?? 0;
  const layers = result.log.filter((e) => e.type === 'shield_layer_built' && e.t <= h).length;

  return (
    <section className="meters" aria-label={m.title}>
      <Meter name={m.power} level={battery / 100} text={m.batteryText(Math.round(battery))} />
      <Meter
        name={m.lifeSupport}
        level={weakest[1] / MISSION_DAYS}
        text={m.lifeText(weakest[0], weakest[1].toFixed(0))}
      />
      <Meter
        name={m.shield}
        level={1 - dose / k.doseLimitUsv}
        text={m.shieldText(
          Math.round(dose).toLocaleString('en-US'),
          k.doseLimitUsv.toLocaleString('en-US'),
          layers,
        )}
      />
      <Term term="Radiation dose" />
    </section>
  );
};
