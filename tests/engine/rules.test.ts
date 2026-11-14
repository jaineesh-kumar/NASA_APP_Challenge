import { describe, expect, it } from 'vitest';
import { checkCondition, evaluateRules, RuleState, validateRules } from '../../src/engine/rules.ts';
import { EngineError, IfThenRule, Rules } from '../../src/engine/types.ts';
import { goldenRules } from './fixtures.ts';

const calm: RuleState = {
  batteryPct: 80,
  o2Days: 20,
  isRadiationAlert: false,
  hoursToNextDark: 100,
  isAnyComponentFailed: false,
};

describe('rules (L5 AC3, AC4)', () => {
  it('AC3: every condition kind', () => {
    expect(
      checkCondition({ kind: 'battery_below_pct', value: 50 }, { ...calm, batteryPct: 49 }),
    ).toBe(true);
    expect(checkCondition({ kind: 'battery_below_pct', value: 50 }, calm)).toBe(false);
    expect(checkCondition({ kind: 'spe_warning' }, { ...calm, isRadiationAlert: true })).toBe(true);
    expect(checkCondition({ kind: 'spe_warning' }, calm)).toBe(false);
    expect(checkCondition({ kind: 'o2_days_below', value: 21 }, calm)).toBe(true);
    expect(checkCondition({ kind: 'o2_days_below', value: 5 }, calm)).toBe(false);
    expect(checkCondition({ kind: 'dark_window_within_h', value: 100 }, calm)).toBe(true);
    expect(checkCondition({ kind: 'dark_window_within_h', value: 99 }, calm)).toBe(false);
    expect(
      checkCondition({ kind: 'component_failed' }, { ...calm, isAnyComponentFailed: true }),
    ).toBe(true);
    expect(checkCondition({ kind: 'component_failed' }, calm)).toBe(false);
  });

  it('AC3: every action kind sets its flag', () => {
    const always = { kind: 'battery_below_pct', value: 101 } as const;
    const rules: Rules = {
      priority: goldenRules.priority,
      ifThen: [
        { condition: always, action: { kind: 'shed', load: 'comms' } },
        { condition: always, action: { kind: 'shelter' } },
        { condition: always, action: { kind: 'repair_first' } },
        { condition: always, action: { kind: 'greenhouse_low_power' } },
        { condition: always, action: { kind: 'pause_science' } },
      ],
    };
    const f = evaluateRules(rules, calm);
    expect([...f.forcedOff]).toEqual(['comms']);
    expect(f.shelter && f.repairFirst && f.ghLow && f.pauseScience).toBe(true);
    expect(f.fired).toEqual([true, true, true, true, true]);
    expect(evaluateRules({ ...rules, ifThen: [] }, calm).shelter).toBe(false);
  });

  it('AC4: up to 5 rules allowed, a 6th throws EngineError', () => {
    const rule: IfThenRule = { condition: { kind: 'spe_warning' }, action: { kind: 'shelter' } };
    expect(() => validateRules({ ...goldenRules, ifThen: Array(5).fill(rule) })).not.toThrow();
    expect(() => validateRules({ ...goldenRules, ifThen: Array(6).fill(rule) })).toThrow(
      EngineError,
    );
  });

  it('the ladder must be a permutation of all 6 loads', () => {
    expect(() =>
      validateRules({
        ...goldenRules,
        priority: ['comms', 'comms', 'thermal', 'science', 'greenhouse', 'life_support'],
      }),
    ).toThrow(EngineError);
    expect(() =>
      validateRules({ ...goldenRules, priority: goldenRules.priority.slice(1) }),
    ).toThrow(EngineError);
  });
});
