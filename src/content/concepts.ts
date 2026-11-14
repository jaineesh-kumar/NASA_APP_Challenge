// Big ideas shown as hints (Spec B5.9, B8, B9). Agent-drafted: needsReview until a human clears it.

import { ConceptId } from '../engine/review.ts';

export interface ConceptDefinition {
  id: ConceptId;
  title: string;
  subtitle: string;
  summary: string;
  takeaway: string;
  sourceRef: string;
  needsReview: true;
}

export const concepts: Record<ConceptId, ConceptDefinition> = {
  redundancy: {
    id: 'redundancy',
    title: 'Redundancy',
    subtitle: 'Have a backup',
    summary:
      'Machines break, even in space. A backup machine or a spare part means one breakdown does not end the mission.',
    takeaway: 'Pack spares for the machines your crew cannot live without.',
    sourceRef: 'S06',
    needsReview: true,
  },
  margin: {
    id: 'margin',
    title: 'Margin',
    subtitle: 'Keep extra, just in case',
    summary:
      'Margin is the extra you keep for bad days. On the Moon, darkness and dust cut your power. Extra battery is your power margin.',
    takeaway: 'Make sure the battery never hits zero, even in the hardest tests.',
    sourceRef: 'S03',
    needsReview: true,
  },
  loop_closure: {
    id: 'loop_closure',
    title: 'Recycling loops',
    subtitle: 'Use it again',
    summary:
      'Water is heavy to carry from Earth. Recyclers clean used water and air so the crew can use them again.',
    takeaway: 'A better recycler costs weight now but saves water every day.',
    sourceRef: 'S04',
    needsReview: true,
  },
  trade_offs: {
    id: 'trade_offs',
    title: 'Trade-offs',
    subtitle: 'Nothing is free',
    summary:
      'Your rocket has a weight limit. More shielding means fewer batteries or spares. Hiding from a storm keeps the crew safe but stops their work.',
    takeaway: 'Look at what failed, then spend weight where your base is weakest.',
    sourceRef: 'S06',
    needsReview: true,
  },
  single_point_of_failure: {
    id: 'single_point_of_failure',
    title: 'Single point of failure',
    subtitle: 'One part that can stop everything',
    summary:
      'If your base has one air cleaner and no spare, one breakdown puts the whole crew in danger. Engineers hunt for these weak spots.',
    takeaway: 'Find the parts with no backup and add a spare.',
    sourceRef: 'S06',
    needsReview: true,
  },
  communication: {
    id: 'communication',
    title: 'Staying in touch',
    subtitle: 'Warnings only help if they arrive',
    summary:
      'Forecasters on Earth watch the Sun. In this game their storm warnings reach the base by radio. Switch the radio off to save power, and the warning is lost.',
    takeaway: 'Keep the radio on during risky times, or plan for storms with no warning.',
    sourceRef: 'S12',
    needsReview: true,
  },
};
