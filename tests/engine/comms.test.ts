import { describe, expect, it } from 'vitest';
import { createInitialEventsState, stepEvents } from '../../src/engine/events.ts';
import { buildCauseChain } from '../../src/engine/review.ts';
import { runMission } from '../../src/engine/sim.ts';
import { LogEntry, Rules } from '../../src/engine/types.ts';
import { goldenDesign, goldenRules, k, params } from './fixtures.ts';

// Rules that keep the radio switched off for the whole mission.
const radioOff: Rules = {
  priority: goldenRules.priority,
  ifThen: [
    {
      condition: { kind: 'battery_below_pct', value: 101 },
      action: { kind: 'shed', load: 'comms' },
    },
    { condition: { kind: 'spe_warning' }, action: { kind: 'shelter' } },
  ],
};

function runsWithStorms(rules: Rules, count: number, design = goldenDesign) {
  const out = [];
  for (let seed = 1; seed <= 400 && out.length < count; seed++) {
    const r = runMission(design, rules, seed, params);
    if (r.storms.length > 0) out.push(r);
  }
  return out;
}

describe('comms link (L12, Spec B5.10)', () => {
  it('AC1: with comms unpowered a pending SPE gives no spe_warning and arrives unwarned', () => {
    const runs = runsWithStorms(radioOff, 5);
    expect(runs.length).toBeGreaterThan(0);
    for (const r of runs) {
      expect(r.log.some((e) => e.type === 'spe_warning')).toBe(false);
      const starts = r.log.filter((e) => e.type === 'spe_start').length;
      expect(r.log.filter((e) => e.type === 'warning_missed').length).toBe(starts);
      // No warning means the crew is outside the shelter when the storm begins.
      expect(r.storms.every((s) => !s.wasSheltered)).toBe(true);
    }
  });

  it('AC2: with comms powered the warning arrives spe_warning_lead_h before onset', () => {
    // A base with plenty of power, so the radio never has to switch off.
    const runs = runsWithStorms(goldenRules, 5, { ...goldenDesign, panels: 8, batteries: 12 });
    expect(runs.length).toBeGreaterThan(0);
    let checked = 0;
    for (const r of runs) {
      const commsEverOff = r.log.some((e) => e.type === 'load_off' && e.detail === 'comms');
      if (commsEverOff) continue;
      const warnings = r.log.filter((e) => e.type === 'spe_warning').map((e) => e.t);
      const starts = r.log.filter((e) => e.type === 'spe_start').map((e) => e.t);
      starts.forEach((t, i) => {
        expect(t - (warnings[i] ?? -99)).toBe(k.speWarningLeadH);
        checked++;
      });
      expect(r.log.some((e) => e.type === 'warning_missed')).toBe(false);
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('AC3: repair hours are cut by comms.repair_assist_fraction only while the link is up', () => {
    const always = () => 0; // every component fails this tick
    const up = stepEvents(
      createInitialEventsState(goldenDesign),
      0,
      always,
      k,
      true,
      1 - k.commsRepairAssistFraction,
    );
    const down = stepEvents(createInitialEventsState(goldenDesign), 0, always, k, true, 1);
    expect(up.state.repairsLeftH.co2_scrubber).toBeCloseTo(
      k.repairHours.co2_scrubber * (1 - k.commsRepairAssistFraction),
      12,
    );
    expect(down.state.repairsLeftH.co2_scrubber).toBe(k.repairHours.co2_scrubber);
    // A failure with no spare stays permanent either way.
    expect(up.state.repairsLeftH.water_processor).toBe(Infinity);
  });

  it('AC4: still deterministic with the link in play', () => {
    expect(runMission(goldenDesign, radioOff, 9, params, { trace: true })).toEqual(
      runMission(goldenDesign, radioOff, 9, params, { trace: true }),
    );
  });

  it('the cause chain can trace a dose loss back to a radio switched off', () => {
    const log: LogEntry[] = [
      { t: 5, type: 'rule_fired', detail: 'shed comms when battery_below_pct 101' },
      { t: 300, type: 'warning_missed', detail: 'comms_off' },
      { t: 300, type: 'spe_start', detail: 'unsheltered' },
      { t: 305, type: 'failure', detail: 'dose' },
    ];
    const r = buildCauseChain(log);
    expect(r.chain.map((l) => l.cause.type)).toEqual(['spe_start', 'warning_missed', 'rule_fired']);
    expect(r.concept).toBe('communication');
  });
});
