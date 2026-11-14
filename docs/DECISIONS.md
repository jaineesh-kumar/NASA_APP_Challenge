# Architecture Decision Records (ADR) Log

This document records architectural decisions for Moonbase Margin. Any deviation, new assumption, or contract change requires human approval and an entry here (B4.12).

---

## ADR Template

```markdown
### ADR-XXX: [Title]

- **Date:** YYYY-MM-DD
- **Status:** Proposed / Accepted / Rejected
- **Context:** [What problem are we trying to solve?]
- **Decision:** [What did we decide?]
- **Consequences:** [What are the positive and negative implications?]
```

---

### ADR-001: Bootstrap Repository Architecture and Toolchain

- **Date:** 2026-10-15
- **Status:** Accepted
- **Context:** Establishing the repository structure, toolchains (Vite, Vitest, TypeScript, ESLint, Prettier), and CI pipeline for the Moonbase Margin simulation.
- **Decision:** Follow the repository specification in B3 and dependency bounds in B2.
- **Consequences:** Provides reproducible environment, strict TypeScript type checking, unit testing capability, and linting.

---

### ADR-002: Simulation Contract Types, Parameter Validation, and Mass Calculations (L1)

- **Date:** 2026-10-15
- **Status:** Accepted
- **Context:** Spec B5.2, B5.3, B5.8, B6 require frozen engine types, strict parameter schema validation with typed getters, deterministic pseudo-random number generation, and mass calculation without numeric domain literals in code.
- **Decision:** Implemented frozen interfaces in `src/engine/types.ts` along with typed `EngineError`. Validated all 62 required parameters in `src/engine/params.ts`. Implemented standard 32-bit mulberry32 PRNG in `src/engine/rng.ts`. Implemented mass calculations pulling all coefficients strictly from parameters in `src/engine/mass.ts`.
- **Consequences:** Contracts are stable and frozen for subsequent simulation modules (L2-L5) and UI screens (L6-L8).

---

### ADR-005: Real solar storms from NASA DONKI replace invented storm draws

- **Date:** 2026-11-14
- **Status:** Accepted (requested by the team lead: "make sure it uses the real data")
- **Context:** The challenge asks for real NASA data, and names DONKI. Storms were a random draw from an ASSUMPTION rate (`radiation.spe_per_month`) with an ASSUMPTION warning lead.
- **Decision:** `scripts/fetch-nasa-data.mjs` (build time, key in git-ignored `.env`) downloads every DONKI SEP record from 2010-04-01 onward and writes `data/spaceWeather.json`. Records within 24 h are merged into one storm. Warning lead = onset minus the earliest linked flare or CME start (0 if none, or more than 48 h). Each mission draws one real 30-day window (one RNG draw before tick 0, after the dark-window jitter). Players can test against "Any time", "Calm Sun" or "Stormy Sun" (the third of full years with the fewest / most storms, computed from the data). Source id S12 added to SOURCES.md. `radiation.spe_per_month` and `radiation.spe_warning_lead_h` are removed; storm strength (`spe_multiplier`) and duration stay ASSUMPTION.
- **Consequences:** Contract change (F4): new optional `MissionOptions`, `SunEra`, `StormInfo`, `MissionResult.sun/scienceHours/trace`, `CampaignResult.sunEra/stormsPerRunMean/stormsMaxInRun/warningsMissed`, log type `warning_missed`, source `S12`. B5.3 draw order is now: jitter draws, sun-window draw, then per tick uDust + 4 component draws. Golden files regenerated (`tests/golden/missions.json`). No runtime network calls (F10 still holds); the data is labeled as a saved copy, never live.

---

### ADR-006: Storm warnings travel over the comms load

- **Date:** 2026-11-14
- **Status:** Accepted (requested by the team lead: "communication delay" mechanic from the challenge statement)
- **Context:** The comms load used power but had no effect, so shedding it was a free choice. The challenge lists communication delay as a core decision.
- **Decision:** A storm warning is issued `leadH` hours before onset (from DONKI). The base hears it only in an hour when comms is powered; a storm with lead 0 is only detected at onset. The `spe_warning` rule condition is true from the hour a warning is heard, or a storm is detected, until the storm ends. If a storm hits before the warning was heard, the log records `warning_missed`; the cause chain links it to `load_off:comms` or `rule_fired: shed comms`. Real Earth-Moon light delay (1.28 s, DERIVED) is shown on the Model Card but not simulated (far below the 1-hour tick).
- **Consequences:** Shedding comms now costs warning time. Measured on the Sunny Ridge preset, stormy era, 300 runs: shedding comms missed 367 warnings and raised dose P95 from 52,578 to 55,273 µSv. The effect on survival is small with current illustrative numbers (see ADR-008).

