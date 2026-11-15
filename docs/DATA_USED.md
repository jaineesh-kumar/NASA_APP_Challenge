# Data used in AstroSim

One page for judges and teachers: which real datasets the game uses, why, where they appear, and what is real versus our simplification. Nothing in the game is fetched at runtime; every dataset is archived in the repository and labelled "archived, not live" on screen.

| Dataset | Source id | Why we use it | Where it appears | Retrieved |
|---|---|---|---|---|
| NASA DONKI space weather database, SEP events plus SEP notifications (`api.nasa.gov/DONKI/SEP`, `/DONKI/notifications?type=SEP`) | S12 | The challenge names DONKI. Real solar storms make the radiation-shielding decision real. | Test step: "Replay a real storm" picker; Review: "Your crew vs the storm of <date>" and the replay; Missions M3 and M5; Training Bay: Storm Shelter (one archived storm per round); Data and science page (every archived storm, with "Test my base against this storm"); Data panel | 2026-11-14 (`data/donki_archive.json`, field `retrievedAt`) |
| NASA Open Science Data Repository, OSDR (`osdr.nasa.gov/osdr/data/search`) | S13 | The challenge names OSDR. Real studies of how space changes bodies, cells and plants make the game's risks real. | Data and science page and For teachers: "Real astronaut findings"; Review: one "Real astronaut finding" matched to what went wrong; Mission 4 debrief (plant study, S13); Data panel | 2026-11-14 (`data/osdr_cards.json`, field `retrievedAt`) |
| Chang'e-4 lunar surface radiation measurement (Zhang et al. 2020) | S02 | The everyday radiation dose on the Moon's surface. | `radiation.surface_usv_per_day` in every mission | Published paper |
| NASA ECLSS fact sheet | S04 | Water recovery of the space station's basic and upgraded recyclers. | `water.recovery_base`, `water.recovery_upgraded` | Published source |
| NASA Sabatier system | S05 | The ceiling of oxygen recovery by the Sabatier air recycler. | `o2.sabatier_recovery` | Published source |
| Lunar south pole illumination (Ross et al. 2021; Wood 2017) | S03, S09 | Why landing spots have dark hours and why a taller mast helps. | Dark windows per site, mast effect | Published sources |

## DONKI archive: how it was built

- Script: `scripts/fetch-donki.mjs` (developer machine only, never in the app bundle). Run `node scripts/fetch-donki.mjs` (uses `DEMO_KEY`) or with `NASA_API_KEY` set.
- Request windows of 30 days, walking backwards from the retrieval date, with pauses, retries and a local cache.
- **Selection rule:** keep a solar energetic particle (SEP) event only when one of its `linkedEvents` is a solar flare whose class is C, M or X; at most one event per calendar month (the newest); stop at 5 events.
- **Flare class:** `/DONKI/FLR` returned HTTP 404 on 2026-11-14, so the class comes from DONKI's own SEP notification text ("associated with an X2.2 flare ... with ID 2024-05-09T08:45:00-FLR-001"). A class is accepted only when the flare id in the notification is also in the SEP event's `linkedEvents`. Each event stores the notification id and URL as `classEvidence`.
- The archive records `source`, `endpoint`, `query` and `retrievedAt`; the engine rejects a malformed archive.

## What is real, and what is our simplification

**Real (archived NASA data):** which storms happened, their dates, their DONKI ids and links, and the class of the solar flare DONKI links to each one.

**Our simplification (labelled "illustrative" in the game):**

- A replayed storm arrives at mission hour `radiation.replay_onset_h` (300), not at its real time of day.
- Its strength in the game comes only from the flare class letter, via `radiation.spe_multiplier_by_flare_class` (C, M, X). Real particle flux is not modelled.
- Every storm lasts `radiation.spe_duration_h`, and its warning comes `radiation.spe_warning_lead_h` hours early, the same as random storms.
- Random storms (the default mode) use the illustrative rate `radiation.spe_per_month`; they are not real events.

## OSDR cards: how they were built

- Script: `scripts/fetch-osdr.mjs` (developer machine only). One search per game topic: astronauts: "astronaut"; radiation: "space radiation"; bones: "bone loss microgravity"; muscles: "muscle atrophy spaceflight"; plants: "plant growth spaceflight".
- For each topic it keeps the top study with a title and description (preferring a human study for "astronauts") and checks that the study page opens.
- Each card stores the study's own description as `evidence`. The kid-friendly `summary` was drafted by the agent **only from that evidence** and carries `needsReview: true` until a person checks it. Summaries only restate what the study's own description says; nothing is added.
- Cards: OSD-53 (astronauts), OSD-992 (radiation), OSD-18 (bones), OSD-225 (muscles), OSD-615 (plants).

## Not used

- Artemis and Mars surface data: only if listed in `docs/CHALLENGE_RESOURCES.md` by the team (Resources tab not yet pasted).
