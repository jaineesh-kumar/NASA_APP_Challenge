import { describe, expect, it } from 'vitest';
import { loadParams } from '../../src/engine/params.ts';
import { checkCondition, evaluateRules, RuleEvaluationState } from '../../src/engine/rules.ts';
import { IfThenRule, Rules } from '../../src/engine/types.ts';

describe('IF-THEN rules evaluation (Spec B5.2, B5.4 Step 2, AC1)', () => {
  const params = loadParams();

  const baseState: RuleEvaluationState = {
    batteryKwh: 300,
    batteryCapacityKwh: 400, // 75%
    o2TankKg: 100,
    isSpeWarningActive: false,
    componentsOk: {
      co2_scrubber: true,
      o2_generator: true,
      water_processor: true,
      power_array: true,
    },
    darkWindows: [{ start: 50, length: 20, end: 70 }],
  };

  it('evaluates battery_below_pct condition', () => {
    // 300 / 400 = 75%
    expect(checkCondition({ kind: 'battery_below_pct', value: 80 }, baseState, 0, params)).toBe(
      true,
    );
    expect(checkCondition({ kind: 'battery_below_pct', value: 70 }, baseState, 0, params)).toBe(
      false,
    );
  });

  it('evaluates spe_warning condition', () => {
    expect(checkCondition({ kind: 'spe_warning' }, baseState, 0, params)).toBe(false);
    const speState = { ...baseState, isSpeWarningActive: true };
    expect(checkCondition({ kind: 'spe_warning' }, speState, 0, params)).toBe(true);
  });

  it('evaluates dark_window_within_h condition', () => {
    // Window starts at t=50
    // At t=40, window starts in 10 hours -> within 12h is true, within 5h is false
    expect(checkCondition({ kind: 'dark_window_within_h', value: 12 }, baseState, 40, params)).toBe(
      true,
    );
    expect(checkCondition({ kind: 'dark_window_within_h', value: 5 }, baseState, 40, params)).toBe(
      false,
    );
  });

  it('evaluates component_failed condition', () => {
    expect(checkCondition({ kind: 'component_failed' }, baseState, 0, params)).toBe(false);
    const failedState = {
      ...baseState,
      componentsOk: { ...baseState.componentsOk, co2_scrubber: false },
    };
    expect(checkCondition({ kind: 'component_failed' }, failedState, 0, params)).toBe(true);
  });

  it('fires rules and sets flags correctly (AC1)', () => {
    const rules: Rules = {
      priority: ['life_support', 'thermal', 'comms', 'greenhouse', 'science', 'construction'],
      ifThen: [
        {
          condition: { kind: 'battery_below_pct', value: 80 },
          action: { kind: 'shed', load: 'science' },
        },
        {
          condition: { kind: 'battery_below_pct', value: 80 },
          action: { kind: 'greenhouse_low_power' },
        },
        {
          condition: { kind: 'spe_warning' },
          action: { kind: 'shelter' },
        },
      ],
    };

    const res1 = evaluateRules(rules, baseState, 0, params);
    expect(res1.forcedOff.has('science')).toBe(true);
    expect(res1.ghLow).toBe(true);
    expect(res1.shelter).toBe(false);
    expect(res1.logs.length).toBe(2);
  });

  it('does not latch: flags reset when conditions are no longer met (AC1)', () => {
    const rule: IfThenRule = {
      condition: { kind: 'battery_below_pct', value: 50 },
      action: { kind: 'shed', load: 'science' },
    };
    const rules: Rules = {
      priority: ['life_support', 'thermal', 'comms', 'greenhouse', 'science', 'construction'],
      ifThen: [rule],
    };

    // Low battery -> rule fires
    const lowBatState = { ...baseState, batteryKwh: 100 }; // 25% < 50%
    const resLow = evaluateRules(rules, lowBatState, 0, params);
    expect(resLow.forcedOff.has('science')).toBe(true);

    // Recharged battery -> rule does not fire, no lingering flag
    const highBatState = { ...baseState, batteryKwh: 350 }; // 87.5% > 50%
    const resHigh = evaluateRules(rules, highBatState, 1, params);
    expect(resHigh.forcedOff.has('science')).toBe(false);
    expect(resHigh.logs.length).toBe(0);
  });
});
