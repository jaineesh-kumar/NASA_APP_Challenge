# Model card

Generated from `data/params.json` (version 0.2.0, 85 numbers). The same table is on the game's How it works screen. Numbers with source ASSUMPTION are illustrative game choices made by the team, not NASA requirements; the team tunes them, agents never do.

Sources: ASSUMPTION 66, S10 4, S08 1, S04 2, S05 1, DERIVED 4, S02 2, S03 3, S09 2. Source ids are listed in `docs/SOURCES.md`.

## What the model does

A 30-day mission at the lunar south pole, crew of 4, in 720 one-hour steps (spec B5.4): solar power with dark windows and dust, a priority ladder for power, oxygen from water electrolysis, water recycling, Sabatier, CO2 scrubbing, crew hours, greenhouse food, radiation with shields and a shelter, solar storms (random, or one real archived DONKI storm), component failures with spares, and a radio link that carries storm warnings and repair help. Each test runs 300 seeded missions and reports survival and success with 95% Wilson intervals.

## What we simplified

- One-hour steps; every crew member uses the same air, water and food.
- Storm strength is a fixed multiplier (by flare class for replayed storms) and every storm lasts the same time; real particle flux is not modelled.
- A replayed storm arrives at mission hour `radiation.replay_onset_h`, not at its real time of day.
- No spacewalk radiation, crew tiredness or mood, detailed heating (one dark-window multiplier), or orbit and relay model (the radio is simply on or off).
- Two example landing spots with simple dark-window schedules.
- Out of scope: accounts, backend, multiplayer, 3D, live AI chat, Mars.

## Open items for the team

- Verify S01 (BVAD) values for crew oxygen, CO2 and food (`TODO(human)` notes).
- Verify the mission dose limit against S11 (NASA-STD-3001).
- Confirm the illustrative params added in this sprint: `radiation.replay_onset_h`, `radiation.spe_multiplier_by_flare_class`, `comms.repair_assist_fraction`.
- Balance: see ADR-008 in `docs/DECISIONS.md`.

## Every number

