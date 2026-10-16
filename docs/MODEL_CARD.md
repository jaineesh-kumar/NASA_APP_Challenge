# Scientific Model Card: Moonbase Margin

> **Version:** 0.1.0  
> **Date:** October 2026  
> **Target Audience:** Junior Astronauts & Students (Ages 10–16), Space Educators, Mission Architects  
> **Simulation Scope:** 4-crew, 30-day (720 hourly ticks) lunar south pole outpost life support and power dynamics.

---

## 1. Model Overview & Purpose

Moonbase Margin is a static, browser-based probabilistic mission simulator built for the NASA Space Apps Challenge 2026. Its educational objective is to teach students the critical balance between **launch mass**, **system redundancy**, and **safety margin** when engineering an extraterrestrial outpost.

Players choose a landing site (Malapert Ridge or Shackleton Crater Edge), configure hardware subsystems within a 120 mass unit budget, define load-shedding priority ladders and automated IF-THEN emergency triggers, and rehearse campaigns of 300 Monte Carlo seeded runs to assess survival probabilities and subsystem margins with 95% Wilson confidence intervals.

---

## 2. Core Subsystems Modeled

1. **Power Generation & Storage:**
   - Solar photovoltaic panels producing 10 kW each during sunlit periods.
   - Illumination mast towers reducing dark window durations caused by terrain shadows.
   - 100 kWh battery storage units with 90% round-trip charge efficiency.
   - Solar array partial string failure (25% loss) and lunar surface dust accumulation (15% loss).

2. **Environmental Control and Life Support System (ECLSS):**
   - Metabolic oxygen consumption (0.84 kg/crew/day) and carbon dioxide production (1.0 kg/crew/day).
   - Water consumption and recycling: baseline 90% recovery; upgraded 98% brine processor loop.
   - Closed-loop oxygen recovery via catalytic Sabatier reactor (up to 50% O2 recovery via water synthesis).
   - Cabin CO2 scrubbing with failure MTBF and emergency deficit counters.

3. **Crew Allocation & Habitat Construction:**
   - 8 productive hours per crew member per day (32 crew-hours daily pool).
   - Dynamic allocation prioritizing repairs, greenhouse crops, science, and regolith shield construction.

4. **Radiation Protection & Space Weather:**
   - Background galactic cosmic radiation (GCR) surface baseline dose equivalent (1,369 µSv/day).
   - Sporadic Solar Particle Events (SPEs) with 20x radiation dose multiplier and 2-hour early warning lead time.
   - Regolith shielding layers (0.67, 0.50, 0.40 dose factors) and storm sheltering (0.25 dose factor).

---

## 3. Documented Modeling Simplifications (Spec B1)

To deliver an interactive, zero-latency browser experience without external backend servers, the following deliberate abstractions were adopted:

| Subsystem                              | Modeled Behavior                                              | Simplification / Out of Scope                                                               |
| -------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Time Discretization**                | Discrete 1-hour time ticks over 720 hours.                    | Continuous differential fluid dynamics and sub-minute electrical transients omitted.        |
| **Crew Uniformity**                    | Identical metabolic and nutritional demands for 4 astronauts. | Crew gender variation, individual metabolic scaling, and sleep schedules omitted.           |
| **Crew Psychology & Fatigue**          | Fixed 8 productive hours/day.                                 | Sleep deprivation, psychological morale, and cognitive stress are out of scope for v0.1.    |
| **Thermal Dynamics**                   | 4 kW baseline conditioning + 1.5x dark window multiplier.     | Detailed thermal radiative equilibrium and surface conductive regolith modeling simplified. |
| **Radiation Exposure**                 | Outpost and shelter dose accumulation.                        | Extravehicular Activity (EVA) spacewalk radiation exposure omitted.                         |
| **Communications & Orbital Mechanics** | Constant 1 kW comms link.                                     | Deep Space Network (DSN) tracking stations and line-of-sight occultation omitted.           |
| **Resupply Logistics**                 | Fixed 30-day closed campaign.                                 | Intermediate Earth resupply missions or lunar orbital gateway transfers omitted.            |

---

