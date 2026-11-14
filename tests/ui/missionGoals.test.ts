// Every guided mission is a fair puzzle: its starting base misses the goal, and a sample fix
// (the change its coach tips point to) reaches it. Real 300-run campaigns, fixed seeds.

import { describe, expect, it } from 'vitest';
import { guidedMissions, MissionId } from '../../src/content/missions.ts';
import { isWithinBudget } from '../../src/engine/mass.ts';
import { runCampaign } from '../../src/engine/montecarlo.ts';
import { loadParams } from '../../src/engine/params.ts';
import { Design, IfThenRule, Rules } from '../../src/engine/types.ts';

const params = loadParams();
const goal = params.getNumber('missions.goal_home_per_100');
const shelter: IfThenRule = { condition: { kind: 'spe_warning' }, action: { kind: 'shelter' } };

const FIXES: Record<MissionId, (d: Design, r: Rules) => { design: Design; rules: Rules }> = {
  // More batteries and a taller mast carry the base through the long dark.
  M1: (d, r) => ({ design: { ...d, batteries: 8, mastLevel: 2 }, rules: r }),
  // A spare for the machine that had none.
  M2: (d, r) => ({
    design: { ...d, spares: { ...d.spares, water_processor: 1 } },
    rules: r,
  }),
  // Remove the radio-off rule and hide when a warning comes.
  M3: (d, r) => ({
    design: d,
    rules: {
      ...r,
      ifThen: [...r.ifThen.filter((x) => x.action.kind !== 'shed'), shelter],
    },
  }),
  // One greenhouse module.
  M4: (d, r) => ({ design: { ...d, greenhouseModules: 1 }, rules: r }),
  // The shelter rule.
  M5: (d, r) => ({ design: d, rules: { ...r, ifThen: [...r.ifThen, shelter] } }),
};

const home = (
  design: Design,
  rules: Rules,
  stormMode: (typeof guidedMissions)[number]['stormMode'],
) =>
  Math.round(
    runCampaign(design, rules, undefined, params, undefined, { stormMode }).survivalRate * 100,
  );

describe('guided mission goals', () => {
  it('has missions M1 to M5', () => {
    expect(guidedMissions.map((m) => m.id)).toEqual(['M1', 'M2', 'M3', 'M4', 'M5']);
  });

  for (const m of guidedMissions) {
    it(`${m.id}: the start misses the goal and the sample fix reaches it`, () => {
      expect(isWithinBudget(m.design, params)).toBe(true);
      expect(home(m.design, m.rules, m.stormMode)).toBeLessThan(goal);
      const fixed = FIXES[m.id](m.design, m.rules);
      expect(isWithinBudget(fixed.design, params)).toBe(true);
      expect(home(fixed.design, fixed.rules, m.stormMode)).toBeGreaterThanOrEqual(goal);
    });
  }

  it('M3 and M5 replay two different real archived storms', () => {
    const [m3, m5] = [guidedMissions[2], guidedMissions[4]];
    expect(m3?.stormMode.kind).toBe('replay');
    expect(m5?.stormMode.kind).toBe('replay');
    expect(m3?.stormMode).not.toEqual(m5?.stormMode);
  });
});
