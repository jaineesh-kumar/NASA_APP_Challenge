# Project status: Moonbase Margin

**Contract:** AGENTS_NEW.md v1.2. Sprint L10 to L13 on branch `nasa-new`; kid-friendly site remake on branch `remake-web` (ADR-014).
**Current work:** remake-web steps 1 to 7 complete; waiting for the team's review and the human items below.
**Last verified:** 2026-11-14 on `remake-web`. `npm run typecheck`, `lint`, `test` (40 files, 197 tests), `build` all pass.

## Levels

- [x] L0 to L9: baseline (earlier work), engine re-aligned with spec B5.4 to B5.9 (ADR-007, ADR-009)
- [x] L10 Real data: DONKI archive and Real Storm Replay (ADR-010)
- [x] Redesign: step-by-step flow and ticket-wallet design system (ADR-011, impeccable finish review: all material fixes resolved)
- [x] L12 Comms link (ADR-012; the team should confirm `comms.repair_assist_fraction`)
- [x] L11 Junior Mode (ADR-013)
- [x] L13 OSDR cards and compliance pass
- [x] remake-web 1: hash navigation (#/ and eight pages), site menu, Free build page
- [x] remake-web 2: landing page (story hook, Play, real-data badge)
- [x] remake-web 3: How to play (three picture cards) and the guided first mission with coach tips
- [x] remake-web 4: Missions M1 to M5, each with a three-question debrief (hint, free retry, explanation and source)
- [x] remake-web 5: Training Bay: Power Juggle and Storm Shelter (Shield Stack not built)
- [x] remake-web 6: Logbook (badges, progress in localStorage), Space words, Data and science, For teachers
- [x] remake-web 7: Real Storm Replay from the Data page; archived label on the Review replay

## Challenge compliance (B10.9)

- [x] Junior Mode is the default and usable by a child on a phone: `tests/ui/junior.test.tsx` (AC1); screenshots at 360px show no horizontal scroll.
- [x] At most 3 core meters visible by default: Power, Life support, Shield in the Junior replay; charts under "More details" (`tests/ui/review.test.tsx`, three `meter` roles).
- [x] Life support, shielding, power, food and comms (delay and link) are all present: engine B5.4 and B5.10; Moon vs Mars delay on the Rules step (`tests/ui/comms.test.tsx`).
- [x] At least one real NASA dataset drives gameplay (Storm Replay), labelled archived: `tests/engine/replay.test.ts`, `tests/ui/rehearse.test.tsx`.
- [x] Data panel and `docs/DATA_USED.md` exist and are accurate: DONKI and OSDR rows (`tests/ui/osdr.test.tsx` AC3).
- [x] No static data shown as live: every archive shows "Archived NASA data, retrieved <date>. Not live."
- [x] Failure messages are kind; replay is one click: no "You failed" anywhere (`tests/ui/junior.test.tsx` AC6); "Try again" and "New challenge" on Review.
- [ ] Resources tab contents recorded in `docs/CHALLENGE_RESOURCES.md` and considered: **needs a human** (the agent must not guess the Resources tab).

## Open questions and human items

00. Media (docs/MEDIA.md): commit the files in public/images and public/video (not tracked yet; tests/ui/mediaCard.test.tsx expects them), confirm their licence, compress the images (each about 2 MB) and the 4.45 MB grid video, export the pictures inside the concept sheet as separate files, and replace "./" in the og:image URLs with the deployed address.
0. remake-web (ADR-014): confirm `missions.goal_home_per_100` (90, illustrative); review the new agent-drafted texts (debriefs, M4 and M5, coach tips, badges, glossary additions, teacher lesson plan; all `needsReview: true`); decide whether to use the art in `public/images/` and `public/video/` (not committed, licence unknown) and whether to build Shield Stack.

1. Paste the challenge page's Resources tab into `docs/CHALLENGE_RESOURCES.md`.
2. Confirm the illustrative params added in the sprint: `radiation.replay_onset_h` (300 h), `radiation.spe_multiplier_by_flare_class` ([10, 20, 40]), `comms.repair_assist_fraction` (0.25).
3. Balance (ADR-008): CO2 breakdowns dominate losses; shield layers matter little while a shelter rule is on.
4. Verify S01 (BVAD) crew values and the S11 (NASA-STD-3001) dose limit.
5. Review the agent-drafted texts marked `needsReview: true` (quiz, missions, concepts, OSDR summaries).
6. Font licence: self-host an OFL condensed grotesk so iPads and Chromebooks get the same display face (DESIGN.md).
7. Licence for the repository (no LICENSE file yet), deployment, demo video, playtest notes in `docs/PLAYTEST.md`.

## Decisions log

See `docs/DECISIONS.md` (ADR-001 to ADR-013).
