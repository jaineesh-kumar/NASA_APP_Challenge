# Architecture

AstroSim is a static single-page app. Nothing runs on a server and nothing is fetched at runtime.

```
data/params.json  data/donki_archive.json  data/osdr_cards.json      (archived, human-owned data)
        |                 |                        |
        v                 v                        v
src/engine/  (pure TypeScript: no React, no DOM, no I/O, no randomness except the seeded RNG)
  params.ts       load + validate params and the DONKI archive
  constants.ts    resolve every param once per load (fast tick loop)
  rng.ts          mulberry32
  schedule.ts     dark windows, jitter, mast effect
  events.ts       seeded storms (random mode), dust, component failures, repair help
  power.ts        generation, priority-ladder allocation, battery
  lifeSupport.ts  oxygen, CO2, water, electrolysis, Sabatier
  crew.ts         crew hours: greenhouse, science, construction, repairs
  food.ts         stored food and greenhouse
  radiation.ts    dose with shields, shelter and storm strength
  rules.ts        IF-THEN interpreter and validation
  sim.ts          runMission(design, rules, seed, params, { stormMode, trace })
  montecarlo.ts   runCampaign, Wilson interval, nearest-rank percentile
  review.ts       cause chain + concept from the mission log
        |
        v
src/worker/campaign.worker.ts   runs runCampaign off the main thread
        |
        v
src/state/   store.tsx (useReducer + Context: design, rules, storm mode, Junior/Planner mode,
             results, history) · useCampaign.ts (worker, fallback, worst-run trace) ·
             scenarioCode.ts (versioned share codes, strict validation)
        |
        v
src/ui/      App shell: Header (mode toggle), StepTrack (route arc + stubs), coupon per step,
             StepFooter (Back/Next with lock reasons). Screens: Briefing, Design, Rules,
             Rehearse (Test), Review, Learn, ModelCard. Charts are hand-written SVG.
src/content/ every user-facing string (copy.ts, concepts, missions/kits, quiz, OSDR cards)
```

## Data flow of one test

1. The player builds a design and rules, and picks a storm mode (random, or replay of one archived DONKI storm).
2. `useCampaign` posts them to the worker, which runs seeds 1 to 300 through `runMission` and aggregates a `CampaignResult`.
3. The main thread re-runs only the worst seed with `trace: true` for the replay charts and meters.
4. Review renders the result: boarding pass, 100-icon grid (Junior) or ranges (Planner), cause chart, mass-vs-risk dots for every design tried this session, replay, cause chain, concept hint, and a matching OSDR finding.

## Per-tick order (spec B5.4)

Events (storms, dust, failures; repair help if the radio link was up) → rules (state at the end of the previous tick) → generation → power allocation and battery (radio link = comms powered) → life support → crew hours → food → radiation → loss checks and log (state changes only).

## Determinism and tests

- Same seed and inputs give a deep-equal result; golden files (`tests/golden/missions.json`, `tests/golden/replay.json`) lock the engine.
- Each engine module has its own test file; UI tests use Testing Library roles and names; `tests/ui/accessibility.test.tsx` checks text contrast pairs.
- The production build gets a Content-Security-Policy (`vite.config.ts`).

## Real data pipeline (developer machine only)

`scripts/fetch-donki.mjs` and `scripts/fetch-osdr.mjs` write the archives in `data/`. They are never part of the app bundle. See `docs/DATA_USED.md`.
