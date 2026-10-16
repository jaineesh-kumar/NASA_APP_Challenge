# AGENTS.md: Moonbase Margin Build Contract

> One file for both **Antigravity** and **Google AI Studio**. Version 1.0, 15 Oct 2026.
> Project: NASA Space Apps Challenge 2026, "Build a Junior Astronaut Mission Trainer".
> Status of this file: **authoritative**. If anything you remember, assume or were trained on conflicts with this file, this file wins.

---

## 0. How humans use this file (agents: skip to Part A)

| Tool | Where it goes | How to start |
|---|---|---|
| **Antigravity** | Save as `AGENTS.md` in the repo root and commit it. Antigravity reads project-root `AGENTS.md`; a `GEMINI.md` in the same folder has higher priority. If your version does not load it, copy the identical content to `GEMINI.md`. Set the terminal and review policy to the most cautious option (the one that asks before running commands). | Paste **Prompt P0** (Part D) into the agent chat, then send `START L0`. |
| **Google AI Studio** | Paste **Part A** into System instructions (or into the first message if your screen has no such field). Paste Parts B and C into the first message, or upload this file as context. AI Studio cannot run your terminal, so use **NO-SHELL MODE** (rule A9). | Paste **Prompt P0** plus the **P0-AIS add-on** (Part D), then send `START L0`. |

Human workflow in one line: **one level at a time, agent reports with evidence, human checks, human types `GATE PASSED L<n>`, only then the next level.**

Humans own these decisions. Agents must never decide them: balance numbers in `data/params.json`, final wording of science claims, which features to cut, art and font licenses, deployment, anything about the submission itself.

---

# PART A: OPERATING RULES (always loaded, keep this part in context)

## A1. Role

You are a careful, senior TypeScript engineer on a 3-4 person hackathon team. You build exactly what Parts B and C specify, in small verified steps, and you say "UNKNOWN" when you do not know. You are not creative about requirements. You are creative only inside the spec's freedom (naming of local variables, code structure inside a file).

## A2. Prime directives (in priority order)

1. **Do not invent.** No invented numbers, sources, URLs, library functions, file contents, test results or progress.
2. **One level at a time.** Work only on the current level. Never start the next level without `GATE PASSED L<n>`.
3. **Stay inside the file allowlist** of the current level (Part C).
4. **Evidence over claims.** "Done" means a check ran and you can show its output.
5. **Stop and ask** (rule A7) instead of guessing when anything is unclear.
6. **Small, reversible changes.** Prefer new files and small diffs. Never reformat unrelated code.

## A3. Allowed moves

- Read any file in the repo.
- Create or edit files **only** if listed in the current level's allowlist (Part C) or in B3 for that level.
- Run: `npm install` (only allowlisted packages, B2), `npm run dev|build|preview|typecheck|lint|format|test`, `git status|diff|log|add|commit|switch -c|tag`, `ls`, `cat`, `tree`, `node -v`, `npm -v`.
- Create a branch named `level/L<n>-<slug>` and commit with Conventional Commits (B4.6).
- Add a new param to `data/params.json` **only** when the spec needs a value that is missing, with `"confidence": "low"`, `"source": "ASSUMPTION"`, a `"note": "TODO(human): confirm"`, and list it in the level report.
- Ask questions using the format in A7.

## A4. Forbidden moves (hard stops)

| # | Forbidden | Why |
|---|---|---|
| F1 | Editing the `value`, `unit`, `source` or `confidence` of an existing param | Numbers are human-owned; balance is a human job |
| F2 | Adding any dependency not in B2 | Unknown packages cause hallucinated APIs and supply-chain risk |
| F3 | Editing a file outside the level allowlist | Prevents silent scope creep |
| F4 | Changing a frozen contract (`src/engine/types.ts` exports, `src/engine/index.ts` exports) after L1 without an ADR and human approval | UI and engine depend on it |
| F5 | Using `Math.random`, `Date.now`, `new Date()` or any other nondeterminism inside `src/engine/` | Breaks replay and tests |
| F6 | Using `any`, `@ts-ignore`, `@ts-expect-error` or `eslint-disable` | Hides defects; allowed only with an ADR |
| F7 | Deleting, skipping (`.skip`, `.only`) or weakening a test to make it pass | Fakes progress |
| F8 | Claiming a command passed without showing its real output | Hallucinated verification |
| F9 | Inventing citations, URLs, statistics, library functions or "recommended settings" | Hallucination |
| F10 | Network calls at runtime, analytics, trackers, remote fonts, remote images | Spec: static, private, offline-capable |
| F11 | `git push --force`, rewriting history, deleting branches, `sudo`, global installs, `curl \| sh`, `rm -rf` outside `dist/`, `node_modules/`, `coverage/` | Destructive |
| F12 | Skipping levels, merging levels, or adding features not in the spec | Scope control |
| F13 | Placeholder code such as `// ...rest unchanged`, `TODO implement`, `throw new Error('not implemented')` in a delivered level | Incomplete work presented as done |
| F14 | Writing UI copy that states science facts not present in `data/params.json` or `docs/SOURCES.md` | Validity is our main selling point |
| F15 | Storing anything except progress and settings in `localStorage` | Privacy |

## A5. Anti-hallucination protocol

1. **Ground every claim.** Name the file and section (`B5.4`) or paste tool output.
2. **Re-read before you write.** At the start of each task, re-open the relevant spec sections. Do not rely on memory of this file.
3. **Library APIs:** before using any API, open the installed type definitions under `node_modules/` (or the package README) and name the path you used. If it is not there, treat the API as UNKNOWN.
4. **Numbers:** read all domain numbers from `data/params.json` via `src/engine/params.ts`. No numeric literal for a domain quantity may appear in code. Allowed literals: 0, 1, 24, 100 (percent), array indices, test fixtures inside `tests/`.
5. **Sources:** you may cite only ids listed in `docs/SOURCES.md` (S01 to S11, ASSUMPTION, DERIVED). Never add a source yourself; propose it as a question.
6. **Ambiguity or contradiction in the spec:** stop and ask (A7). Never pick silently.
7. **Verification labels:** every deliverable in your report is tagged `VERIFIED` (command output shown) or `UNVERIFIED` (not run, with the exact command the human should run).
8. **No timelines or progress guesses.** Report only checklist items you can point to.
9. **Fail loudly in code:** invalid state throws a typed `EngineError` with a message. Never return silent defaults.
10. **When you finish, audit yourself:** list every fact, number or API you relied on and where it came from. If one has no origin, say so.

## A6. Required report after every level (copy this exact shape)

```
LEVEL REPORT: L<n> <name>
Branch / commit: <name> / <short hash>
Scope: <one sentence>
Files created: <list>
Files changed: <list>
Acceptance criteria:
  [x] AC1 <text>: VERIFIED <evidence: file/test name/output tail>
  [ ] AC2 <text>: UNVERIFIED <command the human should run>
Commands run (last 15 lines of output each): <paste>
Params added (confidence low, ASSUMPTION): <none | list>
Assumptions made: <must be "none"; otherwise stop and ask instead>
Deferred / not done: <list>
Open questions (ASK-HUMAN): <list>
Self-audit (A5.10): <facts/numbers/APIs used and their origin>
STATUS: WAITING FOR GATE PASSED L<n>
```

Also update `docs/STATUS.md` (current level, checklist, open questions) at the end of every level.

## A7. Stop-and-ask triggers and format

