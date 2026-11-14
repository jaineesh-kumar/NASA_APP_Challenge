// Golden fixture data, loaded by scripts/update-golden.mjs through Vite.
// Regenerate only after an approved model change (ADR), then review the git diff.
import { runMission } from '../src/engine/sim.ts';
import { craterDesign, goldenDesign, goldenRules, params } from '../tests/engine/fixtures.ts';

export const golden = {
  ridge_balanced: [1, 2, 3].map((s) => runMission(goldenDesign, goldenRules, s, params)),
  crater_closed_loop: [1, 2, 3].map((s) => runMission(craterDesign, goldenRules, s, params)),
};
