import { describe, expect, it } from 'vitest';
import { guidedMissions, missionPresets } from '../../src/content/missions.ts';
import { isWithinBudget } from '../../src/engine/mass.ts';
import { loadParams } from '../../src/engine/params.ts';
import { CampaignResult, MissionResult } from '../../src/engine/types.ts';
import { AppState, appReducer, initialAppState } from '../../src/state/store.tsx';

const params = loadParams();

describe('appReducer (L6 AC1-AC4)', () => {
  it('AC1: hardware actions update the design and the mass', () => {
    let s = appReducer(initialAppState, {
      type: 'SET_PANELS',
      panels: initialAppState.design.panels - 1,
    });
    expect(s.design.panels).toBe(initialAppState.design.panels - 1);
    expect(s.massUsed).toBe(initialAppState.massUsed - params.getNumber('mass.panel'));
    s = appReducer(s, { type: 'SET_SITE', site: 'crater_edge' });
    expect(s.design.site).toBe('crater_edge');
    s = appReducer(s, { type: 'SET_WATER_TIER', tier: 0 });
    expect(s.design.waterLoopTier).toBe(0);
    s = appReducer(s, { type: 'SET_SPARE', component: 'power_array', count: 1 });
    expect(s.design.spares.power_array).toBe(1);
  });

  it('AC2: the mass cap cannot be exceeded by adding items', () => {
    let s = initialAppState;
    for (let i = 0; i < 20; i++)
      s = appReducer(s, { type: 'SET_BATTERIES', batteries: s.design.batteries + 1 });
    expect(s.isWithinBudget).toBe(true);
    expect(isWithinBudget(s.design, params)).toBe(true);
  });

  it('every example base and guided mission fits the budget', () => {
    for (const p of missionPresets) expect(isWithinBudget(p.design, params), p.id).toBe(true);
    for (const m of guidedMissions) expect(isWithinBudget(m.design, params), m.id).toBe(true);
  });

  it('AC3: the ladder stays a valid permutation', () => {
    const moved = appReducer(initialAppState, { type: 'MOVE_PRIORITY', index: 1, direction: 'up' });
    expect(moved.rules.priority[0]).toBe(initialAppState.rules.priority[1]);
    expect(new Set(moved.rules.priority).size).toBe(6);
    expect(appReducer(initialAppState, { type: 'MOVE_PRIORITY', index: 0, direction: 'up' })).toBe(
      initialAppState,
    );
    const bad = appReducer(initialAppState, {
      type: 'SET_PRIORITY',
      priority: ['comms', 'comms', 'thermal', 'science', 'greenhouse', 'construction'],
    });
    expect(bad).toBe(initialAppState);
  });

  it('AC4: at most 5 IF-THEN rules', () => {
    let s: AppState = { ...initialAppState, rules: { ...initialAppState.rules, ifThen: [] } };
    for (let i = 0; i < 7; i++) {
      s = appReducer(s, {
        type: 'ADD_RULE',
        rule: { condition: { kind: 'spe_warning' }, action: { kind: 'shelter' } },
      });
    }
    expect(s.rules.ifThen).toHaveLength(5);
    s = appReducer(s, { type: 'REMOVE_RULE', index: 0 });
    expect(s.rules.ifThen).toHaveLength(4);
  });

  it('guided missions set the sun era; results go into the history and become stale on edits', () => {
    const m3 = guidedMissions.find((m) => m.id === 'M3');
    let s = appReducer(initialAppState, {
      type: 'LOAD_MISSION',
      mission: m3 ?? guidedMissions[0]!,
    });
    expect(s.stormMode.kind).toBe('replay');
    const result = { massUsed: 90, survivalRate: 0.8, stormMode: s.stormMode } as CampaignResult;
    s = appReducer(s, { type: 'SET_CAMPAIGN_RESULT', result, worstRun: {} as MissionResult });
    expect(s.history).toEqual([
      { n: 1, massUsed: 90, riskPct: expect.closeTo(20, 9), stormMode: s.stormMode },
    ]);
    expect(s.isResultStale).toBe(false);
    s = appReducer(s, { type: 'SET_STORM_MODE', stormMode: { kind: 'random' } });
    expect(s.isResultStale).toBe(true);
  });

  it('a failed campaign stores the error and stops running', () => {
    let s = appReducer(initialAppState, { type: 'START_CAMPAIGN' });
    s = appReducer(s, { type: 'CAMPAIGN_FAILED', message: 'boom' });
    expect(s.isRunningCampaign).toBe(false);
    expect(s.campaignError).toBe('boom');
  });
});