Stop and ask when: the spec is ambiguous or contradictory; a needed dependency is not in B2; a test still fails after **2** fix attempts; a frozen contract must change; a file outside the allowlist must change; a needed number is missing from params; a license, safety or privacy question appears; a command would delete or modify anything outside the repo.

Ask in this format and then stop:

```
ASK-HUMAN
Blocker: <one sentence>
Where: <file / spec section>
Option A: <what, consequence>
Option B: <what, consequence>
My recommendation: <A|B> because <reason>
I will not proceed until you answer.
```

## A8. Retry policy

At most **2** fix attempts per failing check. After the second failure, write a short root-cause note (what you tried, what the output says) and stop with ASK-HUMAN.

## A9. NO-SHELL MODE (Google AI Studio, or any chat without a terminal)

- You cannot run commands. Never say you ran one.
- Output **complete files** in this exact block format, one block per file, no omissions:

```
=== FILE: src/engine/rng.ts ===
<entire file content>
=== END FILE ===
```

- After the files, print a **COMMANDS FOR HUMAN** list (exact commands, in order, from the repo root).
- Mark every acceptance criterion `UNVERIFIED` until the human pastes real output back. Then re-evaluate using only the pasted output.
- Never output a partial file, a diff, or `// unchanged` placeholders.

---

# PART B: PROJECT SPEC (authoritative, read-only for agents)

## B1. Product snapshot

- **Name (working):** Moonbase Margin. A static browser game for ages 10-16.
- **Core loop:** Design, Rules, Rehearse, Review.
  1. **Design:** pick a site, spend a launch-mass budget.
  2. **Rules:** set a load-priority ladder and up to 5 IF-THEN rules.
  3. **Rehearse:** run a Monte Carlo campaign of N seeded 30-day missions (default 300).
  4. **Review:** survival and success probabilities with 95% Wilson intervals, margins, top failure causes, a replay with a cause chain, and a mass-vs-risk chart.
- **Scenario:** lunar south pole outpost, crew of 4, 30 days = 720 hourly ticks.
- **Out of scope for v0.1 (do not build):** accounts, backend, multiplayer, 3D, live AI chat, EVA radiation exposure, crew fatigue or morale, thermal swings beyond the dark-window multiplier, communications windows, Mars.

## B2. Tech stack and dependency allowlist

- Node: the installed LTS; record it in `.nvmrc` and `package.json` `engines`.
- Language: TypeScript with `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`.
- Install with `npm install --save-exact`. Commit `package-lock.json`.

| Group | Allowed packages (nothing else) |
|---|---|
| Runtime | `react`, `react-dom` |
| Build | `vite`, `@vitejs/plugin-react`, `typescript` |
| Test | `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom` |
| Quality | `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `prettier` |
| Types | `@types/react`, `@types/react-dom` |

No router, no state library, no charting library, no CSS framework, no UUID, no date library. Charts are hand-written SVG. State uses `useReducer` plus Context. Any other package requires ASK-HUMAN.

## B3. Repository structure (create exactly this; empty files carry a one-line header comment)

```
moonbase-margin/
├── AGENTS.md                      # this file (also copy to GEMINI.md if needed)
├── README.md                      # setup, run, test, deploy, limits
├── CHANGELOG.md                   # Keep a Changelog format
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── .prettierrc
├── .editorconfig
├── .gitignore
├── .nvmrc
├── .github/workflows/ci.yml       # typecheck, lint, test, build
├── index.html
├── data/
│   └── params.json                # single source of truth for every number (B6)
├── docs/
│   ├── ARCHITECTURE.md            # block diagram + data flow
│   ├── MODEL_CARD.md              # generated from params + simplifications
│   ├── SOURCES.md                 # source ids S01..S11, ASSUMPTION, DERIVED
│   ├── DECISIONS.md               # ADR log (one entry per decision)
│   ├── STATUS.md                  # agent-maintained progress file
│   └── PLAYTEST.md                # human-maintained playtest notes
├── src/
│   ├── engine/                    # pure TypeScript, no React, no DOM, no I/O
│   │   ├── types.ts               # FROZEN after L1
│   │   ├── params.ts              # load + validate params.json
│   │   ├── rng.ts                 # mulberry32
│   │   ├── schedule.ts            # dark windows, jitter, mast effect
│   │   ├── power.ts               # generation, dust, allocation, battery
│   │   ├── lifeSupport.ts         # oxygen, CO2, water, electrolysis, Sabatier
│   │   ├── food.ts                # stored food + greenhouse
│   │   ├── crew.ts                # crew-hour allocation, repairs, construction
│   │   ├── radiation.ts           # dose, shielding, solar particle events
│   │   ├── events.ts              # seeded random events and failures
│   │   ├── rules.ts               # priority ladder + IF-THEN interpreter
│   │   ├── mass.ts                # mass cost and budget check
│   │   ├── sim.ts                 # runMission(design, rules, seed)
│   │   ├── montecarlo.ts          # runCampaign, wilson, percentile
│   │   ├── review.ts              # cause chain and concept hint
│   │   └── index.ts               # public API, FROZEN after L1
│   ├── worker/
│   │   └── campaign.worker.ts     # runs runCampaign off the main thread
│   ├── state/
│   │   ├── store.tsx              # reducer + Context
│   │   └── scenarioCode.ts        # encode/decode design+rules for the URL
│   ├── ui/
│   │   ├── components/            # small reusable pieces (one component per file)
│   │   ├── screens/               # Briefing, Design, Rules, Rehearse, Review, Learn, ModelCard
│   │   └── styles/                # tokens.css, base.css
│   ├── content/                   # all user-facing text, typed
│   │   ├── copy.ts
│   │   ├── concepts.ts
│   │   ├── missions.ts
│   │   └── quiz.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── engine/                    # one test file per engine module
│   ├── golden/                    # golden JSON for fixed seeds
│   └── ui/
└── public/                        # static assets (license noted in docs/SOURCES.md or README)
```

Naming: `camelCase` for files in `engine/`, `PascalCase.tsx` for components, `kebab-case` for docs. One exported concept per file where practical. No default exports in `engine/`.

## B4. Engineering standards

- **B4.1 Purity:** `src/engine/` has no imports from `react`, `src/ui`, `src/state`, or browser globals. Functions are pure: same inputs, same output.
- **B4.2 Immutability:** engine state is updated by returning new objects, or by mutating only a private local state object created inside `runMission` and never exposed.
- **B4.3 Errors:** throw `EngineError` (defined in `types.ts`) with a code and message. Never `catch` and ignore.
- **B4.4 Naming:** units in names (`batteryKwh`, `o2TankKg`, `doseUsv`). Booleans start with `is`, `has`, `can`.
- **B4.5 Tests:** Vitest. Every engine module has a test file. Every acceptance criterion in Part C maps to at least one named test. Tests must be deterministic.
- **B4.6 Git:** branch `level/L<n>-<slug>`; Conventional Commits (`feat(engine): ...`, `test(engine): ...`, `docs: ...`, `chore: ...`, `fix(ui): ...`); one logical change per commit; tag `L<n>-done` after `GATE PASSED`.
- **B4.7 Formatting:** Prettier and ESLint must pass with zero warnings. Do not reformat files you did not change.
- **B4.8 Comments:** explain why, not what. Every engine function that implements a spec formula carries a comment `// Spec B5.<n>`.
- **B4.9 Accessibility:** every interactive control is keyboard reachable with a visible focus ring and an accessible name; color is never the only signal; contrast at least 4.5:1 for text.
- **B4.10 Content:** UI text lives in `src/content/`, never inline in components. Reading level about grade 6. No fact in copy that is not backed by `params.json` or `SOURCES.md`.
- **B4.11 Performance budget:** log the time of a 300-run campaign in the level report. Do not promise a number; report the measured one.
- **B4.12 ADRs:** any deviation, new assumption or contract change gets an entry in `docs/DECISIONS.md` (context, decision, consequences) and needs human approval.

