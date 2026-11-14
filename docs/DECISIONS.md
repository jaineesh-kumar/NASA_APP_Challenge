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
