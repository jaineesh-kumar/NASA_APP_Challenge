// Astronaut Trainer Pre/Post Mission Quiz Questions (6 Questions)
// Spec B8, B9, Part C (L8 AC2, AC6: agent-drafted content has needsReview: true)

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
    question:
      'Why does a lunar south pole outpost need massive battery storage despite high sunlight peaks?',
    options: [
      'Batteries generate extra solar energy at night.',
      'Jagged crater rims and topography cast dark windows lasting up to 72 hours.',
      'Lunar dust improves battery charge speed.',
      'Batteries are required to cool the solar panels.',
    ],
    correctIndex: 1,
    explanation:
      'Even in near-permanent illumination regions, topography periodically blocks the low-angle Sun, producing dark windows where all power must come from batteries (Source: S03, S09).',
    conceptRef: 'margin',
    needsReview: true,
  },
  {
    id: 'q2',
    question:
      'What is the primary advantage of upgrading from a 90% base water processor to a 98% brine processor?',
    options: [
      'It creates artificial gravity inside the habitat.',
      'It drastically reduces resupply water mass by extracting almost all liquid from wastewater brine.',
      'It stops the crew from needing oxygen.',
      'It cools the habitat without using electricity.',
    ],
    correctIndex: 1,
    explanation:
      'A brine processor recovers precious water trapped in urine brine, boosting total water recovery to 98% and preventing water reserve depletion on long expeditions (Source: S04).',
    conceptRef: 'loop_closure',
    needsReview: true,
  },
  {
    id: 'q3',
    question: 'What does having a "Single Point of Failure" (SPOF) mean in mission architecture?',
    options: [
      'Every astronaut has their own separate rover.',
      'A component whose isolated breakdown leads directly to mission loss because no backup exists.',
      'A mission that succeeds on its first test flight.',
      'Having extra backup parts for every system.',
    ],
    correctIndex: 1,
    explanation:
      'A single point of failure means no backup or spare exists; if that machine fails, the whole system collapses (Source: S06).',
    conceptRef: 'single_point_of_failure',
    needsReview: true,
  },
  {
    id: 'q4',
    question:
      'When a Solar Particle Event (SPE) warning is received, what is the safest crew action?',
    options: [
      'Perform a surface spacewalk immediately to clean dust off solar panels.',
      'Retreat into the regolith-shielded storm shelter until the high-energy proton storm passes.',
      'Turn off all life support systems to save battery.',
      'Eject the greenhouse food modules.',
    ],
    correctIndex: 1,
    explanation:
      'Solar particle events produce lethal radiation doses. Sheltering behind thick regolith shielding cuts exposure by up to 75% (Source: S02).',
    conceptRef: 'trade_offs',
    needsReview: true,
  },
  {
    id: 'q5',
    question:
      'In the power allocation priority ladder, which system should usually be shed LAST during a severe power shortage?',
    options: [
      'Lunar Surface Science Experiments.',
      'Regolith Shield Construction Robotics.',
      'Crew Life Support (Cabin Atmosphere & O2).',
      'Greenhouse Hydroponics Lighting.',
    ],
    correctIndex: 2,
    explanation:
      'Life support keeps astronauts alive and must receive the highest priority. Non-vital loads like science and construction must be shed first during power emergencies.',
    conceptRef: 'margin',
    needsReview: true,
  },
  {
    id: 'q6',
    question:
      'How does an oxygen Sabatier reactor help close life support resource loops on the Moon?',
    options: [
      'It converts exhaled carbon dioxide and byproduct hydrogen into water and methane.',
      'It mines lunar rocks for liquid water.',
      'It directly turns sunlight into solid food.',
      'It replaces the need for solar panels.',
    ],
    correctIndex: 0,
    explanation:
      'The Sabatier catalytic reactor combines waste CO2 with H2 from water electrolysis to produce water, recovering up to 50% of oxygen otherwise lost as carbon dioxide (Source: S05).',
    conceptRef: 'loop_closure',
    needsReview: true,
  },
];
