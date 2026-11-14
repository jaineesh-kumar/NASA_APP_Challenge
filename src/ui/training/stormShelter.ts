// Storm Shelter (Training Bay): one work day while a real archived DONKI storm hits.
// A radio warning comes radiation.spe_warning_lead_h hours before the storm; the player
// decides each hour whether the crew works outside or hides. Dose per hour uses the engine's
// hourlyDoseUsv with the storm strength for the event's flare class (B5.11). The storm's
// start hour is drawn with the engine's seeded mulberry32, so a round number always gives the
// same day.

import { getSimConstants, SimConstants } from '../../engine/constants.ts';
import { flareClassIndex, getDonkiArchive, loadParams } from '../../engine/params.ts';
import { hourlyDoseUsv } from '../../engine/radiation.ts';
import { mulberry32 } from '../../engine/rng.ts';
import { DonkiEvent } from '../../engine/types.ts';

/** Hours in one Storm Shelter round: one Moon-base work day. */
export const DAY_HOURS = 24;

export type ShelterOutcome = 'playing' | 'done';

export interface ShelterRound {
  storm: DonkiEvent;
  /** Hour the radio warning arrives. */
  warningH: number;
  /** First storm hour (inclusive) and the hour after the last storm hour. */
  onsetH: number;
  endH: number;
  /** Storm strength for this flare class (radiation.spe_multiplier_by_flare_class). */
  multiplier: number;
}

export interface ShelterState {
  hour: number;
  isSheltering: boolean;
  doseUsv: number;
  workHours: number;
  /** Storm hours the crew spent outside the shelter. */
  exposedStormHours: number;
  outcome: ShelterOutcome;
}

export interface ShelterSetup {
  k: SimConstants;
  storms: readonly DonkiEvent[];
}

export function shelterSetup(): ShelterSetup {
  return { k: getSimConstants(loadParams()), storms: getDonkiArchive().events };
}

/** Round n replays storm n of the archive (cycling), at a seeded start hour. */
export function newRound(setup: ShelterSetup, round: number): ShelterRound {
  const storm = setup.storms[round % setup.storms.length];
  if (!storm) throw new Error('Storm Shelter needs at least one archived storm.');
  const lead = setup.k.speWarningLeadH;
  const duration = setup.k.speDurationH;
  // The warning must fit after hour 0 and the storm must end inside the day.
  const earliest = lead + 1;
  const latest = Math.max(earliest, DAY_HOURS - duration);
  const onsetH = earliest + Math.floor(mulberry32(round + 1)() * (latest - earliest + 1));
  return {
    storm,
    warningH: onsetH - lead,
    onsetH,
    endH: Math.min(DAY_HOURS, onsetH + duration),
    multiplier: setup.k.speMultiplierByFlareClass[flareClassIndex(storm.flareClass)] ?? 1,
  };
}

export function newShelterState(): ShelterState {
  return {
    hour: 0,
    isSheltering: false,
    doseUsv: 0,
    workHours: 0,
    exposedStormHours: 0,
    outcome: 'playing',
  };
}

export const isStormHour = (r: ShelterRound, h: number) => h >= r.onsetH && h < r.endH;
export const isWarningOn = (r: ShelterRound, h: number) => h >= r.warningH && h < r.endH;

export function setSheltering(state: ShelterState, isSheltering: boolean): ShelterState {
  return state.outcome === 'playing' ? { ...state, isSheltering } : state;
}

/** Plays the current hour with the crew where the player put it. */
export function playHour(setup: ShelterSetup, round: ShelterRound, s: ShelterState): ShelterState {
  if (s.outcome !== 'playing') return s;
  const isStorm = isStormHour(round, s.hour);
  const dose = hourlyDoseUsv(0, s.isSheltering, isStorm ? round.multiplier : 1, setup.k);
  const hour = s.hour + 1;
  return {
    ...s,
    hour,
    doseUsv: s.doseUsv + dose,
    workHours: s.workHours + (s.isSheltering ? 0 : 1),
    exposedStormHours: s.exposedStormHours + (isStorm && !s.isSheltering ? 1 : 0),
    outcome: hour >= DAY_HOURS ? 'done' : 'playing',
  };
}

/** Dose for the whole day if the crew never hides, and if it hides for exactly the storm. */
export function referenceDoses(setup: ShelterSetup, round: ShelterRound) {
  let never = 0;
  let smart = 0;
  for (let h = 0; h < DAY_HOURS; h++) {
    const mult = isStormHour(round, h) ? round.multiplier : 1;
    never += hourlyDoseUsv(0, false, mult, setup.k);
    smart += hourlyDoseUsv(0, isStormHour(round, h), mult, setup.k);
  }
  return { never, smart, smartWork: DAY_HOURS - (round.endH - round.onsetH) };
}