---

### ADR-007: Engine aligned with spec B5.4 / B5.7; constants cached

- **Date:** 2026-11-14
- **Status:** Accepted
- **Context:** Audit found deviations from the spec: the oxygen generator did not make oxygen from water (B5.4 step 5); crew order ignored `repair_first` and the B5.4 step 6 order; the storm alert switched off at onset, so the shelter rule did not cover the storm itself; loss counters used "greater than" instead of "reach"; percentile was not nearest-rank and `worstSeed` did not follow B5.7; `load_off` and `battery_empty` were logged every tick; the cause chain ignored the B5.9 table. Two of three example bases survived 0% of runs.
- **Decision:** Rewrote the engine modules to follow B5.4-B5.9 exactly, with a per-params constants cache (`src/engine/constants.ts`) instead of string lookups every tick. Example bases replaced with three checked designs; guided missions M1-M3 retuned so each one teaches its own lesson.
- **Consequences:** A 300-run campaign went from 352 ms to about 170 ms (measured locally, Node 26). All results changed, so golden files were regenerated. Tests rewritten per module and mapped to the level ACs.

---

### ADR-008: Balance findings for the human (no params changed)

- **Date:** 2026-11-14
- **Status:** Proposed (needs a human decision; agents never tune, B6)
- **Context:** Campaign measurements after ADR-005 to ADR-007, 300 runs each.
- **Findings:**
  - CO2 failures dominate good designs (about 4-6% of runs): a second air-cleaner breakdown after the spares run out. `failure.mtbf_h.co2_scrubber` and `co2.cabin_limit_kg` decide this.
  - Shield layers rarely change survival when a shelter rule exists. Without a shelter rule in stormy years, survival drops to 44%.
  - The comms penalty is real but small, because `radiation.spe_duration_h` and `spe_multiplier` are illustrative and the median DONKI lead is only 2 h.
  - Science is always met by survivors, so "success" equals "survival" for most designs.
- **Decision needed:** whether to tune `failure.mtbf_h.co2_scrubber`, `radiation.spe_multiplier`, `radiation.dose_limit_usv_mission` (still TODO: verify against S11) and `science.target_hours`.


---

### ADR-009: Switch to AGENTS_NEW.md v1.2 and how existing work is carried over

- **Date:** 2026-11-14
- **Status:** Accepted (team lead answers, 2026-11-14)
- **Context:** AGENTS_NEW.md v1.2 replaces the build contract. Work done before it (ADR-005 to ADR-008) partly conflicts: v1.2 keeps random storms exactly as B5.5 and adds a separate Real Storm Replay (B5.11); F1 forbids removing params; B5.10 defines a simpler comms link; L10 AC4 compares random mode against the old golden files, which came from an engine that broke B5.4.
- **Decision:** (1) Keep the existing work and adapt it to v1.2 (restore random storms and the two removed params, turn the DONKI window feature into the B5.11 replay picker, drop the Calm/Stormy picker). (2) Run L10 to L13 as the autonomous P-PS sprint. (3) The spec-correct engine wins over the old golden files: goldens are regenerated once here, and L10 AC4 means "random mode unchanged by L10" from this baseline. (4) All work stays on branch `nasa-new`.
- **Consequences:** ADR-005 (storm windows replacing random draws) and ADR-006 (DONKI-lead comms warnings) are superseded by L10 (B5.11) and L12 (B5.10).

---

### ADR-010: Real Storm Replay (L10) and the DONKI archive

- **Date:** 2026-11-14
- **Status:** Accepted (autonomous P-PS sprint, decided by the agent and logged here)
- **Context:** B5.11 asks for one real archived storm per replay mission, strength by linked flare class. B10.2 expects the flare class from `/DONKI/FLR`, which returned HTTP 404 throughout 2026-11-14.
- **Decision:**
  - Random storms restored exactly as B5.5 (uSpe draw each tick, `radiation.spe_per_month`, `radiation.spe_warning_lead_h`); the params removed earlier are restored unchanged (F1).
  - `StormMode = { kind: 'random' } | { kind: 'replay'; eventId }`. Replay schedules one SPE at `radiation.replay_onset_h` with strength `radiation.spe_multiplier_by_flare_class[C|M|X]`; the uSpe draw still happens so all other randomness is unchanged.
  - Replay warning starts `radiation.spe_warning_lead_h` before onset, like a random storm. Without this the warning would be on from hour 0 and a shelter rule would keep the crew hiding for 300 hours.
  - Flare class taken from DONKI SEP notifications ("associated with an <class> flare ... with ID <flrID>"), accepted only when that flare id is in the SEP event's `linkedEvents`; evidence id and URL stored per event. The script still tries `/DONKI/FLR` first.
  - New params (ASSUMPTION, low, TODO human): `radiation.replay_onset_h` = 300, `radiation.spe_multiplier_by_flare_class` = [10, 20, 40].
