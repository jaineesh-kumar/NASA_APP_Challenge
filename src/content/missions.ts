// Documented mission presets for Moonbase Margin
// Spec B1, B5.2, Part C (L6 AC6)

import { Design, Rules } from '../engine/types.ts';

export interface MissionPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  design: Design;
  rules: Rules;
}

export const missionPresets: MissionPreset[] = [
  {
    id: 'baseline',
    name: 'Balanced Outpost',
    tagline: 'Moderate solar and battery with regolith shielding',
    description:
      'A well-rounded setup on Malapert Ridge featuring 4 solar panels, 5 battery packs, a mast tower, and 2 radiation shield layers.',
    design: {
      site: 'ridge',
      panels: 4,
      mastLevel: 1,
      batteries: 5,
      waterLoopTier: 1,
      o2LoopTier: 0,
      greenhouseModules: 1,
      shieldingLayers: 2,
      spares: {
        co2_scrubber: 1,
        o2_generator: 1,
        water_processor: 0,
        power_array: 1,
      },
    },
    rules: {
      priority: ['life_support', 'thermal', 'comms', 'greenhouse', 'science', 'construction'],
      ifThen: [
        {
          condition: { kind: 'battery_below_pct', value: 25 },
          action: { kind: 'shed', load: 'science' },
        },
        {
          condition: { kind: 'spe_warning' },
          action: { kind: 'shelter' },
        },
      ],
    },
  },
  {
    id: 'power_heavy',
    name: 'High-Power Grid',
    tagline: 'High panel and battery margins for long crater nights',
    description:
      'Tailored for Shackleton Crater Edge with 6 solar panels and 8 battery modules to endure three 72-hour dark windows.',
    design: {
      site: 'crater_edge',
      panels: 6,
      mastLevel: 2,
      batteries: 8,
      waterLoopTier: 0,
      o2LoopTier: 0,
      greenhouseModules: 0,
      shieldingLayers: 1,
      spares: {
        co2_scrubber: 1,
        o2_generator: 0,
        water_processor: 0,
        power_array: 1,
      },
    },
    rules: {
      priority: ['life_support', 'thermal', 'comms', 'science', 'construction', 'greenhouse'],
      ifThen: [
        {
          condition: { kind: 'battery_below_pct', value: 30 },
          action: { kind: 'shed', load: 'science' },
        },
        {
          condition: { kind: 'spe_warning' },
          action: { kind: 'shelter' },
        },
      ],
    },
  },
  {
    id: 'loop_heavy',
    name: 'Closed Loop Bio-Station',
    tagline: 'Full Sabatier and Brine recycling with greenhouse',
    description:
      'Emphasizes resource autonomy with 98% water recovery, Sabatier O2 reactor, and 2 hydroponic greenhouse modules.',
    design: {
      site: 'ridge',
      panels: 3,
      mastLevel: 0,
      batteries: 4,
      waterLoopTier: 1,
      o2LoopTier: 1,
      greenhouseModules: 2,
      shieldingLayers: 1,
      spares: {
        co2_scrubber: 1,
        o2_generator: 1,
        water_processor: 1,
        power_array: 0,
      },
    },
    rules: {
      priority: ['life_support', 'thermal', 'greenhouse', 'comms', 'science', 'construction'],
      ifThen: [
        {
          condition: { kind: 'battery_below_pct', value: 20 },
          action: { kind: 'greenhouse_low_power' },
        },
        {
          condition: { kind: 'spe_warning' },
          action: { kind: 'shelter' },
        },
      ],
    },
  },
];
