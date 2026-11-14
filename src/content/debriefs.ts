// Mission debriefs: 3 multiple-choice questions per guided mission (M1 to M5).
// Every option that is not correct has a short "why not"; every question has a hint, an
// explanation and a source id from docs/SOURCES.md (or ASSUMPTION / DERIVED for game rules).
// Agent-drafted: needsReview stays true until a human clears it (B9). No numbers are typed
// here; the game's numbers live in data/params.json.

import { MissionId } from './missions.ts';
import { SourceId } from './sources.ts';

export interface DebriefOption {
  text: string;
  /** Why this answer is not right. Absent on the correct option. */
  whyNot?: string;
}

export interface DebriefQuestion {
  id: string;
  prompt: string;
  options: DebriefOption[];
  correctIndex: number;
  hint: string;
  explanation: string;
  sourceRef: SourceId;
  needsReview: true;
}

export const debriefs: Record<MissionId, DebriefQuestion[]> = {
  M1: [
    {
      id: 'm1-q1',
      prompt: 'Why do solar panels at the Crater Edge make no power for many hours?',
      options: [
        {
          text: 'Moon dust turns the panels off every night.',
          whyNot: 'Dust only makes panels weaker for a while. It does not switch them off.',
        },
        {
          text: 'The Sun stays low in the sky there, so hills and crater walls block it for a while.',
        },
        {
          text: 'The panels need to rest.',
          whyNot: 'Panels do not get tired. They make power whenever sunlight hits them.',
        },
      ],
      correctIndex: 1,
      hint: 'Think about where the Sun sits in the sky near the Moon’s south pole.',
      explanation:
        'Near the south pole the Sun stays close to the horizon, so hills and crater walls cast long shadows. The game’s dark hours are illustrative schedules that match how much light each spot gets.',
      sourceRef: 'S03',
      needsReview: true,
    },
    {
      id: 'm1-q2',
      prompt: 'Why does a taller mast help the solar panels?',
      options: [
        {
          text: 'It stores extra power for the night.',
          whyNot: 'Storing power is the job of the batteries.',
        },
        {
          text: 'It makes the Sun brighter.',
          whyNot: 'Nothing on the Moon can change how bright the Sun is.',
        },
        { text: 'It lifts the panels above nearby shadows, so the dark hours get shorter.' },
      ],
      correctIndex: 2,
      hint: 'Shadows lie close to the ground. What happens if you climb higher?',
      explanation:
        'Scientists found that higher places near the south pole get more sunlight. In the game each mast level makes the dark hours a little shorter. How much shorter is our illustrative choice.',
      sourceRef: 'S03',
      needsReview: true,
    },
    {
      id: 'm1-q3',
      prompt: 'In the hardest tests the battery got very low. What is the lesson?',
      options: [
        { text: 'Keep a margin: carry more than a normal day needs.' },
        {
          text: 'Batteries are useless, so leave them at home.',
          whyNot: 'Without batteries, nothing runs in the dark at all.',
        },
        {
          text: 'Switch off life support to save power.',
          whyNot: 'Life support keeps the air clean. Switching it off puts the crew in danger.',
        },
      ],
      correctIndex: 0,
      hint: 'What do you call the extra you keep “just in case”?',
      explanation:
        'That extra is called margin. In some tests darkness, dust and breakdowns pile up. A plan that only just works on a normal day can run out on a bad day.',
      sourceRef: 'ASSUMPTION',
      needsReview: true,
    },
  ],
  M2: [
    {
      id: 'm2-q1',
      prompt: 'In this base, what happened when the water recycler broke and there was no spare?',
      options: [
        {
          text: 'The base made extra water by itself.',
          whyNot: 'A broken recycler cannot clean or make water.',
        },
        {
          text: 'The crew kept using water, but none of it was cleaned again, so the tanks slowly emptied.',
        },
        {
          text: 'Nothing changed.',
          whyNot: 'Look at the replay: the water went down after the breakdown.',
        },
      ],
      correctIndex: 1,
      hint: 'Without the recycler, used water is not cleaned for the crew to use again.',
      explanation:
        'In the game a broken machine with no spare stays broken. Used water is lost, so the water in the tanks keeps going down.',
      sourceRef: 'ASSUMPTION',
      needsReview: true,
    },
    {
      id: 'm2-q2',
      prompt: 'Which change removes this single point of failure?',
      options: [
        {
          text: 'Add more solar panels.',
          whyNot: 'More power does not fix a broken water recycler.',
        },
        {
          text: 'Add a shield layer.',
          whyNot: 'Shields block radiation. They do not fix machines.',
        },
        { text: 'Pack a spare part for the water recycler.' },
      ],
      correctIndex: 2,
      hint: 'Which machine had no backup?',
      explanation:
        'A spare turns a mission-ending breakdown into a repair job. Finding parts with no backup is a big part of how engineers study risk.',
      sourceRef: 'S06',
      needsReview: true,
    },
    {
      id: 'm2-q3',
      prompt: 'Where does the game get its numbers for how much water the recyclers save?',
      options: [
        { text: 'From NASA’s fact sheet about life support on the space station.' },
        {
          text: 'From a random guess.',
          whyNot: 'Many game numbers are guesses, but this one has a real NASA source.',
        },
        {
          text: 'From a Moon rock.',
          whyNot: 'Rocks cannot tell us how well a machine recycles water.',
        },
      ],
      correctIndex: 0,
      hint: 'Look for the NASA document about life support on the space station.',
      explanation:
        'The water savings for the basic and the upgraded recycler come from NASA’s space station life support fact sheet. You can see both numbers on the “Data and science” page.',
      sourceRef: 'S04',
      needsReview: true,
    },
  ],
  M3: [
    {
      id: 'm3-q1',
      prompt: 'Who sends the solar storm warning to your base?',
      options: [
        {
          text: 'The solar panels.',
          whyNot: 'Panels make power. They cannot tell when a storm is coming.',
        },
        { text: 'Space weather forecasters on Earth, by radio.' },
        {
          text: 'Nobody. Storms are always a surprise.',
          whyNot: 'People on Earth watch the Sun, so a warning can come first, if the radio is on.',
        },
      ],
      correctIndex: 1,
      hint: 'In this game the warning travels by radio. Where does it come from?',
      explanation:
        'People on Earth watch the Sun. NASA keeps a record of solar storms and alerts in its DONKI space weather database. In the game the warning only arrives if your radio has power.',
      sourceRef: 'S12',
      needsReview: true,
    },
    {
      id: 'm3-q2',
      prompt: 'Where did the storm in this mission come from?',
      options: [
        {
          text: 'Our team made it up.',
          whyNot: 'Check the label on the Test step: it names a real date from NASA.',
        },
        {
          text: 'It happens every day on the Moon.',
          whyNot: 'In the game, big storms come only now and then, not every day.',
        },
        { text: 'It is a real solar storm recorded in NASA’s DONKI database.' },
      ],
      correctIndex: 2,
      hint: 'Look for the “Archived NASA data” label on the Test step.',
      explanation:
        'Which storm happened, and when, is real NASA data (a saved copy, not live). How strong it is in the game is our simplification, based on the class of its flare.',
      sourceRef: 'S12',
      needsReview: true,
    },
    {
      id: 'm3-q3',
      prompt: 'Why can a Moon crew get quick help from Mission Control, but a Mars crew cannot?',
      options: [
        {
          text: 'Radio messages reach the Moon in about a second, but take minutes to reach Mars.',
        },
        {
          text: 'Mars has no radios.',
          whyNot: 'The problem is not the radio. It is how long the message takes to travel.',
        },
        {
          text: 'Mission Control only works on the Moon.',
          whyNot: 'Mission Control is on Earth and can talk to both places.',
        },
      ],
      correctIndex: 0,
      hint: 'Radio travels at the speed of light. Which place is farther away?',
      explanation:
        'Radio travels at the speed of light. The Moon is close, so a message takes about a second. Mars is much farther, so each message takes many minutes. The Rules step shows both times.',
      sourceRef: 'DERIVED',
      needsReview: true,
    },
  ],
  M4: [
    {
      id: 'm4-q1',
      prompt: 'Why did the crews run out of food in this mission?',
      options: [
        {
          text: 'The crew forgot to eat.',
          whyNot: 'Every crew member eats the same amount every day in the game.',
        },
        { text: 'The packed food runs out before the mission ends, and nothing refills it.' },
        {
          text: 'Food goes bad straight away on the Moon.',
          whyNot: 'In the game, packed food does not go bad. It just runs out.',
        },
      ],
      correctIndex: 1,
      hint: 'Compare how long the food boxes last with how long the mission is.',
      explanation:
        'In the game the packed food runs out before the last day (an illustrative amount). Without a greenhouse, nothing grows more food.',
      sourceRef: 'ASSUMPTION',
      needsReview: true,
    },
    {
      id: 'm4-q2',
      prompt: 'What does a greenhouse need to grow food in this game?',
      options: [
        {
          text: 'Nothing. Plants grow by themselves.',
          whyNot: 'Plants on the Moon need lamps, water and care from the crew.',
        },
        {
          text: 'Only radiation.',
          whyNot: 'Radiation harms plants and people. It does not feed them.',
        },
        { text: 'Power, water and crew time.' },
      ],
      correctIndex: 2,
      hint: 'Read what the Build step says next to “Greenhouse modules”.',
      explanation:
        'Each greenhouse module uses power for its lamps, water for the plants and crew hours for care. It also adds rocket weight. That is the trade-off.',
      sourceRef: 'ASSUMPTION',
      needsReview: true,
    },
    {
      id: 'm4-q3',
      prompt: 'Why do scientists grow plants on the International Space Station?',
      options: [
        { text: 'To learn how plants change in space, so crews far from Earth can grow food.' },
        {
          text: 'To decorate the walls.',
          whyNot: 'Plants are nice to look at, but these are science experiments.',
        },
        {
          text: 'Because plants make extra radiation shields.',
          whyNot: 'In this game, only shield layers and the shelter block radiation.',
        },
      ],
      correctIndex: 0,
      hint: 'Think about crews that travel far from Earth for a long time.',
      explanation:
        'NASA’s OSDR library keeps real studies of plants grown in space, such as small plants grown in the Veggie garden on the space station. Studies like this help scientists learn to grow food far from Earth.',
      sourceRef: 'S13',
      needsReview: true,
    },
  ],
  M5: [
    {
      id: 'm5-q1',
      prompt: 'Where does the game get its number for everyday radiation on the Moon?',
      options: [
        {
          text: 'From a storm on Mars.',
          whyNot: 'This game is about the Moon, so the number comes from the Moon.',
        },
        { text: 'From a real measurement made on the Moon’s surface by the Chang’e-4 lander.' },
        {
          text: 'From a guess by our team.',
          whyNot: 'Some game numbers are guesses, but this one was measured on the Moon.',
        },
      ],
      correctIndex: 1,
      hint: 'Look at the source next to the radiation number on the “Data and science” page.',
      explanation:
        'Scientists measured the radiation dose on the Moon’s surface with an instrument on China’s Chang’e-4 lander. The game uses that measurement for normal days.',
      sourceRef: 'S02',
      needsReview: true,
    },
    {
      id: 'm5-q2',
      prompt: 'What do shield layers cost your base?',
      options: [
        {
          text: 'Nothing at all.',
          whyNot: 'Watch the rocket weight bar when you add a layer.',
        },
        { text: 'Rocket weight, and crew time to build them.' },
        {
          text: 'They switch off the radio.',
          whyNot: 'Shields and the radio do not affect each other.',
        },
      ],
      correctIndex: 1,
      hint: 'Check the rocket weight bar when you add a shield layer.',
      explanation:
        'Each shield layer adds rocket weight. The crew also spends work hours piling up Moon dirt (regolith) to build it, time they cannot spend on science.',
      sourceRef: 'ASSUMPTION',
      needsReview: true,
    },
    {
      id: 'm5-q3',
      prompt: 'What does hiding in the shelter cost?',
      options: [
        {
          text: 'It uses up the shield layers.',
          whyNot: 'Shield layers stay built. Hiding does not use them up.',
        },
        {
          text: 'Nothing, so the crew should hide all the time.',
          whyNot: 'If the crew always hides, no science or building ever gets done.',
        },
        { text: 'While the crew hides, nobody does science or builds shields.' },
      ],
      correctIndex: 2,
      hint: 'What can the crew not do while it is inside the shelter?',
      explanation:
        'The shelter cuts a storm’s radiation a lot (an illustrative number), but while the crew hides, science and building stop. Hiding only during storms keeps that cost small.',
      sourceRef: 'ASSUMPTION',
      needsReview: true,
    },
  ],
};
