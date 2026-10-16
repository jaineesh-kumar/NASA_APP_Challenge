// Educational engineering concepts and definitions for Moonbase Margin
// Spec B5.9, B8, B9, Part C (L8 AC6: agent-drafted content has needsReview: true)

export interface ConceptDefinition {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  takeaway: string;
  sourceRef: string;
  needsReview: true;
}

export const concepts: Record<string, ConceptDefinition> = {
  redundancy: {
    id: 'redundancy',
    title: 'Redundancy & Spare Capacity',
    subtitle: 'Backups prevent single points of failure',
    summary:
      'In space systems, equipment will break down. Redundancy means having backup components or carry-along maintenance spares so a single broken machine does not end the mission.',
    takeaway:
      'Pack at least 1 spare part for high-stress life support units, or establish dual operating pathways.',
    sourceRef: 'S06',
    needsReview: true,
  },
  margin: {
    id: 'margin',
    title: 'Engineering Safety Margin',
    subtitle: 'The buffer between expected demand and total capacity',
    summary:
      'Margin is the extra buffer designed into critical subsystems. On the Moon, solar eclipses and dust storms cut energy generation. Having battery reserves above normal usage is your energy margin.',
    takeaway:
      'Ensure the 5th percentile battery level never hits zero during multi-day dark periods.',
    sourceRef: 'S03',
    needsReview: true,
  },
  loop_closure: {
    id: 'loop_closure',
    title: 'Closed Loop Life Support',
    subtitle: 'Recycling waste products to reduce resupply mass',
    summary:
      'Sending water and oxygen from Earth is expensive. Closed-loop ECLSS equipment recycles exhaled carbon dioxide and wastewater into breathable oxygen and drinkable water.',
    takeaway:
      'Upgrading to a 98% brine processor or Sabatier reactor drastically cuts launch mass needs.',
    sourceRef: 'S04',
    needsReview: true,
  },
  trade_offs: {
    id: 'trade_offs',
    title: 'Engineering Trade-Offs',
    subtitle: 'Every advantage costs mass and power',
    summary:
      'With a strict 120 mass unit launch limit, you cannot buy everything. Adding heavier radiation shielding means less mass for hydroponics or spare parts. Engineers must balance competing risks.',
    takeaway: 'Analyze failure cause bars to invest mass only where outpost margins are weakest.',
    sourceRef: 'S01',
    needsReview: true,
  },
  single_point_of_failure: {
    id: 'single_point_of_failure',
    title: 'Single Point of Failure (SPOF)',
    subtitle: 'A single component whose failure halts the whole system',
    summary:
      'If an outpost relies on one oxygen generator with zero spares, any breakdown directly imperils crew life. Eliminating single points of failure is the core rule of astronaut safety.',
    takeaway:
      'Carry spare parts or secondary survival tanks for every unbacked life-support system.',
    sourceRef: 'S06',
    needsReview: true,
  },
};
