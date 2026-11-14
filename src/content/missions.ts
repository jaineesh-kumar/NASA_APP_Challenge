// Example bases and guided missions (Spec B1, B5.2, B8; L6, L8 AC1, AC6).
// Presets were checked with 300-run campaigns (see docs/DECISIONS.md ADR-007); they must stay
// inside the mass budget (tests/ui/store.test.tsx). Agent-drafted text carries needsReview.

import { Design, IfThenRule, Rules, SunEra } from '../engine/types.ts';

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
  sunEra: SunEra;
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

const LADDER: Rules['priority'] = [
  'life_support',
  'thermal',
  'comms',
  'greenhouse',
  'science',
  'construction',
];
const shelterOnWarning: IfThenRule = {
  condition: { kind: 'spe_warning' },
  action: { kind: 'shelter' },
};
const fixFirst: IfThenRule = {
  condition: { kind: 'component_failed' },
  action: { kind: 'repair_first' },
};
const saveScience = (pct: number): IfThenRule => ({
  condition: { kind: 'battery_below_pct', value: pct },
  action: { kind: 'shed', load: 'science' },
});

export const missionPresets: MissionPreset[] = [
  {
    id: 'ridge_starter',
    name: 'Sunny Ridge Starter',
    tagline: 'A balanced first base',
    description:
      'Sunny landing spot, good batteries, upgraded water recycler, one shield layer and spares.',
    design: {
      site: 'ridge',
      panels: 4,
      mastLevel: 1,
      batteries: 6,
      waterLoopTier: 1,
      o2LoopTier: 0,
      greenhouseModules: 1,
      shieldingLayers: 1,
      spares: { co2_scrubber: 2, o2_generator: 1, water_processor: 1, power_array: 0 },
    },
    rules: { priority: LADDER, ifThen: [saveScience(30), shelterOnWarning, fixFirst] },
  },
  {
    id: 'crater_camp',
    name: 'Crater Ice Camp',
    tagline: 'More water, longer nights',
    description:
      'Lands near ice for extra water. A tall mast and many batteries get it through long darkness.',
    design: {
      site: 'crater_edge',
      panels: 4,
      mastLevel: 2,
      batteries: 9,
      waterLoopTier: 0,
      o2LoopTier: 0,
      greenhouseModules: 1,
      shieldingLayers: 0,
      spares: { co2_scrubber: 2, o2_generator: 1, water_processor: 0, power_array: 0 },
    },
    rules: { priority: LADDER, ifThen: [saveScience(30), shelterOnWarning, fixFirst] },
  },
  {
    id: 'storm_bunker',
    name: 'Storm Bunker',
    tagline: 'All-in on radiation shields',
    description:
      'Three shield layers block lots of radiation, but that weight left little room for spares.',
    design: {
      site: 'ridge',
      panels: 4,
      mastLevel: 0,
      batteries: 5,
      waterLoopTier: 0,
      o2LoopTier: 0,
      greenhouseModules: 1,
      shieldingLayers: 3,
      spares: { co2_scrubber: 1, o2_generator: 1, water_processor: 0, power_array: 0 },
    },
    rules: { priority: LADDER, ifThen: [saveScience(30), shelterOnWarning, fixFirst] },
  },
];

export const guidedMissions: GuidedMission[] = [
  {
    id: 'M1',
    title: 'Mission 1: Survive the dark',
    subtitle: 'Keep the lights on when the Sun hides',
    objective:
      'This crater base runs out of battery in the long dark hours. Add batteries or a taller mast until the crew stays safe in almost every test.',
    conceptTarget: 'margin',
    design: {
      site: 'crater_edge',
      panels: 5,
      mastLevel: 0,
      batteries: 4,
      waterLoopTier: 0,
      o2LoopTier: 0,
      greenhouseModules: 1,
      shieldingLayers: 0,
      spares: { co2_scrubber: 2, o2_generator: 1, water_processor: 0, power_array: 0 },
    },
    rules: { priority: LADDER, ifThen: [saveScience(30), shelterOnWarning, fixFirst] },
    sunEra: 'all',
    conceptCheck: {
      prompt: 'Why did adding batteries help this base?',
      options: [
        'Batteries make the dark hours shorter.',
        'Batteries store sunlight power so life support keeps running in the dark.',
        'Batteries block radiation.',
        'Batteries make more oxygen.',
      ],
      correctIndex: 1,
      explanation:
        'Solar panels make nothing in the dark. Stored energy is your margin until the Sun comes back.',
    },
    needsReview: true,
  },
  {
    id: 'M2',
    title: 'Mission 2: The broken recycler',
    subtitle: 'One machine, no spare',
    objective:
      'This base has no spare for its water recycler. When it breaks, water drains away. Find the weak spot and fix it, by adding a spare or a better recycler.',
    conceptTarget: 'single_point_of_failure',
    design: {
      site: 'ridge',
      panels: 4,
      mastLevel: 1,
      batteries: 7,
      waterLoopTier: 0,
      o2LoopTier: 0,
      greenhouseModules: 2,
      shieldingLayers: 1,
      spares: { co2_scrubber: 2, o2_generator: 0, water_processor: 0, power_array: 0 },
    },
    rules: { priority: LADDER, ifThen: [saveScience(30), shelterOnWarning, fixFirst] },
    sunEra: 'all',
    conceptCheck: {
      prompt: 'What is a single point of failure?',
      options: [
        'A part that never breaks.',
        'One part with no backup whose breakdown can stop the whole mission.',
        'The strongest part of the base.',
        'A spare part.',
      ],
      correctIndex: 1,
      explanation: 'A spare or a backup turns a mission-ending breakdown into a repair job.',
    },
    needsReview: true,
  },
  {
    id: 'M3',
    title: 'Mission 3: Stormy Sun',
    subtitle: 'Real storms, and a radio that keeps switching off',
    objective:
      'This base is tested against the stormiest years in NASA’s record. Its rules switch the radio off to save power, and nobody hides when a storm comes. Fix the rules: add a shelter rule and keep the radio on.',
    conceptTarget: 'communication',
    design: {
      site: 'ridge',
      panels: 4,
      mastLevel: 1,
      batteries: 6,
      waterLoopTier: 1,
      o2LoopTier: 0,
      greenhouseModules: 1,
      shieldingLayers: 0,
      spares: { co2_scrubber: 2, o2_generator: 1, water_processor: 1, power_array: 0 },
    },
    rules: {
      priority: LADDER,
      ifThen: [
        {
          condition: { kind: 'battery_below_pct', value: 90 },
          action: { kind: 'shed', load: 'comms' },
        },
        fixFirst,
      ],
    },
    sunEra: 'stormy',
    conceptCheck: {
      prompt: 'Why did switching off the radio make storms more dangerous?',
      options: [
        'The radio protects the crew from radiation.',
        'Without the radio, the warning from Earth never arrived, so the crew hid too late.',
        'The radio uses up all the oxygen.',
        'It did not matter at all.',
      ],
      correctIndex: 1,
      explanation:
        'A warning is only useful if it arrives. Saving a little power on the radio can cost you the time to get to the shelter.',
    },
    needsReview: true,
  },
];
