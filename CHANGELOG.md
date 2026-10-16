# Changelog

All notable changes to Moonbase Margin will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
