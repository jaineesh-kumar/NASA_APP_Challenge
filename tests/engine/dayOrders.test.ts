// Mission Day orders (ADR-016): each order maps onto one existing rule flag, without orders the
// mission is unchanged, and an order only acts on its own day.

import { describe, expect, it } from 'vitest';
import { missionPresets } from '../../src/content/missions.ts';
import { applyDayOrder, evaluateRules } from '../../src/engine/rules.ts';
import { runMission } from '../../src/engine/sim.ts';
import { DayOrder, Rules } from '../../src/engine/types.ts';

const kit = missionPresets[0]!;
const rules: Rules = { priority: kit.rules.priority, ifThen: [] };
const quiet = {
  batteryPct: 100,
  o2Days: 10,
  isRadiationAlert: false,
  hoursToNextDark: Infinity,
  isAnyComponentFailed: false,
};

describe('applyDayOrder', () => {
  it('maps each order onto one flag and never changes its input', () => {
    const base = evaluateRules(rules, quiet);
    expect(applyDayOrder(base, 'save_power').pauseScience).toBe(true);
    expect(applyDayOrder(base, 'shelter').shelter).toBe(true);
    expect(applyDayOrder(base, 'radio_off').forcedOff.has('comms')).toBe(true);
    expect(applyDayOrder(base, 'greenhouse_low').ghLow).toBe(true);
    expect(applyDayOrder(base, 'fix_first').repairFirst).toBe(true);
    const full = applyDayOrder(base, 'full_speed');
    expect(full).toEqual(base);
    expect(base.forcedOff.size).toBe(0);
    expect(base.shelter).toBe(false);
  });
});

describe('runMission with dayOrders', () => {
  it('no orders and all full-speed orders give the same mission as before', () => {
    const plain = runMission(kit.design, rules, 7);
    const none = runMission(kit.design, rules, 7, undefined, { dayOrders: [] });
    const full = runMission(kit.design, rules, 7, undefined, {
      dayOrders: Array.from({ length: 30 }, (): DayOrder => 'full_speed'),
    });
    expect(none).toEqual(plain);
    expect(full).toEqual(plain);
  });

  it('an order acts only on its own day', () => {
    const r = runMission(kit.design, rules, 3, undefined, {
      trace: true,
      dayOrders: ['full_speed', 'shelter', 'radio_off'],
    });
    const t = r.trace!;
    expect(t.isSheltering.slice(0, 24).some(Boolean)).toBe(false);
    expect(t.isSheltering.slice(24, 48).every(Boolean)).toBe(true);
    expect(t.isSheltering.slice(48, 72).some(Boolean)).toBe(false);
    expect(t.isCommsOn.slice(48, 72).some(Boolean)).toBe(false);
  });

  it('is deterministic, and a shelter day does no science', () => {
    const opts = { trace: true, dayOrders: ['shelter'] as DayOrder[] };
    const a = runMission(kit.design, rules, 11, undefined, opts);
    expect(runMission(kit.design, rules, 11, undefined, opts)).toEqual(a);
    expect(a.trace!.scienceHours[23]).toBe(0);
  });
});