- **Consequences:** Contract additions in types.ts (StormMode, MissionOptions.stormMode, DonkiEvent, DonkiArchive, CampaignResult.stormMode, StormInfo) and index.ts (archive loaders). Random-mode golden file hash b2c0beb unchanged by the replay code (L10 AC4); new tests/golden/replay.json (AC5). Scenario code v2 now carries the storm mode instead of the dropped Calm/Stormy era.

---

### ADR-011: Step-by-step flow and the Ticket Wallet look

- **Date:** 2026-11-14
- **Status:** Accepted (team lead chose "step-by-step screens", "bright and playful", and the Jet-Age Ticket Wallet world on the impeccable decision page)
- **Context:** The team lead asked for pagination and a beautiful UI before continuing the sprint.
- **Decision:** The core loop is paged one step per coupon (Briefing, Build, Rules, Test, Review) with a route-arc step track and a sticky Back/Next pager whose Next is locked with a plain-words reason (over the weight limit; no test results). Learn and How it works sit outside the flow. Visual world: bright translation of the ticket wallet (sky ground, white coupons with perforation and notches, navy strips, rocket-red single primary action, carbon-violet numbers, yellow Done stamps). Display face is an installed condensed stack because remote fonts are banned (F10) and font licences are a human decision.
- **Consequences:** Screens no longer carry their own Back/Next buttons. Emoji glyphs replaced by an authored SVG icon set. Review leads with a boarding pass. Open human decision: self-host an OFL condensed grotesk so iPads and Chromebooks get the same display face.


---

### ADR-012: Comms link (L12, Spec B5.10)

- **Date:** 2026-11-14
- **Status:** Accepted (autonomous P-PS sprint; B5.10 asks for an ADR and human approval, so the team lead should confirm the two new params)
- **Context:** The comms load used power but had no effect, so switching it off was free (defect under B10.8).
- **Decision:** `groundLinkUp` for tick t is whether comms is powered in step 4 of tick t; rules in tick t+1 read `speWarning = (SPE pending or active) AND groundLinkUp`. A storm that starts before any warning got through logs `warning_missed`. While the link is up, a failure's repair hours are cut by `comms.repair_assist_fraction` when the failure starts. The base starts with the link up. The cause chain gains `spe_start:unsheltered <- warning_missed <- load_off:comms | rule_fired:shed comms`, with concept "communication". New params (A3 additions): `comms.repair_assist_fraction` = 0.25 (ASSUMPTION, low, TODO human) and `comms.moon_one_way_delay_s` = 1.3 (DERIVED, display only). The earlier display params `comms.earth_moon_light_delay_s` and `comms.earth_mars_light_delay_min` stay (F1); the UI now reads the spec-named Moon param.
- **Consequences:** Golden files regenerated (missions.json and replay.json). Measured on the Sunny Ridge starter, random storms, 300 runs: radio on 94.3% survival, dose P95 34,241 µSv, 0 dose losses; radio always off 93.0% survival, dose P95 55,051 µSv, 6 dose losses.

---

### ADR-013: Junior Mode (L11)

- **Date:** 2026-11-14
- **Status:** Accepted (autonomous P-PS sprint)
- **Context:** B10.7 makes Junior Mode the default for ages 7-12, with Planner Mode for older players.
- **Decision:** `AppState.mode` ('junior' default, 'planner'), toggled in the header. Junior: three starter kits replace the example bases (Light 58 mu, 75 of 100 home; Balanced 98 mu, 94 of 100; Heavy 102 mu, 73 of 100, each measured with 300 runs and each giving something up), four adjustable items (panels, batteries, shield layers, greenhouse) with site, mast, recyclers and spares under "More options"; three ready-made rule switches instead of the free-form builder; Review shows "X out of every 100 crews came home" with a 100-icon grid, no decimals, a kind line naming the main trouble and "What would you change?", a "New challenge" button that replays the next archived storm, and three core meters (Power, Life support naming the weakest of air/water/food, Shield) in the replay, with charts under "More details". Science words from B9 open a tap-to-explain definition (native disclosure, never hover-only). Planner keeps every control, the rule editor, ranges and charts.
- **Consequences:** Example-base ids changed to light/balanced/heavy. Scenario-code decoding now also accepts standard base64 (+, /, =), which the new kit data exposed. Water "days left" on the Life support meter counts drinking water without recycling (the worst case), labelled as days left.