| Number | Value | Unit | Source | Confidence | Note |
|---|---|---|---|---|---|
| `mission.hours` | 720 (illustrative) | h | ASSUMPTION | high | 30-day mission design choice |
| `campaign.runs` | 300 (illustrative) | runs | ASSUMPTION | high | default Monte Carlo size |
| `crew.size` | 4 (illustrative) | crew | ASSUMPTION | high | design choice |
| `crew.o2_kg_per_day` | 0.84 | kg/crew/day | S10 | medium | TODO(human): verify in S01 BVAD |
| `crew.co2_kg_per_day` | 1 | kg/crew/day | S10 | medium | TODO(human): verify in S01 BVAD |
| `crew.water_total_kg_per_day` | 4.35 | kg/crew/day | S08 | high | BVAD value quoted by S08; verify in S01 |
| `crew.food_kcal_per_day` | 2500 | kcal/crew/day | S10 | medium | TODO(human): verify |
| `crew.food_kg_per_day` | 0.6 | kg/crew/day | S10 | medium | display only, not used by the engine |
| `crew.productive_hours_per_day` | 8 (illustrative) | h/crew/day | ASSUMPTION | low | illustrative |
| `water.recovery_base` | 0.9 | fraction | S04 | high | ISS water recovery, older hardware |
| `water.recovery_upgraded` | 0.98 | fraction | S04 | high | ISS with brine processor |
| `o2.sabatier_recovery` | 0.5 | fraction | S05 | high | ceiling of Sabatier oxygen recovery |
| `o2.electrolysis_water_per_o2` | 1.125 | kg water/kg O2 | DERIVED | high | 2 H2O to 2 H2 + O2: 36 g water per 32 g oxygen |
| `o2.generator_capacity_factor` | 1.5 (illustrative) | x need | ASSUMPTION | low | illustrative |
| `co2.scrubber_capacity_factor` | 1.5 (illustrative) | x production | ASSUMPTION | low | illustrative |
| `co2.cabin_limit_kg` | 2 (illustrative) | kg | ASSUMPTION | low | game limit, illustrative |
| `loss.o2_deficit_hours` | 3 (illustrative) | h | ASSUMPTION | low | game rule |
| `loss.co2_over_hours` | 6 (illustrative) | h | ASSUMPTION | low | game rule |
| `loss.water_deficit_hours` | 72 (illustrative) | h | ASSUMPTION | low | game rule |
| `loss.food_shortfall_hours` | 168 (illustrative) | h | ASSUMPTION | low | game rule |
| `radiation.surface_usv_per_day` | 1369 | uSv/day | S02 | high | measured dose equivalent, far side, lunar day, suit-level proxy |
| `radiation.iss_usv_per_day` | 731 | uSv/day | S02 | high | ISS reference over the same period; display only |
| `radiation.shield_factor_by_layers` | [1, 0.67, 0.5, 0.4] (illustrative) | factor | ASSUMPTION | low | illustrative; non-increasing; index = layers built |
| `radiation.shelter_factor` | 0.25 (illustrative) | factor | ASSUMPTION | low | illustrative |
| `radiation.spe_multiplier` | 20 (illustrative) | x | ASSUMPTION | low | illustrative |
| `radiation.spe_duration_h` | 12 (illustrative) | h | ASSUMPTION | low | illustrative |
| `radiation.spe_warning_lead_h` | 2 (illustrative) | h | ASSUMPTION | low | illustrative |
| `radiation.spe_per_month` | 1 (illustrative) | events/30 d | ASSUMPTION | low | illustrative |
| `radiation.replay_onset_h` | 300 (illustrative) | h | ASSUMPTION | low | mission hour when a replayed real storm arrives; TODO(human): confirm |
| `radiation.spe_multiplier_by_flare_class` | [10, 20, 40] (illustrative) | x | ASSUMPTION | low | storm strength in the game by linked flare class: index 0 = C, 1 = M, 2 = X; illustrative; TODO(human): confirm |
| `radiation.dose_limit_usv_mission` | 60000 (illustrative) | uSv | ASSUMPTION | low | game limit; TODO(human): verify against S11 NASA-STD-3001 |
| `power.panel_kw` | 10 (illustrative) | kW/panel | ASSUMPTION | low | game unit |
| `power.battery_kwh_per_unit` | 100 (illustrative) | kWh/unit | ASSUMPTION | low | game unit |
| `power.charge_efficiency` | 0.9 (illustrative) | fraction | ASSUMPTION | low | illustrative |
| `power.dust_events_per_month` | 1.5 (illustrative) | events/30 d | ASSUMPTION | low | illustrative |
| `power.dust_factor` | 0.85 (illustrative) | factor | ASSUMPTION | low | illustrative |
| `power.dust_duration_h` | 72 (illustrative) | h | ASSUMPTION | low | illustrative |
| `power.array_failure_factor` | 0.75 (illustrative) | factor | ASSUMPTION | low | one of four strings lost |
| `power.mast_dark_reduction_per_level` | 0.1 | fraction/level | S03 | low | S03 shows height raises illumination (qualitative); the size is our assumption |
| `power.thermal_dark_multiplier` | 1.5 (illustrative) | x | ASSUMPTION | low | illustrative |
| `load.life_support_kw` | 5 (illustrative) | kW | ASSUMPTION | low | game unit |
| `load.thermal_kw` | 4 (illustrative) | kW | ASSUMPTION | low | game unit |
| `load.comms_kw` | 1 (illustrative) | kW | ASSUMPTION | low | game unit |
| `load.greenhouse_kw_per_module` | 3 (illustrative) | kW/module | ASSUMPTION | low | game unit |
| `load.science_kw` | 3 (illustrative) | kW | ASSUMPTION | low | game unit |
| `load.construction_kw` | 3 (illustrative) | kW | ASSUMPTION | low | game unit |
| `site.ridge.dark_starts_h` | [200, 560] | h | S09 | medium | illustrative schedule matching the about 90% illumination band |
| `site.ridge.dark_length_h` | 36 | h | S09 | medium | 2 x 36 h = 10% of 720 h |
| `site.ridge.start_water_kg` | 600 (illustrative) | kg | ASSUMPTION | low | illustrative |
| `site.crater_edge.dark_starts_h` | [120, 330, 540] | h | S03 | medium | illustrative schedule matching the about 70% illumination band |
| `site.crater_edge.dark_length_h` | 72 | h | S03 | medium | 3 x 72 h = 30% of 720 h |
| `site.crater_edge.start_water_kg` | 900 (illustrative) | kg | ASSUMPTION | low | closer to ice; illustrative |
| `site.dark_jitter_h` | 24 (illustrative) | h | ASSUMPTION | low | window start variation |
| `start.o2_tank_kg` | 130 (illustrative) | kg | ASSUMPTION | low | illustrative |
| `start.food_kcal` | 220000 (illustrative) | kcal | ASSUMPTION | low | about 22 days for 4 crew |
| `greenhouse.kcal_per_module_per_day` | 5000 (illustrative) | kcal/day | ASSUMPTION | low | illustrative |
| `greenhouse.water_kg_per_module_per_day` | 3 (illustrative) | kg/day | ASSUMPTION | low | illustrative |
| `greenhouse.crew_hours_per_module_per_tick` | 0.2 (illustrative) | h | ASSUMPTION | low | illustrative |
| `greenhouse.low_power_factor` | 0.5 (illustrative) | factor | ASSUMPTION | low | power and yield both scaled |
| `construction.hours_per_shield_layer` | 40 (illustrative) | crew-h | ASSUMPTION | low | illustrative |
| `science.target_hours` | 120 (illustrative) | crew-h | ASSUMPTION | low | illustrative |
| `science.max_hours_per_tick` | 0.6 (illustrative) | h | ASSUMPTION | low | illustrative |
| `failure.mtbf_h.co2_scrubber` | 900 (illustrative) | h | ASSUMPTION | low | illustrative |
| `failure.mtbf_h.o2_generator` | 1100 (illustrative) | h | ASSUMPTION | low | illustrative |
| `failure.mtbf_h.water_processor` | 800 (illustrative) | h | ASSUMPTION | low | illustrative |
| `failure.mtbf_h.power_array` | 1500 (illustrative) | h | ASSUMPTION | low | illustrative |
| `repair.hours.co2_scrubber` | 6 (illustrative) | crew-h | ASSUMPTION | low | illustrative |
| `repair.hours.o2_generator` | 10 (illustrative) | crew-h | ASSUMPTION | low | illustrative |
| `repair.hours.water_processor` | 12 (illustrative) | crew-h | ASSUMPTION | low | illustrative |
| `repair.hours.power_array` | 8 (illustrative) | crew-h | ASSUMPTION | low | illustrative |
| `mass.budget` | 120 (illustrative) | mu | ASSUMPTION | low | game unit |
| `mass.panel` | 5 (illustrative) | mu | ASSUMPTION | low | game unit |
| `mass.mast_level` | 6 (illustrative) | mu/level | ASSUMPTION | low | game unit |
| `mass.battery` | 5 (illustrative) | mu | ASSUMPTION | low | game unit |
| `mass.water_tier1` | 8 (illustrative) | mu | ASSUMPTION | low | game unit |
| `mass.o2_tier1` | 10 (illustrative) | mu | ASSUMPTION | low | game unit |
| `mass.greenhouse_module` | 10 (illustrative) | mu | ASSUMPTION | low | game unit |
| `mass.shield_layer` | 12 (illustrative) | mu | ASSUMPTION | low | game unit |
| `mass.spare` | 3 (illustrative) | mu | ASSUMPTION | low | game unit |
| `rating.flight_ready_survival` | 0.95 (illustrative) | fraction | ASSUMPTION | low | game threshold, not a NASA requirement |
| `rating.flight_ready_success` | 0.8 (illustrative) | fraction | ASSUMPTION | low | game threshold, not a NASA requirement |
| `comms.earth_moon_light_delay_s` | 1.28 | s | DERIVED | high | 384,400 km average Earth-Moon distance divided by the speed of light (299,792 km/s); display only |
| `comms.earth_mars_light_delay_min` | [3, 22] | min | DERIVED | high | closest (54.6 million km) and farthest (401 million km) Earth-Mars distance divided by the speed of light; display only |
| `comms.repair_assist_fraction` | 0.25 (illustrative) | fraction | ASSUMPTION | low | repair hours saved while the radio link to Earth is up (B5.10); illustrative; TODO(human): confirm |
| `comms.moon_one_way_delay_s` | 1.3 | s | DERIVED | low | Earth-Moon distance divided by the speed of light (B5.10); display only |