## B5. Simulation spec (authoritative)

### B5.1 Units and time
Tick = 1 hour. Mission = `mission.hours` ticks (720). Mass in kg, energy in kWh, power in kW, dose in µSv, food in kcal, game mass in "mu". All domain numbers come from `data/params.json` (B6).

### B5.2 Types (create exactly these names in `src/engine/types.ts`)

```ts
export type SiteId = 'ridge' | 'crater_edge';
export type LoadId = 'life_support' | 'thermal' | 'comms' | 'greenhouse' | 'science' | 'construction';
export type ComponentId = 'co2_scrubber' | 'o2_generator' | 'water_processor' | 'power_array';
export type FailureCause = 'oxygen' | 'co2' | 'water' | 'food' | 'dose';

export interface Design {
  site: SiteId;
  panels: number;                 // integer 1..8
  mastLevel: 0 | 1 | 2 | 3;
  batteries: number;              // integer 1..12
  waterLoopTier: 0 | 1;           // 0 base recovery, 1 brine-processor upgrade
  o2LoopTier: 0 | 1;              // 0 none, 1 Sabatier
  greenhouseModules: 0 | 1 | 2 | 3;
  shieldingLayers: 0 | 1 | 2 | 3;
  spares: Record<ComponentId, 0 | 1 | 2>;
}

export type Condition =
  | { kind: 'battery_below_pct'; value: number }
  | { kind: 'spe_warning' }
  | { kind: 'o2_days_below'; value: number }
  | { kind: 'dark_window_within_h'; value: number }
  | { kind: 'component_failed' };

export type Action =
  | { kind: 'shed'; load: LoadId }
  | { kind: 'shelter' }
  | { kind: 'repair_first' }
  | { kind: 'greenhouse_low_power' }
  | { kind: 'pause_science' };

export interface IfThenRule { condition: Condition; action: Action }

export interface Rules {
  priority: LoadId[];             // permutation of all 6 LoadId; index 0 is shed last
  ifThen: IfThenRule[];           // length 0..5
}

export type LogType =
  | 'dark_window_start' | 'dark_window_end' | 'dust_start' | 'spe_warning' | 'spe_start' | 'spe_end'
  | 'component_failed' | 'component_repaired' | 'battery_empty' | 'load_off'
  | 'shield_layer_built' | 'rule_fired' | 'failure';

export interface LogEntry { t: number; type: LogType; detail: string }

export interface MissionResult {
  seed: number;
  survived: boolean;
  failureCause: FailureCause | null;
  failureHour: number | null;
  scienceMet: boolean;
  minBatteryPct: number;
  minO2Days: number;
  peakDoseUsv: number;
  log: LogEntry[];
}

export interface Interval { low: number; high: number }

export interface CampaignResult {
  runs: number;
  survivalRate: number;
  successRate: number;
  survivalCi: Interval;
  successCi: Interval;
  minBatteryPctP5: number;
  minO2DaysP5: number;
  doseUsvP95: number;
  causeCounts: Record<FailureCause | 'science_missed', number>;
  massUsed: number;
  worstSeed: number;
  rating: 'flight_ready' | 'needs_work';
}
```

Public API of `src/engine/index.ts` (frozen after L1): `loadParams`, `massUsed`, `isWithinBudget`, `runMission`, `runCampaign`, `buildCauseChain`, plus the types above.

### B5.3 Randomness
`mulberry32(seed)` returns a function giving floats in [0, 1). Implement it in `rng.ts` yourself (about 6 lines, standard algorithm). Every tick draws, in this fixed order and **always**, even if the result is unused: `uSpe`, `uDust`, then one draw per component in `ComponentId` order (`co2_scrubber`, `o2_generator`, `water_processor`, `power_array`). Dark-window jitter is drawn once before tick 0, one draw per window in site order. Fixed order keeps runs reproducible.

### B5.4 Per-tick order of operations (do not reorder)
**Step 0, initial state (before tick 0):** `crew = crew.size`; `batteryKwh = batteries * power.battery_kwh_per_unit` (full); `o2TankKg = start.o2_tank_kg`; `waterKg = site.<id>.start_water_kg`; `foodKcal = start.food_kcal`; `co2Kg = 0`; `doseUsv = 0`; `shieldBuilt = 0`; `shieldProgressH = 0`; `scienceHours = 0`; all four components ok; no active dust, SPE or pending SPE; all deficit counters 0; `minBatteryPct = 100`; `minO2Days` and `peakDoseUsv` start from their tick-0 values.

1. **Events:** apply scheduled events for hour `t`; make the seeded draws (B5.3) and start new events (B5.5).
2. **Rules:** evaluate `rules.ifThen` in order against the state at the end of the previous tick. Produce flags: `forcedOff` (set of loads), `shelter`, `repairFirst`, `ghLow`, `pauseScience`. Rules are re-evaluated every tick (no latching).
3. **Generation:** `genKw = panels * power.panel_kw * sun * dustFactor * arrayFactor`.
   - `sun` = 0 inside a dark window, else 1.
   - `dustFactor` = `power.dust_factor` while a dust event is active, else 1.
   - `arrayFactor` = `power.array_failure_factor` while `power_array` is failed, else 1.
4. **Power allocation:** `availableKw = genKw + batteryKwh` (1-hour tick). Walk `rules.priority` from index 0 to 5. A load is powered if its demand is at most the remaining power, otherwise off (all or nothing). Then `supplied` = sum of powered demands. If `genKw >= supplied`: `batteryKwh = min(capacity, batteryKwh + (genKw - supplied) * power.charge_efficiency)`; else `batteryKwh -= (supplied - genKw)`.
   - **Demands (kW):** `life_support = load.life_support_kw`; `thermal = load.thermal_kw * (inDarkWindow ? power.thermal_dark_multiplier : 1)`; `comms = load.comms_kw`; `greenhouse = modules * load.greenhouse_kw_per_module * (ghLow ? greenhouse.low_power_factor : 1)`; `science = load.science_kw` (0 if paused or sheltering); `construction = load.construction_kw` (0 if all designed layers are built or sheltering). Forced-off loads demand 0.
   - Battery capacity = `batteries * power.battery_kwh_per_unit`.
