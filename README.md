# AstroSim

**Junior Astronaut Mission Trainer**: a free browser game for NASA International Space Apps Challenge 2026, "Build a Junior Astronaut Mission Trainer".

Kids aged 7 to 12 (and older siblings, parents and teachers) run a 4-person Moon base at the lunar south pole for 30 days. Every choice costs launch mass, power or crew time. The game flies 300 test missions and shows **how many crews out of every 100 came home**, why the others ran into trouble, and a replay of the hardest mission. Players can test their radiation shielding against a **real solar storm archived from NASA's DONKI database**, and read **real astronaut findings from NASA OSDR**.

No account, no download, no server, no tracking. It runs in any browser, on a phone too.

---

## How to play

The game is one step at a time, like a ticket wallet with one coupon per step:

1. **Briefing**: the mission in one paragraph, how to play, and the space words.
2. **Build**: pick a starter kit (Light, Balanced or Heavy), then change a few things within the rocket weight limit.
3. **Rules**: choose which machines keep power longest, and switch on safety rules ("Storm warning: crew goes to the shelter").
4. **Test**: pick random storms or replay a real NASA storm, then fly 300 missions.
5. **Review**: the boarding pass ("94 out of every 100 crews came home"), a grid of 100 crews, the main trouble, a replay with three big meters (Power, Life support, Shield), the cause chain, and a real astronaut finding.

### Pages

| Page | Address | What it is |
|---|---|---|
| Home | `#/` | The mission story, a Play button and the real-NASA-data badge |
| How to play | `#/how-to-play` | Three picture cards and a guided first mission with coach tips |
| Missions | `#/missions` | Five guided missions (M1 to M5), each ending with a three-question debrief |
| Training Bay | `#/training` | Practice games: Power Juggle (share the battery through the dark) and Storm Shelter (a real archived storm) |
| Free build | `#/free-build` | The five steps above with your own base |
| Logbook | `#/logbook` | Badges, mission results and training scores, saved only in this browser |
| Space words | `#/words` | Every science word in plain language |
| For teachers | `#/teachers` | A lesson plan, the big ideas, the pre/post quiz and scenario codes |
| Data and science | `#/data` | Every archived storm, the OSDR findings, what is real and what we simplified, and every number with its source |
| Mission Day | `#/mission-day` | Play the mission one day at a time, choosing one order each morning |
| Quiz | `#/quiz` | A short space quiz (Quiz button in the header) |
| Sim | `#/sim` | The 3D hands-on Sim: how to play, its five missions with screenshots, and a Launch button |

**The 3D Sim** (`public/sim/index.html`) is a separate page: land on the Moon, suit up, set up solar panels, build a regolith shield and survive a solar storm, grow plants and run a lab test. It loads its 3D library (three.js) from cdnjs, so it needs an internet connection. Everything else works offline.

The site runs in **Junior Mode** (simple controls). Every number links to its source with "Why this number?".

## The trade-offs it teaches

- **Mass:** every panel, battery, shield layer or spare takes rocket space from something else.
- **Power:** mountains block the Sun for hours; batteries carry the base through. Machines lower on your ladder switch off first.
- **Air and water:** the oxygen maker splits water; recyclers save water; breakdowns without spares can end a mission.
- **Radiation:** shields and the shelter cut the dose; hiding stops science and building.
- **Communication:** storm warnings from Earth arrive by radio, and Earth helps with repairs. Switching the radio off saves power but costs both. A radio message takes about 1.3 seconds to reach the Moon and 3 to 22 minutes to reach Mars.

## Real NASA data

| Dataset | Used for |
|---|---|
| NASA DONKI space weather database (S12) | 5 real solar storms (2024 to 2026) with their linked flare class, for Real Storm Replay |
| NASA Open Science Data Repository, OSDR (S13) | 5 real studies shown as "Real astronaut finding" cards |
| Chang'e-4 lunar surface dose (S02), NASA ECLSS (S04), Sabatier (S05), south pole illumination (S03, S09) | Simulation numbers |

