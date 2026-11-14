// Shared test fixtures (test-only literals are allowed here, A5.4)
import { getSimConstants } from '../../src/engine/constants.ts';
import { loadParams } from '../../src/engine/params.ts';
import { Design, Rules } from '../../src/engine/types.ts';

export const params = loadParams();
export const k = getSimConstants(params);

export const goldenDesign: Design = {
  site: 'ridge',
  panels: 4,
  mastLevel: 1,
  batteries: 5,
  waterLoopTier: 1,
  o2LoopTier: 0,
  greenhouseModules: 1,
  shieldingLayers: 2,
  spares: { co2_scrubber: 1, o2_generator: 1, water_processor: 0, power_array: 1 },
};

export const goldenRules: Rules = {
  priority: ['life_support', 'thermal', 'comms', 'greenhouse', 'science', 'construction'],
  ifThen: [
    {
      condition: { kind: 'battery_below_pct', value: 20 },
      action: { kind: 'shed', load: 'science' },
    },
    { condition: { kind: 'spe_warning' }, action: { kind: 'shelter' } },
  ],
};

/** Second named reference design for golden files (crater edge, closed loops). */
export const craterDesign: Design = {
  site: 'crater_edge',
  panels: 6,
  mastLevel: 2,
  batteries: 7,
  waterLoopTier: 1,
  o2LoopTier: 1,
  greenhouseModules: 1,
  shieldingLayers: 1,
  spares: { co2_scrubber: 1, o2_generator: 0, water_processor: 0, power_array: 0 },
};

export const noRules: Rules = { priority: goldenRules.priority, ifThen: [] };
