# Changelog

All notable changes to AstroSim will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-11-14

### Added

- Real Storm Replay: 5 archived NASA DONKI solar storms with linked flare class; "Your crew vs the storm of <date>" results; in-app Data panel; `docs/DATA_USED.md`.
- Comms link: storm warnings and repair help travel over the radio; switching it off now costs dose and missions.
- Junior Mode (default) and Planner Mode: starter kits, safety switches, "X out of every 100 crews came home" with a 100-icon grid, three core meters, tap-to-explain science words, New challenge.
- Real astronaut findings: 5 NASA OSDR studies in Learn and Review.
- Step-by-step flow (one coupon per step, route arc, Back/Next with lock reasons) and the bright ticket-wallet design system (`DESIGN.md`).

### Changed

- Engine aligned with spec B5.4 to B5.9 (oxygen from water, crew order, shelter alert, loss counters, nearest-rank percentile, worst seed, cause chain); a 300-run campaign is about twice as fast.
- All copy rewritten for ages 7 to 12; quiz claims limited to what sources support.
- Scenario codes v2 carry the storm mode, validate every field, and accept base64url and standard base64.

### Removed

- The AI Studio script that patched `fetch` and `Object.defineProperty` in `index.html`.

## [0.1.0] - 2026-10-16

### Added

- **Core Engine (L0–L5)**: Pure functional simulation engine in `src/engine/` modeling 720 hourly ticks across solar generation, dark windows, battery storage, ECLSS (O2, CO2, water, Sabatier), crew shifts, radiation exposure, component MTBFs, and loss conditions.
- **Monte Carlo Campaign**: 300-run stochastic mission simulation calculating survival and success rates with Wilson 95% confidence intervals and 5th/95th percentile safety margins.
- **Web Worker**: Background campaign worker in `src/worker/campaign.worker.ts` streaming periodic execution progress.
- **UI Screens (L6–L8)**:
  - `BriefingScreen`: Overview of mission loop and expedition objectives.
  - `DesignScreen`: Lander mass meter, hardware steppers, water and oxygen loops, presets.
  - `RulesScreen`: 6-load priority ladder and 5 automated IF-THEN emergency rules.
  - `RehearseScreen`: Campaign execution trigger with live progress bar and status feedback.
  - `ReviewScreen`: Statistical margins, cause breakdown bars, worst-run scrubbable replay, root cause chain, and hand-written SVG mass-vs-risk scatter chart.
  - `LearnScreen`: Guided missions M1–M3 with concept checks, core engineering concept cards, 6-question astronaut readiness quiz, and URL scenario code sharing.
  - `ModelCardScreen`: Complete transparent registry of all 62 parameters and documented modeling simplifications.
- **Why This Number? (L7)**: Scientific provenance inspector modal displaying baseline value, unit, source citation, confidence level, and scientific notes.
- **Scenario Code Encoder/Decoder (L8)**: Versioned `MM1-...` URL-safe scenario code encoder and decoder with strict bounds and integrity validation.
- **Test Suite**: 25 test files and 101 unit/golden tests passing with zero errors.