5. **Life support** (only if `life_support` is powered; otherwise treat all three components as not running):
   - `o2Need = crew * crew.o2_kg_per_day / 24`; `co2Prod = crew * crew.co2_kg_per_day / 24`; `waterGross = crew * crew.water_total_kg_per_day / 24`.
   - **Oxygen:** if `o2_generator` ok and `waterKg > 0`: `o2Out = min(o2Need * o2.generator_capacity_factor, o2Need + (start.o2_tank_kg - o2TankKg))`, `o2TankKg += o2Out - o2Need`, `waterKg -= o2Out * o2.electrolysis_water_per_o2`. Else `o2TankKg -= o2Need` (floor 0; if the tank cannot cover the need, count an oxygen-deficit hour).
   - **Water recovery:** `rec = waterLoopTier == 1 ? water.recovery_upgraded : water.recovery_base`, and `rec = 0` if `water_processor` is failed or life support is unpowered. `waterKg -= waterGross * (1 - rec)`.
   - **Sabatier return:** if `o2LoopTier == 1` and `co2_scrubber` ok and life support powered: `waterKg += o2.sabatier_recovery * o2Need * o2.electrolysis_water_per_o2`.
   - **CO2:** `co2Kg += co2Prod`; if `co2_scrubber` ok and powered: `co2Kg -= min(co2Kg, co2Prod * co2.scrubber_capacity_factor)`.
   - Floor `waterKg` at 0 (count a water-deficit hour when it hits 0).
6. **Crew hours:** `pool = crew * crew.productive_hours_per_day / 24`; `pool = 0` if sheltering.
   - Default allocation order: `greenhouse`, `science`, `construction`, `repairs`. If `repairFirst`, order is `repairs`, `greenhouse`, `science`, `construction`. `pauseScience` removes `science`.
   - Needs per tick: greenhouse `modules * greenhouse.crew_hours_per_module_per_tick` (only if the greenhouse load is powered); science up to `science.max_hours_per_tick` (only if powered); construction up to the remaining hours of the next layer (only if powered and layers remain); repairs up to the sum of remaining repair hours of failed components that have a finite remaining time (components in `ComponentId` order).
   - Allocate in order until the pool is empty. Science hours accumulate in `scienceHours`. Construction hours accumulate toward `construction.hours_per_shield_layer`; when reached, `shieldBuilt += 1` (never above `design.shieldingLayers`) and log `shield_layer_built`.
7. **Food:** `needKcal = crew * crew.food_kcal_per_day / 24`. If the greenhouse is powered and `waterKg > 0`: `ghKcal = modules * greenhouse.kcal_per_module_per_day / 24 * powerFactor * crewFactor`, where `powerFactor` is 1 (or `greenhouse.low_power_factor` when `ghLow`) and `crewFactor = allocatedHours / neededHours` (1 if needed is 0). Greenhouse water use: `waterKg -= modules * greenhouse.water_kg_per_module_per_day / 24` when powered. `foodKcal += ghKcal - needKcal`; if `foodKcal < 0`, set it to 0 and count a food-shortfall hour.
8. **Radiation:** `baseUsvPerH = radiation.surface_usv_per_day / 24`. `mult` = `radiation.spe_multiplier` during an active solar particle event, else 1. `factor = radiation.shield_factor_by_layers[shieldBuilt] * (sheltering ? radiation.shelter_factor : 1)`. `doseUsv += baseUsvPerH * mult * factor`. All crew share the same dose in v0.1.
9. **Checks and log:** evaluate B5.6 loss conditions; update `minBatteryPct` (`batteryKwh / capacity * 100`), `minO2Days` (`o2TankKg / (crew * crew.o2_kg_per_day)`), `peakDoseUsv`; append log entries for state changes (never per-tick spam).

### B5.5 Events
- **Dark windows:** from `site.<id>.dark_starts_h` and `site.<id>.dark_length_h`. Each start is shifted by an integer jitter in `[-site.dark_jitter_h, +site.dark_jitter_h]` (clamped so the window stays inside `[0, mission.hours)`). Each window length is `floor(length * (1 - power.mast_dark_reduction_per_level * mastLevel))`.
- **Solar particle event (SPE):** if none is pending or active and `uSpe < radiation.spe_per_month / mission.hours`, schedule onset at `t + radiation.spe_warning_lead_h`, lasting `radiation.spe_duration_h`. `spe_warning` is true from the draw until the event ends.
- **Dust:** if `uDust < power.dust_events_per_month / mission.hours`, set the dust timer to `power.dust_duration_h` (refresh, no stacking).
- **Component failure:** for each component that is ok, if its draw `< 1 / failure.mtbf_h.<id>`, it fails. If `spares[id] > 0`, consume one spare and set remaining repair hours to `repair.hours.<id>`; otherwise the failure is permanent (remaining = Infinity). When remaining reaches 0 the component is ok again (log `component_repaired`).

### B5.6 Loss conditions (first one hit ends the mission as not survived)
| Cause | Condition |
|---|---|
| `oxygen` | oxygen-deficit hours in a row reach `loss.o2_deficit_hours` |
| `co2` | cabin CO2 above `co2.cabin_limit_kg` for `loss.co2_over_hours` hours in a row |
| `water` | water at 0 for `loss.water_deficit_hours` hours in a row |
| `food` | food shortfall for `loss.food_shortfall_hours` hours in a row |
| `dose` | `doseUsv > radiation.dose_limit_usv_mission` |

`scienceMet = scienceHours >= science.target_hours`. Mission success = survived and `scienceMet`.

### B5.7 Campaign and statistics
- `runCampaign(design, rules, n = campaign.runs)` runs seeds `1..n` through `runMission` and aggregates.
- **Wilson 95% interval** (z = 1.96): `centre = (p + z^2/(2n)) / (1 + z^2/n)`; `half = z * sqrt(p(1-p)/n + z^2/(4 n^2)) / (1 + z^2/n)`; interval = `centre ± half`, clamped to [0, 1]. Check value: p = 0.5, n = 300 gives half-width about 0.0562.
- **Percentile:** nearest-rank method: sort ascending, index `ceil(q * n) - 1`.
- `causeCounts` counts `failureCause` among failed runs, and `science_missed` among survivors with `scienceMet == false`.
- `worstSeed`: the failed run with the earliest `failureHour` (ties: lowest seed); if none failed, the seed with the lowest `minBatteryPct`.
- `rating = 'flight_ready'` if `survivalRate >= rating.flight_ready_survival` and `successRate >= rating.flight_ready_success`, else `'needs_work'`.
- `massUsed` from `mass.ts` (B5.8). The mass-vs-risk point is `(massUsed, 1 - survivalRate)`.

### B5.8 Mass
`massUsed = panels*mass.panel + mastLevel*mass.mast_level + batteries*mass.battery + waterLoopTier*mass.water_tier1 + o2LoopTier*mass.o2_tier1 + greenhouseModules*mass.greenhouse_module + shieldingLayers*mass.shield_layer + (sum of spares)*mass.spare`. A design is valid only if `massUsed <= mass.budget`.

### B5.9 Cause chain and concept hint (`review.ts`)
Build the chain from the worst run's log by following this fixed table. Each cause lists the log patterns that may explain it, in priority order. Walk from the failure back through at most 5 linked entries; never invent a link that is not in the log.

| Effect | Possible causes (search the log) |
|---|---|
| `failure:oxygen` | `component_failed:o2_generator`, `load_off:life_support`, water at zero |
| `failure:co2` | `component_failed:co2_scrubber`, `load_off:life_support` |
| `failure:water` | `component_failed:water_processor`, `load_off:life_support` |
| `failure:food` | `load_off:greenhouse`, `component_failed:water_processor` |
| `failure:dose` | `spe_start` without shelter, too few `shield_layer_built` |
| `load_off:life_support` | `battery_empty`, `rule_fired:shed life_support`, `component_failed:power_array` |
| `battery_empty` | `dark_window_start`, `dust_start`, `component_failed:power_array` |

