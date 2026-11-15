# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Kids aged 7 to 12 are the primary players. They play alone on a phone or a school laptop, sometimes with a teacher or parent nearby. Older siblings, parents and teachers also use it, and NASA Space Apps judges try it once in a desktop browser.

## Product Purpose

AstroSim is a free browser game for the NASA Space Apps 2026 challenge "Build a Junior Astronaut Mission Trainer". The player runs a 4-person Moon base at the lunar south pole for 30 days. They build the base within a rocket weight limit, set power rules, then test the plan: the game flies 300 simulated missions and reports how many crews out of every 100 came home, why the others ran into trouble, and a replay of the hardest mission.

Success: a young player walks away understanding that every choice in space costs something (launch mass, power or crew time), and that engineers plan, test many times and learn from what went wrong.

## Positioning

Real NASA data drives the gameplay: players can replay a real solar storm archived from NASA's DONKI space weather database against their own radiation shielding. Results are a chance out of 100 from many test flights, not a single win or loss, so failure becomes a lesson and replays are encouraged.

## Operating Context

- Core loop, one step at a time: Briefing, Build, Rules, Test, Review. Learn (guided missions, quiz) and How it works (every number and its source) sit outside the loop.
- Played in short sessions at home or in class; it must work on a 360 px wide phone and on a classroom projector or laptop.
- Judges evaluate it once, fast, in a desktop browser, and check that the science is traceable.

## Capabilities and Constraints

- Static web app: React, Vite, TypeScript. No backend, database, accounts or analytics. No runtime network calls; NASA data is archived as JSON and labelled "Archived NASA data, retrieved <date>. Not live."
- No new npm packages, no remote fonts, images or CDNs. Charts are hand-written SVG.
- The simulation engine (src/engine) and data (data/) are owned by the engine spec; the UI must not change results.
- All user-facing text lives in src/content. Every number shown has a "Why this number?" control; team-chosen numbers are labelled "illustrative".
- Build contract: AGENTS_NEW.md (levels L10 to L13, Junior Mode as default, Planner Mode for older users).

## Brand Commitments

- Name: AstroSim, "Junior Astronaut Mission Trainer".
- Voice: kind, plain words, grade 3 to 5 reading level. Never "You failed"; say "Your crew ran into trouble because..." and "What would you change?".
- Honesty is part of the brand: what is real NASA data and what is a game simplification is always said on screen.

## Evidence on Hand

- data/donki_archive.json: 5 real DONKI solar energetic particle events (2024 to 2026) with linked flare class and DONKI links, retrieved 2026-11-14.
- data/params.json and docs/SOURCES.md: every simulation number with source id and confidence.
- No testimonials, playtest results, user counts or press exist yet; do not fabricate them. Playtest notes will go in docs/PLAYTEST.md.

## Product Principles

1. Every choice costs something; never offer a free option.
2. Rehearsal, not win or lose: show chances out of 100 and kind next steps.
3. Real data, honestly labelled: archived is never shown as live, and simplifications are named.
4. One step at a time, and no more than three core things to watch for young players.
5. Zero barrier: any browser, any phone, no account, no download.

## Accessibility & Inclusion

Keyboard-operable controls with visible focus and accessible names; text contrast at least 4.5:1; touch targets at least 44 px; works at 360 px width; colour is never the only signal; respects reduced motion. Reading level grade 3 to 5 in Junior Mode.
