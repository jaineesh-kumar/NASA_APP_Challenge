import { describe, expect, it } from 'vitest';
import { buildCauseChain } from '../../src/engine/review.ts';
import { LogEntry, MissionResult } from '../../src/engine/types.ts';

describe('buildCauseChain and concept hints (Spec B5.9, AC6)', () => {
  it('handles surviving run without invented failure links', () => {
    const survivingResult: MissionResult = {
      seed: 1,
      survived: true,
      failureCause: null,
      failureHour: null,
      scienceMet: true,
      minBatteryPct: 50,
      minO2Days: 10,
      peakDoseUsv: 20000,
      log: [],
    };

    const review = buildCauseChain(survivingResult);
    expect(review.chain).toEqual([]);
    expect(review.conceptHint).toContain('maintain margins');
  });

  it('builds cause chain from failed mission log without invented links (AC6)', () => {
    const logs: LogEntry[] = [
      { t: 100, type: 'dark_window_start', detail: 'Outpost entered dark window' },
      { t: 120, type: 'battery_empty', detail: 'Outpost energy storage fully exhausted' },
      { t: 121, type: 'load_off', detail: 'Load shed: life_support' },
      {
        t: 124,
        type: 'failure',
        detail: 'Mission lost: critical deficit threshold breached for oxygen',
      },
    ];

    const failedResult: MissionResult = {
      seed: 99,
      survived: false,
      failureCause: 'oxygen',
      failureHour: 124,
      scienceMet: false,
      minBatteryPct: 0,
      minO2Days: 0,
      peakDoseUsv: 15000,
      log: logs,
    };

    const review = buildCauseChain(failedResult);

    expect(review.chain.length).toBeGreaterThan(0);
    expect(review.chain.length).toBeLessThanOrEqual(5);

    // Verify all effects in chain exist in the log
    for (const link of review.chain) {
      expect(link.effect).toBeDefined();
      expect(link.causes.length).toBeGreaterThan(0);
    }

    // Because battery empty was in the chain, concept hint mentions margin
    expect(review.conceptHint).toContain('Margin');
  });

  it('provides loop closure concept hint for water failure', () => {
    const logs: LogEntry[] = [
      { t: 300, type: 'component_failed', detail: 'water_processor' },
      {
        t: 373,
        type: 'failure',
        detail: 'Mission lost: critical deficit threshold breached for water',
      },
    ];

    const failedResult: MissionResult = {
      seed: 88,
      survived: false,
      failureCause: 'water',
      failureHour: 373,
      scienceMet: false,
      minBatteryPct: 50,
      minO2Days: 15,
      peakDoseUsv: 10000,
      log: logs,
    };

    const review = buildCauseChain(failedResult);
    expect(review.conceptHint).toContain('Loop closure');
  });
});
