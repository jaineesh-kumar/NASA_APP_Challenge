import { describe, expect, it } from 'vitest';
import { missionPresets } from '../../src/content/missions.ts';
import { AppState, appReducer, initialAppState } from '../../src/state/store.tsx';

describe('appReducer state management (Spec B5.2, Part C L6 AC1, AC6)', () => {
  it('updates state on hardware controls and recalculates mass (AC1)', () => {
    let state = initialAppState;
    expect(state.design.panels).toBe(4);

    // Increase panels
    state = appReducer(state, { type: 'SET_PANELS', panels: 6 });
    expect(state.design.panels).toBe(6);
    expect(state.massUsed).toBeGreaterThan(initialAppState.massUsed);

    // Increase batteries
    const massBeforeBatteries = state.massUsed;
    state = appReducer(state, { type: 'SET_BATTERIES', batteries: 8 });
    expect(state.design.batteries).toBe(8);
    expect(state.massUsed).toBe(massBeforeBatteries + 3 * 5); // 3 more batteries * 5 mu

    // Change site
    state = appReducer(state, { type: 'SET_SITE', site: 'crater_edge' });
    expect(state.design.site).toBe('crater_edge');

    // Change water tier
    state = appReducer(state, { type: 'SET_WATER_TIER', tier: 0 });
    expect(state.design.waterLoopTier).toBe(0);

    // Change O2 tier
    state = appReducer(state, { type: 'SET_O2_TIER', tier: 1 });
    expect(state.design.o2LoopTier).toBe(1);

    // Change spares
    state = appReducer(state, { type: 'SET_SPARE', component: 'power_array', count: 2 });
    expect(state.design.spares.power_array).toBe(2);
  });

  it('loads documented presets accurately (AC6)', () => {
    let state = initialAppState;
    const powerPreset = missionPresets.find((p) => p.id === 'power_heavy')!;

    state = appReducer(state, { type: 'SET_PRESET', preset: powerPreset });
    expect(state.design.site).toBe('crater_edge');
    expect(state.design.panels).toBe(6);
    expect(state.design.batteries).toBe(8);
    expect(state.isWithinBudget).toBe(true);
  });

  it('reorders priority ladder via MOVE_PRIORITY (AC4)', () => {
    let state = initialAppState;
    const originalTop = state.rules.priority[0];
    const originalSecond = state.rules.priority[1];

    // Move second item up to first
    state = appReducer(state, { type: 'MOVE_PRIORITY', index: 1, direction: 'up' });
    expect(state.rules.priority[0]).toBe(originalSecond);
    expect(state.rules.priority[1]).toBe(originalTop);
  });

  it('adds and removes rules up to maximum of 5 (AC5)', () => {
    let state: AppState = {
      ...initialAppState,
      rules: { ...initialAppState.rules, ifThen: [] },
    };

    for (let i = 0; i < 5; i++) {
      state = appReducer(state, {
        type: 'ADD_RULE',
        rule: {
          condition: { kind: 'battery_below_pct', value: 10 + i },
          action: { kind: 'shelter' },
        },
      });
    }
    expect(state.rules.ifThen.length).toBe(5);

    // 6th rule must be rejected per 5-rule limit
    state = appReducer(state, {
      type: 'ADD_RULE',
      rule: { condition: { kind: 'spe_warning' }, action: { kind: 'shelter' } },
    });
    expect(state.rules.ifThen.length).toBe(5);

    // Remove first rule
    state = appReducer(state, { type: 'REMOVE_RULE', index: 0 });
    expect(state.rules.ifThen.length).toBe(4);
  });
});
