import { describe, expect, it } from 'vitest';
import {
  Action,
  CampaignResult,
  Condition,
  Design,
  EngineError,
  IfThenRule,
  Interval,
  LogEntry,
  MissionResult,
  Rules,
} from '../../src/engine/index.ts';

describe('types contract compliance (Spec B5.2, AC1)', () => {
  it('instantiates valid Design, Rules, and result objects', () => {
    const design: Design = {
      site: 'ridge',
      panels: 4,
      mastLevel: 2,
      batteries: 6,
      waterLoopTier: 1,
      o2LoopTier: 1,
      greenhouseModules: 2,
      shieldingLayers: 1,
      spares: {
        co2_scrubber: 1,
        o2_generator: 0,
        water_processor: 1,
        power_array: 0,
      },
    };
    expect(design.site).toBe('ridge');

    const condition: Condition = { kind: 'battery_below_pct', value: 20 };
    const action: Action = { kind: 'shed', load: 'science' };
    const rule: IfThenRule = { condition, action };

    const rules: Rules = {
      priority: ['life_support', 'thermal', 'comms', 'greenhouse', 'construction', 'science'],
      ifThen: [rule],
    };
    expect(rules.priority.length).toBe(6);
    expect(rules.ifThen.length).toBe(1);

    const logEntry: LogEntry = {
      t: 10,
      type: 'rule_fired',
      detail: 'shed science',
    };
    expect(logEntry.type).toBe('rule_fired');

    const missionResult: MissionResult = {
      seed: 123,
      survived: true,
      failureCause: null,
      failureHour: null,
      scienceMet: true,
      minBatteryPct: 45,
      minO2Days: 12,
      peakDoseUsv: 3200,
      log: [logEntry],
    };
    expect(missionResult.survived).toBe(true);

    const interval: Interval = { low: 0.9, high: 0.98 };
    expect(interval.low).toBe(0.9);

    const campaignResult: CampaignResult = {
      runs: 300,
      survivalRate: 0.95,
      successRate: 0.88,
      survivalCi: { low: 0.92, high: 0.97 },
      successCi: { low: 0.84, high: 0.91 },
      minBatteryPctP5: 25,
      minO2DaysP5: 6.2,
      doseUsvP95: 18500,
      causeCounts: {
        oxygen: 2,
        co2: 5,
        water: 3,
        food: 1,
        dose: 4,
        science_missed: 10,
      },
      massUsed: 105,
      worstSeed: 47,
      rating: 'flight_ready',
    };
    expect(campaignResult.rating).toBe('flight_ready');
  });

  it('EngineError carries code and message', () => {
    const err = new EngineError('TEST_CODE', 'A test error');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(EngineError);
    expect(err.name).toBe('EngineError');
    expect(err.code).toBe('TEST_CODE');
    expect(err.message).toBe('[TEST_CODE] A test error');
  });
});