Concept hint by effect: oxygen, co2, water: **single point of failure** or **redundancy**; `battery_empty`: **margin**; water: **loop closure**; dose: **trade-off**.

## B6. `data/params.json` (create exactly this in L1; it is human-owned afterwards)

Schema per entry: `{ "value": <number | number[]>, "unit": "<string>", "source": "S01..S11 | ASSUMPTION | DERIVED", "confidence": "high | medium | low", "note": "<string>" }`. The loader must reject unknown fields, missing ids, wrong types, an unknown `source`, and an unknown `confidence`.

```json
{
  "version": "0.1.0",
  "params": {
    "mission.hours": { "value": 720, "unit": "h", "source": "ASSUMPTION", "confidence": "high", "note": "30-day mission design choice" },
    "campaign.runs": { "value": 300, "unit": "runs", "source": "ASSUMPTION", "confidence": "high", "note": "default Monte Carlo size" },
    "crew.size": { "value": 4, "unit": "crew", "source": "ASSUMPTION", "confidence": "high", "note": "design choice" },
    "crew.o2_kg_per_day": { "value": 0.84, "unit": "kg/crew/day", "source": "S10", "confidence": "medium", "note": "TODO(human): verify in S01 BVAD" },
    "crew.co2_kg_per_day": { "value": 1.0, "unit": "kg/crew/day", "source": "S10", "confidence": "medium", "note": "TODO(human): verify in S01 BVAD" },
    "crew.water_total_kg_per_day": { "value": 4.35, "unit": "kg/crew/day", "source": "S08", "confidence": "high", "note": "BVAD value quoted by S08; verify in S01" },
    "crew.food_kcal_per_day": { "value": 2500, "unit": "kcal/crew/day", "source": "S10", "confidence": "medium", "note": "TODO(human): verify" },
    "crew.food_kg_per_day": { "value": 0.6, "unit": "kg/crew/day", "source": "S10", "confidence": "medium", "note": "display only, not used by the engine" },
    "crew.productive_hours_per_day": { "value": 8, "unit": "h/crew/day", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "water.recovery_base": { "value": 0.9, "unit": "fraction", "source": "S04", "confidence": "high", "note": "ISS water recovery, older hardware" },
    "water.recovery_upgraded": { "value": 0.98, "unit": "fraction", "source": "S04", "confidence": "high", "note": "ISS with brine processor" },
    "o2.sabatier_recovery": { "value": 0.5, "unit": "fraction", "source": "S05", "confidence": "high", "note": "ceiling of Sabatier oxygen recovery" },
    "o2.electrolysis_water_per_o2": { "value": 1.125, "unit": "kg water/kg O2", "source": "DERIVED", "confidence": "high", "note": "2 H2O to 2 H2 + O2: 36 g water per 32 g oxygen" },
    "o2.generator_capacity_factor": { "value": 1.5, "unit": "x need", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "co2.scrubber_capacity_factor": { "value": 1.5, "unit": "x production", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "co2.cabin_limit_kg": { "value": 2.0, "unit": "kg", "source": "ASSUMPTION", "confidence": "low", "note": "game limit, illustrative" },
    "loss.o2_deficit_hours": { "value": 3, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "game rule" },
    "loss.co2_over_hours": { "value": 6, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "game rule" },
    "loss.water_deficit_hours": { "value": 72, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "game rule" },
    "loss.food_shortfall_hours": { "value": 168, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "game rule" },
    "radiation.surface_usv_per_day": { "value": 1369, "unit": "uSv/day", "source": "S02", "confidence": "high", "note": "measured dose equivalent, far side, lunar day, suit-level proxy" },
    "radiation.iss_usv_per_day": { "value": 731, "unit": "uSv/day", "source": "S02", "confidence": "high", "note": "ISS reference over the same period; display only" },
    "radiation.shield_factor_by_layers": { "value": [1.0, 0.67, 0.5, 0.4], "unit": "factor", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative; non-increasing; index = layers built" },
    "radiation.shelter_factor": { "value": 0.25, "unit": "factor", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "radiation.spe_multiplier": { "value": 20, "unit": "x", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "radiation.spe_duration_h": { "value": 12, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "radiation.spe_warning_lead_h": { "value": 2, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "radiation.spe_per_month": { "value": 1.0, "unit": "events/30 d", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "radiation.dose_limit_usv_mission": { "value": 60000, "unit": "uSv", "source": "ASSUMPTION", "confidence": "low", "note": "game limit; TODO(human): verify against S11 NASA-STD-3001" },
    "power.panel_kw": { "value": 10, "unit": "kW/panel", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "power.battery_kwh_per_unit": { "value": 100, "unit": "kWh/unit", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "power.charge_efficiency": { "value": 0.9, "unit": "fraction", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "power.dust_events_per_month": { "value": 1.5, "unit": "events/30 d", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "power.dust_factor": { "value": 0.85, "unit": "factor", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "power.dust_duration_h": { "value": 72, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "power.array_failure_factor": { "value": 0.75, "unit": "factor", "source": "ASSUMPTION", "confidence": "low", "note": "one of four strings lost" },
    "power.mast_dark_reduction_per_level": { "value": 0.1, "unit": "fraction/level", "source": "S03", "confidence": "low", "note": "S03 shows height raises illumination (qualitative); the size is our assumption" },
    "power.thermal_dark_multiplier": { "value": 1.5, "unit": "x", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "load.life_support_kw": { "value": 5, "unit": "kW", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "load.thermal_kw": { "value": 4, "unit": "kW", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "load.comms_kw": { "value": 1, "unit": "kW", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "load.greenhouse_kw_per_module": { "value": 3, "unit": "kW/module", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "load.science_kw": { "value": 3, "unit": "kW", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "load.construction_kw": { "value": 3, "unit": "kW", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "site.ridge.dark_starts_h": { "value": [200, 560], "unit": "h", "source": "S09", "confidence": "medium", "note": "illustrative schedule matching the about 90% illumination band" },
    "site.ridge.dark_length_h": { "value": 36, "unit": "h", "source": "S09", "confidence": "medium", "note": "2 x 36 h = 10% of 720 h" },
    "site.ridge.start_water_kg": { "value": 600, "unit": "kg", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "site.crater_edge.dark_starts_h": { "value": [120, 330, 540], "unit": "h", "source": "S03", "confidence": "medium", "note": "illustrative schedule matching the about 70% illumination band" },
    "site.crater_edge.dark_length_h": { "value": 72, "unit": "h", "source": "S03", "confidence": "medium", "note": "3 x 72 h = 30% of 720 h" },
    "site.crater_edge.start_water_kg": { "value": 900, "unit": "kg", "source": "ASSUMPTION", "confidence": "low", "note": "closer to ice; illustrative" },
    "site.dark_jitter_h": { "value": 24, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "window start variation" },
    "start.o2_tank_kg": { "value": 130, "unit": "kg", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "start.food_kcal": { "value": 220000, "unit": "kcal", "source": "ASSUMPTION", "confidence": "low", "note": "about 22 days for 4 crew" },
    "greenhouse.kcal_per_module_per_day": { "value": 5000, "unit": "kcal/day", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "greenhouse.water_kg_per_module_per_day": { "value": 3, "unit": "kg/day", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "greenhouse.crew_hours_per_module_per_tick": { "value": 0.2, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "greenhouse.low_power_factor": { "value": 0.5, "unit": "factor", "source": "ASSUMPTION", "confidence": "low", "note": "power and yield both scaled" },
    "construction.hours_per_shield_layer": { "value": 40, "unit": "crew-h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "science.target_hours": { "value": 120, "unit": "crew-h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "science.max_hours_per_tick": { "value": 0.6, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "failure.mtbf_h.co2_scrubber": { "value": 900, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "failure.mtbf_h.o2_generator": { "value": 1100, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "failure.mtbf_h.water_processor": { "value": 800, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "failure.mtbf_h.power_array": { "value": 1500, "unit": "h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "repair.hours.co2_scrubber": { "value": 6, "unit": "crew-h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "repair.hours.o2_generator": { "value": 10, "unit": "crew-h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "repair.hours.water_processor": { "value": 12, "unit": "crew-h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "repair.hours.power_array": { "value": 8, "unit": "crew-h", "source": "ASSUMPTION", "confidence": "low", "note": "illustrative" },
    "mass.budget": { "value": 120, "unit": "mu", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "mass.panel": { "value": 5, "unit": "mu", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "mass.mast_level": { "value": 6, "unit": "mu/level", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "mass.battery": { "value": 5, "unit": "mu", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "mass.water_tier1": { "value": 8, "unit": "mu", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "mass.o2_tier1": { "value": 10, "unit": "mu", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "mass.greenhouse_module": { "value": 10, "unit": "mu", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "mass.shield_layer": { "value": 12, "unit": "mu", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "mass.spare": { "value": 3, "unit": "mu", "source": "ASSUMPTION", "confidence": "low", "note": "game unit" },
    "rating.flight_ready_survival": { "value": 0.95, "unit": "fraction", "source": "ASSUMPTION", "confidence": "low", "note": "game threshold, not a NASA requirement" },
    "rating.flight_ready_success": { "value": 0.8, "unit": "fraction", "source": "ASSUMPTION", "confidence": "low", "note": "game threshold, not a NASA requirement" }
  }
}
```

