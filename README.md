# Moonbase Margin

**Junior Astronaut Mission Trainer**: A static browser game and lunar outpost simulator for ages 10–16.  
Project created for the NASA Space Apps Challenge 2026.

---

## 🚀 Overview

Moonbase Margin puts players in charge of life support (ECLSS) and power management for an expedition of 4 astronauts on a 30-day (720 hourly ticks) mission to the lunar south pole.

- **Design**: Allocate a 120 mass unit budget between solar panels, mast towers, batteries, water/oxygen recovery loops, hydroponic greenhouses, regolith shielding, and spare parts.
- **Rules**: Establish a 6-load priority shedding ladder and configure up to 5 automated IF-THEN emergency triggers.
- **Rehearse**: Simulate 300 Monte Carlo runs off the main thread via Web Workers to determine mission survival and science success with 95% Wilson confidence intervals.
- **Review**: Inspect 5th/95th percentile safety margins, examine failure cause bars, replay the worst run hour-by-hour, and trace root-cause failure chains.
- **Learn**: Complete guided training missions M1–M3 with concept checks, take the 6-question astronaut readiness quiz, and exchange shareable scenario codes.
- **Model Card**: Full transparency on all 62 parameters and documented scientific simplifications.

---

## 🛠️ Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (port 3000)
npm run dev

# 3. Typecheck codebase
npm run typecheck

# 4. Run linter
npm run lint

# 5. Execute 101 unit and golden tests
npm run test

# 6. Build optimized production bundle
npm run build

# 7. Preview production build locally
npm run preview
```

---

## 🌐 Deployment

### Deploying to GitHub Pages

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. The compiled static output in `dist/` is completely standalone (HTML, JS, CSS, SVG).
3. Push the `dist/` directory to the `gh-pages` branch or configure GitHub Actions to deploy static pages from the repository root.

### Deploying to Vercel

1. Install or link with the Vercel CLI:
   ```bash
   vercel
   ```
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. No environment variables, database, or server runtime required.

---

## 📐 Architecture & Boundaries

- **Purity**: Zero React or DOM code inside `src/engine/`. Pure TypeScript functions.
- **Determinism**: 32-bit `mulberry32` pseudo-random number generator ensures identical seeds produce bit-for-bit identical mission logs.
- **Parameters**: `data/params.json` acts as the single source of truth for all 62 physical, biological, and engineering constants.
- **Privacy & Security**: 100% client-side, static, private, and offline-capable. Zero network calls, telemetry, or third-party tracking.
- **Scope Limits for v0.1**: 4 crew members, 720 hourly ticks. Simplified discrete 1-hour time intervals, no extravehicular activity (EVA) radiation calculations, and no crew fatigue or psychological morale degradation.

---

## 📚 Scientific Citations & Credits

- **S01:** Anderson, Ewert & Keener (2018). _Life Support Baseline Values and Assumptions Document (BVAD)_, NASA/TP-2015-218570/REV1.
- **S02:** Zhang, S. et al. (2020). _First measurements of the radiation dose on the lunar surface_. Science Advances 6(39), eaaz1334.
- **S03:** Ross, A. et al. (2021). _Towers on the Peaks of Eternal Light: Quantifying Available Solar Power_. arXiv:2102.11766.
- **S04:** NASA (2025). _Environmental Control and Life Support System (ECLSS) Fact Sheet_.
- **S05:** NASA. _Sabatier Carbon Dioxide Reduction Assembly Development_.
- **S06:** NASA (2011). _Probabilistic Risk Assessment Procedures Guide_, NASA/SP-2011-3421.
- **S08:** Frontiers in Space Technologies (2024). _Assessment of physical and psychological aspects of ECLSS on ISS_.
- **S09:** Wood, C. (2017). _Peaks of "Eternal" Light_, Sky & Telescope.
- **S10:** ECLSS Sizing Reference (Secondary source citing NASA-STD-3001 and BVAD).