All data is archived in `data/` and labelled on screen "Archived NASA data, retrieved <date>. Not live." What is real and what is our simplification is explained in [`docs/DATA_USED.md`](docs/DATA_USED.md). Every number and its source is in [`data/params.json`](data/params.json) and on the How it works screen.

---

## Getting started

Requires Node.js 22 or newer.

```bash
npm ci            # install the locked dependencies
npm run dev       # start the dev server (http://localhost:3000)
```

### Verify

```bash
npm run typecheck   # TypeScript strict
npm run lint        # ESLint, zero warnings
npm run test        # Vitest: engine, golden files, UI, accessibility
npm run build       # production bundle in dist/
npm run preview     # serve the production bundle locally
```

### Refresh the NASA data (developer machine only)

```bash
npm run data:fetch                  # DONKI storms -> data/donki_archive.json (DEMO_KEY, or NASA_API_KEY in the environment)
npm run data:osdr                   # OSDR studies -> data/osdr_cards.json
npm run golden:update               # only after an approved model change
```

Never commit an API key. `.env` is git-ignored; see `.env.example`.

## Deploying

The build in `dist/` is static and self-contained.

- **GitHub Pages:** run `npm run build` and publish `dist/` (the Vite `base` is relative, so sub-paths work).
- **Vercel:** framework preset Vite, build command `npm run build`, output directory `dist`. No environment variables or server are needed.

## Privacy and security

- Everything runs in the browser. No accounts, analytics, trackers or cookies.
- No network requests at runtime; the production build ships a Content-Security-Policy limiting connections to its own origin.
- Scenario codes are validated strictly before they are loaded.

## Limits (what we simplified)

- The mission moves in one-hour steps; every crew member uses the same amount of air, water and food.
- Many numbers are illustrative game choices (marked ASSUMPTION and "illustrative"); see the How it works screen.
- A replayed storm arrives at mission hour 300, and its strength depends only on its flare class letter.
- No spacewalk radiation, crew tiredness, detailed heating, or orbit and relay model. The display font is an installed system font.

## Project documents

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/MODEL_CARD.md`](docs/MODEL_CARD.md), [`docs/DATA_USED.md`](docs/DATA_USED.md), [`docs/SOURCES.md`](docs/SOURCES.md)

## Scientific citations

- **S01:** Anderson, Ewert & Keener (2018). Life Support Baseline Values and Assumptions Document (BVAD), NASA/TP-2015-218570/REV1.
- **S02:** Zhang, S. et al. (2020). First measurements of the radiation dose on the lunar surface. Science Advances 6(39), eaaz1334.
- **S03:** Ross, A. et al. (2021). Towers on the Peaks of Eternal Light: Quantifying the Available Solar Power. arXiv:2102.11766.
- **S04:** NASA. Environmental Control and Life Support System (ECLSS) fact sheet.
- **S05:** NASA. Sabatier Carbon Dioxide Reduction Assembly development.
- **S06:** NASA (2011). Probabilistic Risk Assessment Procedures Guide, NASA/SP-2011-3421.
- **S08:** Frontiers in Space Technologies (2024). Assessment of the physical and psychological aspects of the current life support system on the ISS.
- **S09:** Wood, C. (2017). Peaks of "Eternal" Light. Sky & Telescope.
- **S10:** ECLSS sizing reference (secondary source citing NASA-STD-3001 and BVAD).
- **S12:** NASA CCMC, DONKI space weather database (api.nasa.gov/DONKI).
- **S13:** NASA Open Science Data Repository (OSDR).
- **S14:** Official challenge page, "Build a Junior Astronaut Mission Trainer".

---

## Author & Submission Details

- **Author / Lead Developer:** Jaineesh Kumar
- **GitHub:** [@jaineesh-kumar](https://github.com/jaineesh-kumar)
- **Email:** `jaineesh.makwana001@gmail.com`
- **Project:** NASA International Space Apps Challenge 2026
- **Challenge Track:** *Build a Junior Astronaut Mission Trainer*
- **Repository:** [NASA_APP_Challenge](https://github.com/jaineesh-kumar/NASA_APP_Challenge.git)