Balance note: every `low` value is a placeholder. The human tunes them after L5 using campaign output. Agents never tune.

## B7. Source registry (copy into `docs/SOURCES.md` at L0; agents may not add rows)

| Id | Source |
|---|---|
| S01 | Anderson, Ewert & Keener (2018). Life Support Baseline Values and Assumptions Document (BVAD), NASA/TP-2015-218570/REV1. https://ntrs.nasa.gov/citations/20180001338 |
| S02 | Zhang, S. et al. (2020). First measurements of the radiation dose on the lunar surface. Science Advances 6(39), eaaz1334. https://doi.org/10.1126/sciadv.aaz1334 |
| S03 | Ross, A. et al. (2021). Towers on the Peaks of Eternal Light: Quantifying the Available Solar Power. arXiv:2102.11766 |
| S04 | NASA. Environmental Control and Life Support System (ECLSS) fact sheet. https://www.nasa.gov/wp-content/uploads/2025/08/g-657270-59-hp-environmental-control-and-life-support-system-eclss.pdf |
| S05 | NASA. Sabatier Carbon Dioxide Reduction Assembly development. https://www.science.gov/topicpages/s/sabatier+carbon+dioxide |
| S06 | NASA (2011). Probabilistic Risk Assessment Procedures Guide, NASA/SP-2011-3421. https://ntrs.nasa.gov/citations/20120001369 |
| S07 | Clark, Tanner-Smith & Killingsworth (2016). Digital games, design, and learning. Review of Educational Research 86(1), 79-122. |
| S08 | Frontiers in Space Technologies (2024). Assessment of the physical and psychological aspects of the current life support system on the ISS. https://doi.org/10.3389/frspt.2024.1461389 |
| S09 | Wood, C. (2017). Peaks of "Eternal" Light. Sky & Telescope, June 2017. |
| S10 | ECLSS sizing reference (secondary source that cites NASA-STD-3001 and BVAD). https://skills.cat/skills/luncosim/space-engineering-skills/eclss-assessment. Use only until verified against S01. |
| S11 | NASA-STD-3001 (crew health standards). **Not yet read; any value attributed to it must be verified by a human.** |
| ASSUMPTION | A value chosen by the team for the game. Must be labeled "illustrative" on screen. |
| DERIVED | Derived from basic physics or chemistry stated in the param note. |

## B8. UI spec (screens)

| Screen | Must contain |
|---|---|
| Briefing | One-paragraph mission, "Start" button |
| Design | Site choice (2 cards), steppers for each Design field, live mass meter with the budget cap, disabled "+" when over budget |
| Rules | Reorderable priority ladder (up/down buttons, drag optional), up to 5 IF-THEN rows built from selects, delete and add buttons |
| Rehearse | "Run rehearsal" button, progress state, then results: survival % and success % with intervals, margin metrics, cause bars, rating badge, mass-vs-risk dots for all designs tried this session |
| Review | Timeline replay of the worst run (play/pause, scrub), cause chain, one concept hint |
| Learn | Guided missions M1 to M3, concept checks, pre/post quiz |
| Model Card | Table of every param with value, unit, source, confidence; list of simplifications |

Every number shown to the player has a "Why this number?" control opening its param entry (value, unit, source, confidence, note).

## B9. Content rules

- Reading level about grade 6, short sentences, active voice.
- Label every `ASSUMPTION` value "illustrative" wherever it is shown.
- Never write "NASA says" or "scientists found" unless the line is backed by a source id shown beside it.
- Quiz and mission texts drafted by an agent carry `needsReview: true` until a human clears it.

---

# PART C: LEVELS OF EXECUTION

**Rules for every level:** work on branch `level/L<n>-<slug>`; touch only the allowlist; satisfy every acceptance criterion (AC); run the verify commands; produce the A6 report; update `docs/STATUS.md`; stop and wait for `GATE PASSED L<n>`; the human then tags `L<n>-done`.

Time mapping against the 36-hour plan is a guide only: L0 T+0 to 1, L1 to T+3, L2 to T+6, L3 to T+9, L4 to T+13, L5 to T+18, L6 to T+22, L7 to T+27, L8 to T+31, L9 to T+33 (**feature freeze at T+33**). A second developer may start L6 after L1 using a stub of `runCampaign` that returns a fixed `CampaignResult`; the stub lives in `tests/ui/` and is never shipped.

**Cut order if time runs out (human decides):** 1) IF-THEN rules UI (keep the ladder), 2) missions M2 and M3, 3) mass-vs-risk chart, 4) pre/post quiz. Never cut: L0 to L5, Design screen, Rehearse results, Mission Review, Model Card, deployed link.

## L0. Preflight and bootstrap
- **Goal:** a clean, empty, professional repo that builds and tests.
- **Read first:** A3, A4, B2, B3, B4.
- **Allowlist:** all root config files, `.github/`, `docs/` skeletons, `index.html`, `src/main.tsx`, `src/App.tsx` (placeholder only), `tests/engine/smoke.test.ts`, folder skeleton with header-comment files.
- **Tasks:**
  1. Create the folder tree exactly as B3.
  2. Configure TypeScript strict, Vite, Vitest (jsdom), ESLint, Prettier, `.editorconfig`, `.gitignore`, `.nvmrc`.
  3. `package.json` scripts: `dev`, `build`, `preview`, `typecheck`, `lint`, `format`, `format:check`, `test`.
  4. `.github/workflows/ci.yml` running typecheck, lint, test, build.
  5. Fill `docs/SOURCES.md` with the B7 table; create `docs/STATUS.md`, `DECISIONS.md` (empty ADR template), `README.md` skeleton, `CHANGELOG.md`.
  6. One smoke test that asserts `1 + 1 === 2`.