## 4. Parameter Single Source of Truth (`data/params.json`)

All 62 simulation constants are validated and frozen. No hardcoded domain numbers exist in the simulation engine.

| Parameter Key                               | Value                 | Unit         | Source     | Confidence | Note                                         |
| ------------------------------------------- | --------------------- | ------------ | ---------- | ---------- | -------------------------------------------- |
| `mission.hours`                             | 720                   | h            | ASSUMPTION | high       | 30-day mission duration                      |
| `campaign.runs`                             | 300                   | runs         | ASSUMPTION | high       | Default Monte Carlo sample size              |
| `crew.size`                                 | 4                     | crew         | ASSUMPTION | high       | Expedition crew complement                   |
| `crew.o2_kg_per_day`                        | 0.84                  | kg/crew/d    | S10        | medium     | NASA BVAD human metabolic consumption        |
| `crew.co2_kg_per_day`                       | 1.0                   | kg/crew/d    | S10        | medium     | NASA BVAD human metabolic exhalation         |
| `crew.water_total_kg_per_day`               | 4.35                  | kg/crew/d    | S08        | high       | ISS ECLSS total consumption standard         |
| `crew.food_kcal_per_day`                    | 2500                  | kcal/crew/d  | S10        | medium     | Standard daily astronaut caloric requirement |
| `crew.food_kg_per_day`                      | 0.6                   | kg/crew/d    | S10        | medium     | Packaging mass display reference             |
| `crew.productive_hours_per_day`             | 8                     | h/crew/d     | ASSUMPTION | low        | Illustrative productive shift length         |
| `water.recovery_base`                       | 0.9                   | fraction     | S04        | high       | Heritage ISS urine & condensate recovery     |
| `water.recovery_upgraded`                   | 0.98                  | fraction     | S04        | high       | Advanced ISS brine processor assembly        |
| `o2.sabatier_recovery`                      | 0.5                   | fraction     | S05        | high       | Sabatier CO2 reduction oxygen ceiling        |
| `o2.electrolysis_water_per_o2`              | 1.125                 | kg H2O/kg O2 | DERIVED    | high       | Stoichiometric ratio: 2 H2O -> 2 H2 + O2     |
| `o2.generator_capacity_factor`              | 1.5                   | x need       | ASSUMPTION | low        | Illustrative surge production factor         |
| `co2.scrubber_capacity_factor`              | 1.5                   | x prod       | ASSUMPTION | low        | Illustrative scrubber capacity buffer        |
| `co2.cabin_limit_kg`                        | 2.0                   | kg           | ASSUMPTION | low        | Cabin atmospheric toxicity threshold         |
| `loss.o2_deficit_hours`                     | 3                     | h            | ASSUMPTION | low        | Permissible hypoxia buffer hours             |
| `loss.co2_over_hours`                       | 6                     | h            | ASSUMPTION | low        | Permissible hypercapnia buffer hours         |
| `loss.water_deficit_hours`                  | 72                    | h            | ASSUMPTION | low        | Permissible dehydration buffer hours         |
| `loss.food_shortfall_hours`                 | 168                   | h            | ASSUMPTION | low        | Permissible caloric deficit buffer hours     |
| `radiation.surface_usv_per_day`             | 1369                  | µSv/d        | S02        | high       | Chang'e-4 lunar surface measurements         |
| `radiation.iss_usv_per_day`                 | 731                   | µSv/d        | S02        | high       | Low Earth orbit reference comparison         |
| `radiation.shield_factor_by_layers`         | [1.0, 0.67, 0.5, 0.4] | factor       | ASSUMPTION | low        | Attenuation factors for regolith shielding   |
| `radiation.shelter_factor`                  | 0.25                  | factor       | ASSUMPTION | low        | Dedicated storm shelter dose attenuation     |
| `radiation.spe_multiplier`                  | 20                    | x            | ASSUMPTION | low        | Solar flare proton spike multiplier          |
| `radiation.spe_duration_h`                  | 12                    | h            | ASSUMPTION | low        | Solar particle event typical duration        |
| `radiation.spe_warning_lead_h`              | 2                     | h            | ASSUMPTION | low        | Space weather early warning window           |
| `radiation.spe_per_month`                   | 1.0                   | events/30d   | ASSUMPTION | low        | Poisson arrival rate for solar storms        |
| `radiation.dose_limit_usv_mission`          | 60000                 | µSv          | ASSUMPTION | low        | 30-day cumulative career limit proxy         |
| `power.panel_kw`                            | 10                    | kW/panel     | ASSUMPTION | low        | High-efficiency solar array unit rating      |
| `power.battery_kwh_per_unit`                | 100                   | kWh/unit     | ASSUMPTION | low        | Regenerative modular battery pack rating     |
| `power.charge_efficiency`                   | 0.9                   | fraction     | ASSUMPTION | low        | Round-trip battery charge efficiency         |
| `power.dust_events_per_month`               | 1.5                   | events/30d   | ASSUMPTION | low        | Regolith lofting storm frequency             |
| `power.dust_factor`                         | 0.85                  | factor       | ASSUMPTION | low        | Dust obscuration solar derating factor       |
| `power.dust_duration_h`                     | 72                    | h            | ASSUMPTION | low        | Dust settling duration                       |
| `power.array_failure_factor`                | 0.75                  | factor       | ASSUMPTION | low        | Loss of 1 of 4 internal solar strings        |
| `power.mast_dark_reduction_per_level`       | 0.1                   | frac/level   | S03        | low        | Elevation mast illumination gain             |
| `power.thermal_dark_multiplier`             | 1.5                   | x            | ASSUMPTION | low        | Nighttime heating power multiplier           |
| `load.life_support_kw`                      | 5                     | kW           | ASSUMPTION | low        | Nominal ECLSS base electrical load           |
| `load.thermal_kw`                           | 4                     | kW           | ASSUMPTION | low        | Nominal habitat thermal conditioning         |
| `load.comms_kw`                             | 1                     | kW           | ASSUMPTION | low        | Deep space communication transmitter         |
| `load.greenhouse_kw_per_module`             | 3                     | kW/mod       | ASSUMPTION | low        | Hydroponic LED and fluid pumps               |
| `load.science_kw`                           | 3                     | kW           | ASSUMPTION | low        | Surface scientific research instruments      |
| `load.construction_kw`                      | 3                     | kW           | ASSUMPTION | low        | Regolith robotic 3D printer / sintered       |
| `site.ridge.dark_starts_h`                  | [200, 560]            | h            | S09        | medium     | Malapert Ridge night window schedule         |
| `site.ridge.dark_length_h`                  | 36                    | h            | S09        | medium     | Malapert Ridge night duration (10% total)    |
| `site.ridge.start_water_kg`                 | 600                   | kg           | ASSUMPTION | low        | Ridge starting water reserve                 |
| `site.crater_edge.dark_starts_h`            | [120, 330, 540]       | h            | S03        | medium     | Shackleton Rim night window schedule         |
| `site.crater_edge.dark_length_h`            | 72                    | h            | S03        | medium     | Shackleton Rim night duration (30% total)    |
| `site.crater_edge.start_water_kg`           | 900                   | kg           | ASSUMPTION | low        | Volatiles-adjacent crater water reserve      |
| `site.dark_jitter_h`                        | 24                    | h            | ASSUMPTION | low        | Orbital precession start hour jitter         |
| `start.o2_tank_kg`                          | 130                   | kg           | ASSUMPTION | low        | Pressurized oxygen storage tank              |
| `start.food_kcal`                           | 220000                | kcal         | ASSUMPTION | low        | Stored dehydrated food reserves              |
| `greenhouse.kcal_per_module_per_day`        | 5000                  | kcal/d       | ASSUMPTION | low        | Fresh crops caloric yield                    |
| `greenhouse.water_kg_per_module_per_day`    | 3                     | kg/d         | ASSUMPTION | low        | Crop transpiration fluid consumption         |
| `greenhouse.crew_hours_per_module_per_tick` | 0.2                   | h            | ASSUMPTION | low        | Crop maintenance crew attention              |
| `greenhouse.low_power_factor`               | 0.5                   | factor       | ASSUMPTION | low        | Emergency reduced illumination yield         |
| `construction.hours_per_shield_layer`       | 40                    | crew-h       | ASSUMPTION | low        | Robotic sintering build labor per layer      |
| `science.target_hours`                      | 120                   | crew-h       | ASSUMPTION | low        | Primary mission science success bar          |
| `science.max_hours_per_tick`                | 0.6                   | h            | ASSUMPTION | low        | Max science productivity cap per hour        |
| `failure.mtbf_h.co2_scrubber`               | 900                   | h            | ASSUMPTION | low        | Mean time between failures                   |
| `failure.mtbf_h.o2_generator`               | 1100                  | h            | ASSUMPTION | low        | Mean time between failures                   |
| `failure.mtbf_h.water_processor`            | 800                   | h            | ASSUMPTION | low        | Mean time between failures                   |
| `failure.mtbf_h.power_array`                | 1500                  | h            | ASSUMPTION | low        | Mean time between failures                   |
| `repair.hours.co2_scrubber`                 | 6                     | crew-h       | ASSUMPTION | low        | Crew repair time with spare                  |
| `repair.hours.o2_generator`                 | 10                    | crew-h       | ASSUMPTION | low        | Crew repair time with spare                  |
| `repair.hours.water_processor`              | 12                    | crew-h       | ASSUMPTION | low        | Crew repair time with spare                  |
| `repair.hours.power_array`                  | 8                     | crew-h       | ASSUMPTION | low        | Crew repair time with spare                  |
| `mass.budget`                               | 120                   | mu           | ASSUMPTION | low        | Total lander payload mass limit              |
| `mass.panel`                                | 5                     | mu           | ASSUMPTION | low        | Solar panel mass unit cost                   |
| `mass.mast_level`                           | 6                     | mu/level     | ASSUMPTION | low        | Mast tower structural mass                   |
| `mass.battery`                              | 5                     | mu           | ASSUMPTION | low        | Battery unit mass cost                       |
| `mass.water_tier1`                          | 8                     | mu           | ASSUMPTION | low        | Brine processor upgrade mass cost            |
| `mass.o2_tier1`                             | 10                    | mu           | ASSUMPTION | low        | Sabatier reactor upgrade mass cost           |
| `mass.greenhouse_module`                    | 10                    | mu           | ASSUMPTION | low        | Hydroponic greenhouse module mass cost       |
| `mass.shield_layer`                         | 12                    | mu           | ASSUMPTION | low        | Sintering regolith frame mass cost           |
| `mass.spare`                                | 3                     | mu           | ASSUMPTION | low        | Modular component replacement spare mass     |
| `rating.flight_ready_survival`              | 0.95                  | fraction     | ASSUMPTION | low        | Game certification threshold (95%)           |
| `rating.flight_ready_success`               | 0.8                   | fraction     | ASSUMPTION | low        | Game science completion threshold (80%)      |

---

## 5. Authoritative References (`docs/SOURCES.md`)

- **S01:** Anderson, Ewert & Keener (2018). _Life Support Baseline Values and Assumptions Document (BVAD)_, NASA/TP-2015-218570/REV1.
- **S02:** Zhang, S. et al. (2020). _First measurements of the radiation dose on the lunar surface_. Science Advances 6(39), eaaz1334.
- **S03:** Ross, A. et al. (2021). _Towers on the Peaks of Eternal Light: Quantifying Available Solar Power_. arXiv:2102.11766.
- **S04:** NASA (2025). _Environmental Control and Life Support System (ECLSS) Fact Sheet_.
- **S05:** NASA. _Sabatier Carbon Dioxide Reduction Assembly Development_.
- **S06:** NASA (2011). _Probabilistic Risk Assessment Procedures Guide_, NASA/SP-2011-3421.
- **S08:** Frontiers in Space Technologies (2024). _Assessment of physical and psychological aspects of ECLSS on ISS_.
- **S09:** Wood, C. (2017). _Peaks of "Eternal" Light_, Sky & Telescope.
- **S10:** ECLSS Sizing Reference (Secondary source citing NASA-STD-3001 and BVAD).
