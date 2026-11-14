// Golden fixture data, loaded by scripts/update-golden.mjs through Vite.
// Regenerate only after an approved model change (ADR), then review the git diff.
import { getDonkiArchive } from '../src/engine/params.ts';
import { runMission } from '../src/engine/sim.ts';
import { craterDesign, goldenDesign, goldenRules, params } from '../tests/engine/fixtures.ts';

export const golden = {
  ridge_balanced: [1, 2, 3].map((s) => runMission(goldenDesign, goldenRules, s, params)),
  crater_closed_loop: [1, 2, 3].map((s) => runMission(craterDesign, goldenRules, s, params)),
};

// Spec B5.11 replay mode (L10 AC5): every archived storm, seeds 1-3, ridge reference design.
export const replayGolden = Object.fromEntries(
  getDonkiArchive().events.map((e) => [
    e.id,
    [1, 2, 3].map((s) =>
      runMission(goldenDesign, goldenRules, s, params, {
        stormMode: { kind: 'replay', eventId: e.id },
      }),
    ),
  ]),
);