- **AC:** AC1 tree matches B3; AC2 `npm run typecheck`, `lint`, `test`, `build` all exit 0; AC3 only allowlisted packages in `package.json`; AC4 no engine or UI features exist yet.
- **Verify:** `npm run typecheck && npm run lint && npm run test && npm run build`
- **Commit:** `chore: bootstrap repository`

## L1. Contracts, params, RNG, mass
- **Goal:** frozen types and validated data.
- **Read first:** B5.2, B5.3, B5.8, B6, B7.
- **Allowlist:** `src/engine/types.ts`, `params.ts`, `rng.ts`, `mass.ts`, `index.ts`, `data/params.json`, `tests/engine/{params,rng,mass}.test.ts`, `docs/DECISIONS.md`, `docs/STATUS.md`.
- **Tasks:** types exactly as B5.2; `params.json` exactly as B6; `loadParams()` with validation (B6 rules) and typed getters; `mulberry32`; `massUsed` and `isWithinBudget`; export the public API.
- **AC:** AC1 types match B5.2 names and shapes; AC2 `loadParams` throws `EngineError` for a missing id, unknown field, wrong type, unknown `source`, unknown `confidence`; AC3 the same seed yields the identical first 1000 values and all values are in [0, 1); AC4 different seeds differ; AC5 `massUsed` of a documented design equals the hand-computed value in the test; AC6 over-budget design returns false; AC7 no numeric literal for a domain quantity in code (A5.4).
- **Verify:** `npm run typecheck && npm run lint && npm run test`
- **Freeze:** after the gate, `types.ts` and `index.ts` exports are frozen (F4).
- **Commit:** `feat(engine): contracts, params loader, rng, mass`

## L2. Schedule and power
- **Goal:** dark windows, generation, dust, allocation, battery.
- **Read first:** B5.3, B5.4 steps 3-4, B5.5 (dark windows, dust).
- **Allowlist:** `src/engine/schedule.ts`, `power.ts`, `tests/engine/{schedule,power}.test.ts`, `docs/STATUS.md`.
- **AC:** AC1 ridge windows total 10% and crater-edge 30% of mission hours before jitter; AC2 jittered windows stay inside the mission and are reproducible per seed; AC3 higher `mastLevel` never lengthens a window; AC4 battery stays within [0, capacity] over 720 ticks in a stress test; AC5 `supplied <= genKw + batteryKwh` always; AC6 priority ladder: with shortage, lower-priority loads turn off first (explicit test); AC7 all-or-nothing allocation test; AC8 determinism test.
- **Verify:** `npm run typecheck && npm run lint && npm run test`
- **Commit:** `feat(engine): schedule and power`

## L3. Life support, water, oxygen, CO2
- **Goal:** the air and water loops.
- **Read first:** B5.4 step 5, B6 (o2, co2, water, loss).
- **Allowlist:** `src/engine/lifeSupport.ts`, `tests/engine/lifeSupport.test.ts`, `docs/STATUS.md`.
- **AC:** AC1 water mass balance: over a run, change in water equals modeled draws minus returns within 1e-9; AC2 oxygen balance: tank change equals output minus need; AC3 with the scrubber off, cabin CO2 rises by `co2Prod` per tick; AC4 `waterLoopTier 1` never uses more water than tier 0 under identical conditions; AC5 `o2LoopTier 1` never uses more water than tier 0; AC6 unpowered life support stops all three components; AC7 deficit counters reset when the condition clears.
- **Verify:** `npm run typecheck && npm run lint && npm run test`
- **Commit:** `feat(engine): life support`

## L4. Food, crew time, radiation, events and failures
- **Goal:** the remaining systems.
- **Read first:** B5.3, B5.4 steps 1, 6-8, B5.5, B5.6.
- **Allowlist:** `src/engine/food.ts`, `crew.ts`, `radiation.ts`, `events.ts`, matching tests, `docs/STATUS.md`.
- **AC:** AC1 dose never decreases; AC2 more built shielding never raises dose (fixed seed); AC3 sheltering never raises dose; AC4 crew hours allocated never exceed the pool in any tick; AC5 `repairFirst` changes allocation order as specified; AC6 a spare never reduces repair success versus no spare under the same seed; AC7 the RNG draw order is fixed (snapshot test of the first 50 draws for seed 1); AC8 an SPE warning precedes onset by exactly `spe_warning_lead_h`; AC9 food stock never negative.
- **Verify:** `npm run typecheck && npm run lint && npm run test`
- **Commit:** `feat(engine): food, crew, radiation, events`

## L5. Rules, mission loop, Monte Carlo, worker
- **Goal:** a complete, deterministic simulation and campaign.
- **Read first:** B5.4 (whole), B5.6, B5.7, B5.9, A5.
- **Allowlist:** `src/engine/rules.ts`, `sim.ts`, `montecarlo.ts`, `review.ts`, `src/worker/campaign.worker.ts`, matching tests, `tests/golden/`, `docs/STATUS.md`, `docs/ARCHITECTURE.md`.
- **AC:** AC1 `runMission` with the same inputs returns a deep-equal result; AC2 golden files for seeds 1, 2 and 3 on two named reference designs exist and match; AC3 every rule condition and action has a unit test; AC4 up to 5 rules enforced, a 6th throws `EngineError`; AC5 `wilson(0.5, 300)` half-width is within 0.0005 of 0.0562; `wilson` clamps to [0, 1]; AC6 nearest-rank percentile tests; AC7 `causeCounts` sums are consistent with run results; AC8 `worstSeed` follows B5.7; AC9 the worker returns a result equal to calling `runCampaign` directly; AC10 the measured time of a 300-run campaign is printed in the report (no promise); AC11 `buildCauseChain` only returns links present in the log (property test with a fabricated log).
- **Verify:** `npm run typecheck && npm run lint && npm run test && npm run build`
- **Commit:** `feat(engine): mission loop, campaign, worker, review`
- **Human step after the gate:** run a few designs, tune `params.json` by hand (agents may not), record changes in `docs/DECISIONS.md`.

## L6. UI foundation, Design screen, Rules screen
- **Goal:** the player can configure a valid outpost and rules.
- **Read first:** B2, B4.9, B4.10, B8 (Briefing, Design, Rules).
- **Allowlist:** `src/App.tsx`, `src/state/store.tsx`, `src/ui/**`, `src/content/copy.ts`, `tests/ui/**`, `docs/STATUS.md`.
- **AC:** AC1 reducer unit tests for every action; AC2 the mass cap is enforced (cannot exceed budget); AC3 the ladder is always a valid permutation; AC4 at most 5 IF-THEN rows; AC5 all controls keyboard-operable with visible focus and accessible names (checked with Testing Library queries by role/name); AC6 no inline user-facing strings outside `src/content/`; AC7 no network requests.
- **Verify:** `npm run typecheck && npm run lint && npm run test && npm run build`
- **Commit:** `feat(ui): app shell, design and rules screens`

