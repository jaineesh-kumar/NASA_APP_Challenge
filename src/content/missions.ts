// Documented mission presets and guided learning missions for Moonbase Margin
// Spec B1, B5.2, B8, Part C (L6 AC6, L8 AC1, AC6: agent-drafted content has needsReview: true)

import { Design, Rules } from '../engine/types.ts';

export interface ConceptCheck {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GuidedMission {
  id: 'M1' | 'M2' | 'M3';
  title: string;
  subtitle: string;
  objective: string;
  conceptTarget: string;
  design: Design;
  rules: Rules;
  conceptCheck: ConceptCheck;
  needsReview: true;
}

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

export const guidedMissions: GuidedMission[] = [
  {
    id: 'M1',
    title: 'Mission 1: The Dark Window Challenge',
    subtitle: 'Survive 36-hour lunar nights without running out of power',
    objective:
      'Inspect Malapert Ridge outpost. Adjust energy margin so battery reserves never hit zero during the two 36-hour dark windows.',
    conceptTarget: 'margin',
    design: {
      site: 'ridge',
      panels: 4,
      mastLevel: 1,
      batteries: 5,
      waterLoopTier: 1,
      o2LoopTier: 0,
      greenhouseModules: 0,
      shieldingLayers: 1,
      spares: {
        co2_scrubber: 1,
        o2_generator: 1,
        water_processor: 0,
        power_array: 1,
      },
    },
    rules: {
      priority: ['life_support', 'thermal', 'comms', 'science', 'construction', 'greenhouse'],
      ifThen: [
        {
          condition: { kind: 'battery_below_pct', value: 25 },
          action: { kind: 'shed', load: 'science' },
        },
      ],
    },
    conceptCheck: {
      prompt: 'Why did shedding the science experiment load prevent an outpost power blackout?',
      options: [
        'Science equipment drains cooling fluids from the solar array.',
        'Science loads demand 3 kW of power; shedding it immediately saves up to 72 kWh during a dark window.',
        'Science instruments block the sunlight from reaching solar panels.',
        'Astronauts must pause science to sleep during dark windows.',
      ],
      correctIndex: 1,
      explanation:
        'Shedding 3 kW of non-essential science load during a 24-hour dark period spares 72 kWh of battery energy, keeping life support energized.',
    },
    needsReview: true,
  },
  {
    id: 'M2',
    title: 'Mission 2: Closing the Resource Loop',
    subtitle: 'Conserve water on a long expedition with 98% recycling',
    objective:
      'Learn how upgrading to a brine processor and Sabatier reactor drastically curbs water losses over 720 mission hours.',
    conceptTarget: 'loop_closure',
    design: {
      site: 'crater_edge',
      panels: 5,
      mastLevel: 1,
      batteries: 6,
      waterLoopTier: 1,
      o2LoopTier: 1,
      greenhouseModules: 1,
      shieldingLayers: 1,
      spares: {
        co2_scrubber: 1,
        o2_generator: 1,
        water_processor: 1,
        power_array: 0,
      },
    },
    rules: {
      priority: ['life_support', 'thermal', 'comms', 'greenhouse', 'science', 'construction'],
      ifThen: [
        {
          condition: { kind: 'battery_below_pct', value: 20 },
          action: { kind: 'greenhouse_low_power' },
        },
      ],
    },
    conceptCheck: {
      prompt: 'How does the Sabatier reactor reduce gross water loss for the crew?',
      options: [
        'It synthesizes fresh water by reacting waste CO2 with byproduct hydrogen from electrolysis.',
        'It filters moon dust into drinking water.',
        'It cools the habitat so astronauts sweat less.',
        'It increases the amount of stored ice in the rover.',
      ],
      correctIndex: 0,
      explanation:
        'The Sabatier reactor recovers up to 50% of oxygen by combining carbon dioxide with hydrogen to regenerate water (Source: S05).',
    },
    needsReview: true,
  },
  {
    id: 'M3',
    title: 'Mission 3: Solar Flare Defense',
    subtitle: 'Balance regolith shielding mass against equipment spares',
    objective:
      'Configure storm shelter automation and radiation shielding to survive random solar particle events without exceeding launch mass.',
    conceptTarget: 'trade_offs',
    design: {
      site: 'ridge',
      panels: 4,
      mastLevel: 1,
      batteries: 5,
      waterLoopTier: 0,
      o2LoopTier: 0,
      greenhouseModules: 0,
      shieldingLayers: 2,
      spares: {
        co2_scrubber: 1,
        o2_generator: 1,
        water_processor: 0,
        power_array: 1,
      },
    },
    rules: {
      priority: ['life_support', 'thermal', 'comms', 'construction', 'science', 'greenhouse'],
      ifThen: [
        {
          condition: { kind: 'spe_warning' },
          action: { kind: 'shelter' },
        },
      ],
    },
    conceptCheck: {
      prompt:
        'What engineering trade-off occurs when dedicating 24 mu to build two regolith shield layers?',
      options: [
        'Solar panels produce half as much power.',
        'You have less launch mass budget available for hydroponics, battery modules, or extra spares.',
        'The dark windows become twice as long.',
        'The crew size increases from 4 to 8.',
      ],
      correctIndex: 1,
      explanation:
        'Every layer of regolith shielding costs 12 mu (24 mu for two layers), which restricts mass available for batteries or greenhouse modules.',
    },
    needsReview: true,
  },
];
