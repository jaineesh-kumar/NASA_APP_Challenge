# Moonbase Margin: Architecture & Data Flow

> Specification Version: 0.1.0  
> System: Pure TypeScript Engine + React 19 UI + Web Worker Monte Carlo Pipeline

---

## 1. System Overview

Moonbase Margin separates the simulation engine completely from the UI layer to maintain strict determinism, testability, and replay fidelity:

1. **Engine Layer (`src/engine/`):** Pure functional TypeScript. Zero React or DOM dependencies. Zero runtime imports. All domain constants are loaded via `params.ts` from `data/params.json`. Uses standard 32-bit `mulberry32` PRNG for bit-for-bit replayability.
2. **Web Worker Layer (`src/worker/`):** Offloads multi-second 300-run Monte Carlo campaigns from the UI thread, broadcasting periodic progress messages to keep the user interface responsive.
3. **State Management (`src/state/`):** Built on React `useReducer` and Context (`AppStoreProvider`). Handles screen navigation, hardware selections, priority ladders, rule creation, and scenario code encode/decode.
4. **UI Screen & Component Layer (`src/ui/`):** Accessible (WCAG 2.1 AA 4.5:1 contrast, visible focus rings, keyboard navigable) screens for Briefing, Design, Rules, Rehearsal, Review, Learn, and Model Card.

---

## 2. Block Architecture & Module Diagram

```mermaid
graph TD
    subgraph Data Layer
        PJSON[data/params.json] --> PLOAD[src/engine/params.ts]
    end

    subgraph Simulation Engine [src/engine/ - Pure TypeScript]
        PLOAD --> SIM[sim.ts: runMission]
        RNG[rng.ts: mulberry32] --> SIM
        MASS[mass.ts: massUsed & isWithinBudget]
        SCHED[schedule.ts: dark windows & jitter] --> SIM
        POW[power.ts: generation, dust, battery] --> SIM
        LIFE[lifeSupport.ts: O2, CO2, water, Sabatier] --> SIM
        CREW[crew.ts: work allocation & repairs] --> SIM
        RAD[radiation.ts: dose, shield, SPE] --> SIM
        EVT[events.ts: MTBF, dust, storms] --> SIM
        RULES[rules.ts: ladder & IF-THEN interpreter] --> SIM
        SIM --> MC[montecarlo.ts: runCampaign & Wilson CI]
        SIM --> REV[review.ts: buildCauseChain]
    end

    subgraph Background Concurrency
        MC --> WORKER[src/worker/campaign.worker.ts]
    end

    subgraph Application State
        STORE[src/state/store.tsx: useReducer + Context]
        SCENARIO[src/state/scenarioCode.ts: encode/decode]
    end

    subgraph UI Screens [src/ui/screens/]
        WORKER -. Progress & Results .-> STORE
        STORE --> SCR_BRIEF[Briefing.tsx]
        STORE --> SCR_DES[Design.tsx]
        STORE --> SCR_RULES[Rules.tsx]
        STORE --> SCR_REH[Rehearse.tsx]
        STORE --> SCR_REV[Review.tsx]
        STORE --> SCR_LRN[Learn.tsx]
        STORE --> SCR_MC[ModelCard.tsx]
    end

    subgraph UI Components [src/ui/components/]
        SCR_DES --> METER[MassBudgetBar.tsx]
        SCR_DES --> STEPPER[NumberStepper.tsx]
        SCR_RULES --> LADDER[PriorityLadder.tsx]
        SCR_RULES --> REDIT[RuleEditor.tsx]
        SCR_REV --> REPLAY[ReplayTimeline.tsx]
        SCR_REV --> CAUSE[RiskBarChart.tsx]
        SCR_REV --> MVR[MassVsRiskChart.tsx: Hand-written SVG]
        SCR_REV --> WHY[WhyThisNumber.tsx: Provenance Modal]
        SCR_MC --> WHY
    end
```

---

## 3. Hourly Simulation Tick Data Flow (720 Ticks)

Within `src/engine/sim.ts`, each tick advances deterministically through fixed steps:

```mermaid
sequenceDiagram
    autonumber
    participant Sim as runMission()
    participant Evt as events.ts
    participant Rules as rules.ts
    participant Power as power.ts
    participant Life as lifeSupport.ts
    participant Crew as crew.ts
    participant Rad as radiation.ts
    participant Check as Loss Evaluator

    Sim->>Evt: Step 1: Draw seeded PRNG events (SPE, dust, component MTBF)
    Sim->>Rules: Step 2: Evaluate IF-THEN rules on tick t-1 state
    Sim->>Power: Step 3: Compute generation (Sun, dust, array loss)
    Sim->>Power: Step 4: Allocate priority ladder power & update battery kWh
    Sim->>Life: Step 5: Process O2 electrolysis, CO2 scrubbing, water recovery, Sabatier return
    Sim->>Crew: Step 6: Allocate productive crew-hours (repairs, crops, science, shielding)
    Sim->>Life: Step 7: Calculate food caloric draw & crop yields
    Sim->>Rad: Step 8: Calculate cosmic background and SPE radiation accumulation
    Sim->>Check: Step 9: Verify deficit counters (hypoxia, dehydration, hypercapnia, dose) & log transitions
```

---

## 4. Scenario Code Format (`src/state/scenarioCode.ts`)

Shareable scenario codes serialize the outpost design and rules into a URL-safe format:

- **Format:** `MM<version>-<base64url_json_payload>`
- **Validation:** String length capped at 2048 characters. Schema validated on decode; corrupt payloads, unknown load IDs, or out-of-range hardware settings throw typed `EngineError`.
