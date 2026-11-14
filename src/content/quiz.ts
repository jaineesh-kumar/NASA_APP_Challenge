// Pre/post quiz, 6 questions (Spec B8, B9; L8 AC2, AC6).
// Agent-drafted: every item carries needsReview: true until a human clears it.
// Claims are limited to what params.json, docs/SOURCES.md or data/spaceWeather.json support.

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptRef: string;
  needsReview: true;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'The Moon base has lots of sunshine. Why does it still need batteries?',
    options: [
      'Batteries make extra sunlight.',
      'Mountains sometimes block the Sun, so panels make no power for many hours.',
      'Moon dust charges the batteries.',
      'Batteries keep the panels cool.',
    ],
    correctIndex: 1,
    explanation:
      'Near the Moon’s south pole the Sun stays low, so hills and crater walls can block it. Then all power must come from batteries (sources S03, S09).',
    conceptRef: 'margin',
    needsReview: true,
  },
  {
    id: 'q2',
    question: 'What does a better water recycler do?',
    options: [
      'It makes gravity stronger.',
      'It cleans more of the used water, so less water is lost.',
      'It lets the crew stop breathing.',
      'It cools the base without power.',
    ],
    correctIndex: 1,
    explanation:
      'The space station’s upgraded system recovers more of its water than the older one (source S04). Less water lost means less water to carry from Earth.',
    conceptRef: 'loop_closure',
    needsReview: true,
  },
  {
    id: 'q3',
    question: 'Your base has only one oxygen maker and no spare. What is the problem?',
    options: [
      'Nothing. One is enough.',
      'If it breaks, there is no way to fix it. One broken part can end the mission.',
      'It makes too much oxygen.',
      'It uses no power at all.',
    ],
    correctIndex: 1,
    explanation:
      'Engineers call this a single point of failure: one part whose breakdown stops everything. Spares or backups remove it.',
    conceptRef: 'single_point_of_failure',
    needsReview: true,
  },
  {
    id: 'q4',
    question: 'A solar storm warning arrives. What is the safest thing for the crew to do?',
    options: [
      'Go outside to clean the solar panels.',
      'Go into the storm shelter until the storm is over.',
      'Turn off life support to save power.',
      'Ignore it. Storms do not matter on the Moon.',
    ],
    correctIndex: 1,
    explanation:
      'The shelter has extra walls between the crew and the storm. In this game the shelter blocks part of the radiation (an illustrative number). The cost: no science or building while hiding.',
    conceptRef: 'trade_offs',
    needsReview: true,
  },
  {
    id: 'q5',
    question:
      'Your rules switch off the radio to save power. What can go wrong during a solar storm?',
    options: [
      'Nothing. The radio only plays music.',
      'The storm warning from Earth cannot reach the base, so the crew may not hide in time.',
      'The radio makes the storm stronger.',
      'The batteries fill up too fast.',
    ],
    correctIndex: 1,
    explanation:
      'In this game, warnings from Earth travel by radio. Saving power on the radio is a real trade-off: it can cost you the warning.',
    conceptRef: 'communication',
    needsReview: true,
  },
  {
    id: 'q6',
    question:
      'Some years had many more solar storms than others. What should a careful engineer do?',
    options: [
      'Plan only for the calmest year.',
      'Test the base against stormy years too, and keep extra protection.',
      'Ignore the Sun completely.',
      'Launch only at night.',
    ],
    correctIndex: 1,
    explanation:
      'NASA’s DONKI records show big changes from year to year (source S12). A good design keeps a margin for the stormy years.',
    conceptRef: 'margin',
    needsReview: true,
  },
];