## L7. Rehearse and Review screens
- **Goal:** run the campaign and understand the result.
- **Read first:** B5.7, B5.9, B8 (Rehearse, Review).
- **Allowlist:** `src/ui/screens/{Rehearse,Review}.tsx`, `src/ui/components/**`, `src/content/{copy,concepts}.ts`, `tests/ui/**`, `docs/STATUS.md`.
- **AC:** AC1 the campaign runs in the worker and the UI stays responsive (progress state shown); AC2 results show survival and success with intervals, margins, cause bars, rating badge; AC3 the mass-vs-risk chart plots every design tried this session (hand-written SVG); AC4 Review replays the worst run with play, pause, scrub; AC5 the cause chain and hint come only from `buildCauseChain`; AC6 every number has a working "Why this number?" control; AC7 renders correctly from a fixture `CampaignResult` in tests.
- **Verify:** `npm run typecheck && npm run lint && npm run test && npm run build`
- **Commit:** `feat(ui): rehearse and review screens`

## L8. Learn, Model Card, scenario codes
- **Goal:** teaching content, transparency, shareability.
- **Read first:** B8 (Learn, Model Card), B9.
- **Allowlist:** `src/ui/screens/{Learn,ModelCard}.tsx`, `src/state/scenarioCode.ts`, `src/content/{missions,quiz,concepts,copy}.ts`, `docs/MODEL_CARD.md`, `tests/**`, `docs/STATUS.md`.
- **AC:** AC1 missions M1 to M3 are presets of `Design` and `Rules` with one concept check each; AC2 a 6-question pre/post quiz works and stores scores in memory only (or `localStorage` progress, F15); AC3 the Model Card lists every param with value, unit, source, confidence, plus a "what we simplified" list taken from B1 out-of-scope; AC4 scenario codes round-trip (encode then decode equals the original) and reject corrupt or oversized input with a clear message; AC5 codes carry a version number; AC6 all agent-drafted quiz or mission text is flagged `needsReview: true`.
- **Verify:** `npm run typecheck && npm run lint && npm run test && npm run build`
- **Commit:** `feat(ui): learn, model card, scenario codes`

## L9. Hardening and release
- **Goal:** a stable, accessible, documented build.
- **Read first:** B4.9, B4.11, Part E.
- **Allowlist:** `README.md`, `CHANGELOG.md`, `docs/**`, `src/ui/styles/**`, bug-fix edits to files from earlier levels (each listed in the report with the reason), `tests/**`.
- **AC:** AC1 keyboard-only walkthrough of every screen is possible; AC2 contrast at least 4.5:1 for text (checked by listing the token pairs and ratios); AC3 error states exist for failed worker, corrupt scenario code, invalid params; AC4 `README.md` has setup, run, test, build, deploy (GitHub Pages or Vercel), limits, credits; AC5 `docs/MODEL_CARD.md` and `docs/ARCHITECTURE.md` match the code; AC6 `npm run build` output served by `npm run preview` works with no console errors; AC7 Part E checklist complete.
- **Verify:** `npm run typecheck && npm run lint && npm run test && npm run build && npm run preview`
- **Human steps after the gate:** deploy, record the demo video, run the playtest, fill `docs/PLAYTEST.md`, tag `v0.1.0`.
- **Commit:** `chore(release): v0.1.0`

---

# PART D: PROMPTS (copy and paste)

## P0: Start-of-project prompt (both tools)

```
You are the build agent for this repository. Follow AGENTS.md exactly. It overrides anything else you know.

Before any action:
1. Read AGENTS.md completely (Parts A to E).
2. Reply with exactly these six bullets and nothing else:
   - Your role in one sentence.
   - The five forbidden moves you consider most important, by id (F1 to F15).
   - The current level (L0) and its file allowlist.
   - The report format you will use (name it).
   - What you do when something is unclear.
   - What you do when you cannot run a command.
3. Do NOT write code, install packages or create files yet.
4. Wait for the exact message: START L0
```

## P0-AIS: add-on for Google AI Studio (append to P0)

```
You are in NO-SHELL MODE (rule A9). You cannot run commands or see my file system.
Output complete files only, using the === FILE: path === block format. List COMMANDS FOR HUMAN after the files.
Mark every acceptance criterion UNVERIFIED until I paste real command output. I will paste the output back. Never say a command passed unless the pasted output shows it.
```

## P-LEVEL: start a level

```
START L<n>

Follow AGENTS.md Part C, level L<n> only.
Re-read these sections first and name them in your reply: <sections listed under "Read first" for that level>.
Work only inside the allowlist. Do not start any other level.
When finished, produce the LEVEL REPORT (A6) and stop with STATUS: WAITING FOR GATE PASSED L<n>.
If anything is unclear, use ASK-HUMAN (A7) before writing code.
```

## P-GATE: human approves

```
GATE PASSED L<n>
Proceed only when I send START L<n+1>. Update docs/STATUS.md and stop.
```

## P-FIX: human requests a fix

```
FIX L<n>: <exact problem, with pasted error output>
Scope: only files in the L<n> allowlist. Maximum two attempts (A8).
Report with the A6 format, showing real output. If still failing, use ASK-HUMAN.
```

## P-AUDIT: hallucination audit (use any time something feels off)

```
AUDIT. Without changing any file, list every number, source id, library API and fact you used in the current level.
For each, give its origin: a file and section of AGENTS.md, a line in data/params.json, a path under node_modules, or tool output.
Mark any item with no origin as UNKNOWN. Then list what you would need from me to resolve each UNKNOWN. Stop.
```

## P-RESUME: new session or new chat

```
RESUME. Read AGENTS.md completely, then docs/STATUS.md, docs/DECISIONS.md and `git log --oneline -20`.
Reply with: current level, last passed gate, open questions, and the next action you propose.
Do not change any file. Wait for my instruction.
```

## P-CUT: cut scope

```
CUT: <feature from the cut order>. Update docs/STATUS.md and docs/DECISIONS.md (ADR with context, decision, consequences). Remove only what the cut requires. Do not start new work. Stop.
```

## P-ANSWER: human answers an ASK-HUMAN

```
ANSWER to ASK-HUMAN: choose option <A|B>. <extra constraints if any>
Record the decision in docs/DECISIONS.md, then continue the current level.
```

---

# PART E: DEFINITION OF DONE AND RELEASE CHECKLIST

## E1. Level done (every level)
- [ ] All ACs verified with shown output (or explicitly UNVERIFIED with commands)
- [ ] `npm run typecheck`, `lint`, `test`, `build` pass
- [ ] No forbidden move used (F1 to F15)
- [ ] `docs/STATUS.md` updated; report posted in A6 format
- [ ] Human typed `GATE PASSED L<n>` and tagged `L<n>-done`

## E2. Project done (v0.1.0)
- [ ] All Must levels (L0 to L7) passed; L8 and L9 passed or cut by ADR
- [ ] Determinism: same seed, same result (golden tests pass)
- [ ] Every number visible to players traces to `params.json` and a source id
- [ ] Every `ASSUMPTION` value is labeled "illustrative" on screen
- [ ] No console errors in the production build; no network requests at runtime
- [ ] Keyboard-only walkthrough done; contrast checked
- [ ] README, MODEL_CARD, ARCHITECTURE, SOURCES, DECISIONS, CHANGELOG complete
- [ ] Open items for the human listed: verify S01 values, verify S11 dose limit, confirm event rules, confirm art and font licenses
- [ ] Deployed link works in a fresh browser; demo video recorded (human)

## E3. Change log of this file
| Version | Date | Change |
|---|---|---|
| 1.0 | 15 Oct 2026 | First release |
