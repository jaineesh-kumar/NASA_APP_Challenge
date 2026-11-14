// Example bases and guided missions (Spec B1, B5.2, B8; L6, L8 AC1, AC6).
// Presets were checked with 300-run campaigns (see docs/DECISIONS.md ADR-007); they must stay
// inside the mass budget (tests/ui/store.test.tsx). Agent-drafted text carries needsReview.

import { getDonkiArchive } from '../engine/params.ts';
import { Design, IfThenRule, Rules, StormMode } from '../engine/types.ts';

export interface ConceptCheck {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type MissionId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5';

/** Mission steps a coach tip can appear on (the Free build flow, after Briefing). */
export type CoachStep = 'design' | 'rules' | 'rehearse' | 'review';

export interface GuidedMission {
  id: MissionId;
  title: string;
  subtitle: string;
  objective: string;
  conceptTarget: string;
  /** Short tips shown on each step while this mission is being played. */
  coach: Partial<Record<CoachStep, string>>;
  design: Design;
  rules: Rules;
  stormMode: StormMode;
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

/**
 * An archived DONKI storm by size of its linked flare (X > M > C, then by number):
 * place 0 is the biggest, place 1 the second biggest.
 */
function archivedStormByRank(place: number): StormMode {
  const rank = (cls: string) =>
    'CMX'.indexOf(cls.charAt(0)) * 1000 + Number.parseFloat(cls.slice(1));
  const events = [...getDonkiArchive().events].sort(
    (a, b) => rank(b.flareClass) - rank(a.flareClass),
  );
  const pick = events[place] ?? events[0];
  return pick ? { kind: 'replay', eventId: pick.id } : { kind: 'random' };
}

// B10.7 starter kits. Measured with 300-run campaigns (ADR-013): Light 58 mu, 75 of 100
// home; Balanced 98 mu, 94 of 100; Heavy 102 mu, 73 of 100. No kit is free.
const kitRules: Rules = {
  priority: LADDER,
  ifThen: [
    {
      condition: { kind: 'battery_below_pct', value: 30 },
      action: { kind: 'greenhouse_low_power' },
    },
    shelterOnWarning,
    fixFirst,
  ],
};

export const missionPresets: MissionPreset[] = [
  {
    id: 'light',
    name: 'Light kit',
    tagline: 'Cheap and quick, but few backups',
    description:
      'Leaves lots of rocket space free. No shields and only one spare part, so breakdowns hurt.',
    design: {
      site: 'ridge',
      panels: 4,
      mastLevel: 0,
      batteries: 5,
      waterLoopTier: 0,
      o2LoopTier: 0,
      greenhouseModules: 1,
      shieldingLayers: 0,
      spares: { co2_scrubber: 1, o2_generator: 0, water_processor: 0, power_array: 0 },
    },
    rules: kitRules,
  },
  {
    id: 'balanced',
    name: 'Balanced kit',
    tagline: 'A bit of everything',
    description: 'Good batteries, a better water recycler, one shield layer and spare parts.',
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
    rules: kitRules,
  },
  {
    id: 'heavy',
    name: 'Heavy kit',
    tagline: 'All-in on radiation shields',
    description:
      'Three shield layers block lots of radiation, but that weight left little room for spares.',
    design: {
      site: 'ridge',
      panels: 4,
      mastLevel: 0,
      batteries: 6,
      waterLoopTier: 0,
      o2LoopTier: 0,
      greenhouseModules: 1,
      shieldingLayers: 3,
      spares: { co2_scrubber: 1, o2_generator: 1, water_processor: 0, power_array: 0 },
    },
    rules: kitRules,
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
    coach: {
      design:
        'Coach tip: this base sits at the Crater Edge, where the dark lasts a long time. Add more batteries. Then open “More options” and raise the mast. Small changes are not enough here!',
      rules:
        'Coach tip: these rules are ready. Life support is at the top of the ladder, so it keeps power longest. Press Next.',
      rehearse:
        'Coach tip: press the big button. The computer flies your base many times, with different dust, dark hours and breakdowns each time.',
      review:
        'Coach tip: look at the big number. Not enough crews home yet? Go back to Build, add more, and test again.',
    },
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
    stormMode: { kind: 'random' },
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
    coach: {
      design:
        'Coach tip: open “More options” and look at the spare parts. Which machine has no spare?',
      review:
        'Coach tip: read “Why did it happen?” to follow the clues back to the broken machine.',
    },
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
    stormMode: { kind: 'random' },
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
      'This base faces the strongest real solar storm in our NASA archive. Its rules switch the radio off to save power, and nobody hides when a storm comes. Fix the rules: add a shelter rule and keep the radio on.',
    conceptTarget: 'communication',
    coach: {
      rules:
        'Coach tip: one rule switches the radio off when the battery is below a number. Remove it. Then turn on “Storm warning: crew goes to the shelter”.',
      rehearse:
        'Coach tip: this test replays a real solar storm from NASA’s archive. It is a saved copy, not live.',
    },
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
    stormMode: archivedStormByRank(0),
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
  {
    id: 'M4',
    title: 'Mission 4: Grow your own food',
    subtitle: 'The food boxes run out before the mission ends',
    objective:
      'This base packed food boxes but no greenhouse. The boxes run out before day 30. Add a greenhouse so the crew can grow food. Watch what it costs: power, water and crew time.',
    conceptTarget: 'trade_offs',
    coach: {
      design:
        'Coach tip: find “Greenhouse modules” and add one. Check the rocket weight bar. Is there still room?',
      review:
        'Coach tip: did food stop being the main trouble? A greenhouse costs weight and power, but it keeps feeding the crew.',
    },
    design: {
      site: 'ridge',
      panels: 4,
      mastLevel: 1,
      batteries: 6,
      waterLoopTier: 1,
      o2LoopTier: 0,
      greenhouseModules: 0,
      shieldingLayers: 1,
      spares: { co2_scrubber: 2, o2_generator: 1, water_processor: 1, power_array: 0 },
    },
    rules: { priority: LADDER, ifThen: [saveScience(30), shelterOnWarning, fixFirst] },
    stormMode: { kind: 'random' },
    conceptCheck: {
      prompt: 'What does a greenhouse cost your base?',
      options: [
        'Nothing at all.',
        'Rocket weight, power, water and crew time.',
        'Only oxygen.',
        'It makes the batteries smaller.',
      ],
      correctIndex: 1,
      explanation:
        'Every choice has a cost. A greenhouse feeds the crew, but it needs weight, power, water and work.',
    },
    needsReview: true,
  },
  {
    id: 'M5',
    title: 'Mission 5: Shield or shelter?',
    subtitle: 'A real giant solar storm is coming',
    objective:
      'This base faces one of the biggest real solar storms in our NASA archive. It has no shield and no shelter rule. Protect the crew: build shield layers, or turn on the shelter rule, or both. Each way costs something different.',
    conceptTarget: 'trade_offs',
    coach: {
      design:
        'Coach tip: shield layers block radiation all the time, but they are heavy and the crew must build them.',
      rules:
        'Coach tip: the shelter rule is free to pack, but the crew stops working while it hides.',
      rehearse:
        'Coach tip: this test replays a real solar storm from NASA’s archive. It is a saved copy, not live.',
    },
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
    rules: { priority: LADDER, ifThen: [saveScience(30), fixFirst] },
    stormMode: archivedStormByRank(1),
    conceptCheck: {
      prompt: 'Why might an engineer pick the shelter rule instead of more shield layers?',
      options: [
        'The shelter rule adds no rocket weight, but the crew stops working while it hides.',
        'The shelter makes storms smaller.',
        'Shields do nothing.',
        'The shelter makes extra oxygen.',
      ],
      correctIndex: 0,
      explanation:
        'Both protect the crew. Shields cost weight and building time. The shelter costs work time during storms.',
    },
    needsReview: true,
  },
];
