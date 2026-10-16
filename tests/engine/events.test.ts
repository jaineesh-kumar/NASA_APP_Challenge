import { describe, expect, it } from 'vitest';
import { createInitialEventsState, stepEvents } from '../../src/engine/events.ts';
import { loadParams } from '../../src/engine/params.ts';
import { mulberry32 } from '../../src/engine/rng.ts';
import { Design } from '../../src/engine/types.ts';

describe('events, failures, and SPE progression (Spec B5.3, B5.5, AC6, AC7, AC8, AC10)', () => {
  const params = loadParams();

  const standardDesign: Design = {
    site: 'ridge',
    panels: 4,
    mastLevel: 1,
    batteries: 4,
    waterLoopTier: 0,
    o2LoopTier: 0,
    greenhouseModules: 0,
    shieldingLayers: 0,
    spares: {
      co2_scrubber: 1,
      o2_generator: 0,
      water_processor: 0,
      power_array: 0,
    },
  };

  it('SPE warning appears spe_warning_lead_h ahead of event start (AC6)', () => {
    let state = createInitialEventsState(standardDesign);
    const speLeadH = params.getNumber('radiation.spe_warning_lead_h'); // 2 hours
    expect(speLeadH).toBe(2);
    const speDurationH = params.getNumber('radiation.spe_duration_h'); // 12 hours

    // Deterministic mock RNG that triggers SPE on tick 10:
    // uSpe, uDust, uCo2, uO2, uWater, uArray
    const mockRng = (trigger: boolean) => {
      let callCount = 0;
      return () => {
        callCount++;
        // First draw in tick is uSpe
        if (callCount % 6 === 1 && trigger) {
          return 0.00001; // well below spe_per_month / 720
        }
        return 0.999;
      };
    };

    // Hour 10: SPE drawn
    const step10 = stepEvents(10, state, mockRng(true), params);
    expect(step10.isSpeWarningActive).toBe(true);
    expect(step10.isSpeActive).toBe(false);
    expect(step10.logs.some((l) => l.type === 'spe_warning')).toBe(true);
    state = step10.state;

    // Hour 11: 1 hour into lead
    const step11 = stepEvents(11, state, mockRng(false), params);
    expect(step11.isSpeWarningActive).toBe(true);
    expect(step11.isSpeActive).toBe(false);
    state = step11.state;

    // Hour 12: Lead expired -> SPE starts! Exactly spe_warning_lead_h after warning
    const step12 = stepEvents(12, state, mockRng(false), params);
    expect(step12.isSpeWarningActive).toBe(false);
    expect(step12.isSpeActive).toBe(true);
    expect(step12.logs.some((l) => l.type === 'spe_start')).toBe(true);
    state = step12.state;

    // Run for duration
    for (let h = 13; h < 12 + speDurationH; h++) {
      const stepH = stepEvents(h, state, mockRng(false), params);
      expect(stepH.isSpeActive).toBe(true);
      state = stepH.state;
    }

    // At end of duration: spe_end logged
    const stepEnd = stepEvents(12 + speDurationH, state, mockRng(false), params);
    expect(stepEnd.isSpeActive).toBe(false);
    expect(stepEnd.logs.some((l) => l.type === 'spe_end')).toBe(true);
  });

  it('MTBF check fails component when draw < 1 / mtbf_h and consumes spare (AC7)', () => {
    const state = createInitialEventsState(standardDesign);
    expect(state.componentsOk.co2_scrubber).toBe(true);
    expect(state.sparesRemaining.co2_scrubber).toBe(1);

    // Mock RNG: uSpe=0.9, uDust=0.9, uCo2=0.0001 (triggers failure), rest=0.9
    const draws = [0.9, 0.9, 0.0001, 0.9, 0.9, 0.9];
    let idx = 0;
    const mockRng = () => draws[idx++ % draws.length]!;

    const step = stepEvents(1, state, mockRng, params);

    expect(step.state.componentsOk.co2_scrubber).toBe(false);
    expect(step.logs.some((l) => l.type === 'component_failed')).toBe(true);
    // Spare was consumed
    expect(step.state.sparesRemaining.co2_scrubber).toBe(0);
    // Active repair initiated with repair hours needed
    expect(step.state.activeRepairs.co2_scrubber).toBe(
      params.getNumber('repair.hours.co2_scrubber'),
    );
  });

  it('component with 0 spares stays failed without repair (AC8)', () => {
    const state = createInitialEventsState(standardDesign);
    // o2_generator has 0 spares in standardDesign
    expect(state.componentsOk.o2_generator).toBe(true);
    expect(state.sparesRemaining.o2_generator).toBe(0);

    // Mock RNG: uSpe=0.9, uDust=0.9, uCo2=0.9, uO2=0.0001 (triggers failure), rest=0.9
    const draws = [0.9, 0.9, 0.9, 0.0001, 0.9, 0.9];
    let idx = 0;
    const mockRng = () => draws[idx++ % draws.length]!;

    const step = stepEvents(1, state, mockRng, params);

    expect(step.state.componentsOk.o2_generator).toBe(false);
    expect(step.state.sparesRemaining.o2_generator).toBe(0);
    // No repair started because 0 spares
    expect(step.state.activeRepairs.o2_generator).toBeUndefined();
  });

  it('seeded run reproduces every event tick-for-tick (AC10)', () => {
    const simulateEvents = (seed: number) => {
      const rng = mulberry32(seed);
      let state = createInitialEventsState(standardDesign);
      const logHistory: string[] = [];

      for (let t = 0; t < 720; t++) {
        const step = stepEvents(t, state, rng, params);
        for (const log of step.logs) {
          logHistory.push(`${log.t}:${log.type}`);
        }
        state = step.state;
      }
      return logHistory;
    };

    const runA = simulateEvents(42);
    const runB = simulateEvents(42);

    expect(runA).toEqual(runB);
    expect(runA.length).toBeGreaterThan(0); // confirms events occurred and match exactly
  });
});
