# Moonbase Margin

Junior Astronaut Mission Trainer: A static browser game and lunar outpost simulator for ages 10-16.
NASA Space Apps Challenge 2026.

## Overview

Moonbase Margin puts players in charge of life support and power management for a 4-person crew on a 30-day lunar south pole mission. Design the outpost, set priority shedding and IF-THEN rules, rehearse with Monte Carlo simulations, and review mission replay cause chains.

## Setup & Running

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Run type check
npm run typecheck

# Run linter
npm run lint

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture & Simulation

- Pure TypeScript engine in `src/engine/` (deterministic, zero external runtime dependencies).
- Parameter single source of truth in `data/params.json`.
- Web Worker execution for Monte Carlo campaign off the main UI thread.

## Limits & Boundaries

- Static, private, offline-capable (no runtime analytics or backend).
- Crew of 4, 30 days (720 hourly ticks).
- Radiation exposure modeled for base surface dose + SPEs; EVA radiation excluded in v0.1.
