// Power Juggle (Training Bay): get the base through one dark window on battery alone.
// The player switches machines on and off; every hour runs through the engine's own power
// functions (computeDemands, allocatePower, updateBattery), with numbers from params.json.
// The base is the Balanced starter kit; the dark lasts one Sunny Ridge dark window.

import { missionPresets } from '../../content/missions.ts';
import { getSimConstants, SimConstants } from '../../engine/constants.ts';
import { LOAD_IDS } from '../../engine/constants.ts';
import { loadParams } from '../../engine/params.ts';
import {
  allocatePower,
  computeDemands,
  computeGeneration,
  updateBattery,
} from '../../engine/power.ts';
import { Design, LoadId } from '../../engine/types.ts';

export type JuggleOutcome = 'playing' | 'sunrise' | 'trouble';

/** Machines the crew cannot live without in the dark. */
export const ESSENTIAL_LOADS: readonly LoadId[] = ['life_support', 'thermal'];

export interface JuggleState {
  hour: number;
  batteryKwh: number;
  isOn: Record<LoadId, boolean>;
  /** Load-hours of greenhouse, science and shield building finished. */
  workHours: number;
  outcome: JuggleOutcome;
  /** The essential machine that lost power, when outcome is 'trouble'. */
  troubleLoad: LoadId | null;
  /** Machines the battery could not power in the last hour. */
  starvedLastHour: LoadId[];
}

export interface JuggleSetup {
  design: Design;
  darkHours: number;
  capacityKwh: number;
  k: SimConstants;
}

const WORK_LOADS: readonly LoadId[] = ['greenhouse', 'science', 'construction'];

export function juggleSetup(): JuggleSetup {
  const params = loadParams();
  const k = getSimConstants(params);
  const kit = missionPresets.find((p) => p.id === 'balanced') ?? missionPresets[0];
  if (!kit) throw new Error('Power Juggle needs a starter kit.');
  return {
    design: kit.design,
    darkHours: k.darkLengthH.ridge,
    capacityKwh: kit.design.batteries * k.batteryKwhPerUnit,
    k,
  };
}

export function newJuggle(setup: JuggleSetup): JuggleState {
  const isOn = Object.fromEntries(LOAD_IDS.map((l) => [l, true])) as Record<LoadId, boolean>;
  return {
    hour: 0,
    batteryKwh: setup.capacityKwh,
    isOn,
    workHours: 0,
    outcome: 'playing',
    troubleLoad: null,
    starvedLastHour: [],
  };
}

/** Power each machine asks for in the dark right now (kW), or 0 when switched off. */
export function juggleDemands(setup: JuggleSetup, state: JuggleState): Record<LoadId, number> {
  const forcedOff = new Set(LOAD_IDS.filter((l) => !state.isOn[l]));
  return computeDemands(
    setup.design,
    {
      inDarkWindow: true,
      ghLow: false,
      pauseScience: false,
      isSheltering: false,
      allShieldsBuilt: setup.design.shieldingLayers === 0,
      forcedOff,
    },
    setup.k,
  );
}

/** Hours the battery would last with the machines that are on now. */
export function hoursLeft(setup: JuggleSetup, state: JuggleState): number {
  const total = Object.values(juggleDemands(setup, state)).reduce((a, b) => a + b, 0);
  return total > 0 ? Math.floor(state.batteryKwh / total) : Infinity;
}

export function toggleLoad(state: JuggleState, load: LoadId): JuggleState {
  if (state.outcome !== 'playing') return state;
  return { ...state, isOn: { ...state.isOn, [load]: !state.isOn[load] } };
}

/** Runs one dark hour (Spec B5.4 steps 3-4, generation is zero in the dark). */
export function runHour(setup: JuggleSetup, state: JuggleState): JuggleState {
  if (state.outcome !== 'playing') return state;
  const forcedOff = new Set(LOAD_IDS.filter((l) => !state.isOn[l]));
  const demands = juggleDemands(setup, state);
  const genKw = computeGeneration(setup.design.panels, true, false, false, setup.k);
  const alloc = allocatePower(genKw + state.batteryKwh, LOAD_IDS, demands, forcedOff);
  const batteryKwh = updateBattery(
    state.batteryKwh,
    setup.capacityKwh,
    genKw,
    alloc.suppliedKw,
    setup.k,
  );
  const hour = state.hour + 1;
  const starved = LOAD_IDS.filter((l) => alloc.starved[l]);
  const lost = ESSENTIAL_LOADS.find((l) => !alloc.powered[l]) ?? null;
  const work = WORK_LOADS.filter((l) => alloc.powered[l] && demands[l] > 0).length;
  let outcome: JuggleOutcome = 'playing';
  if (lost) outcome = 'trouble';
  else if (hour >= setup.darkHours) outcome = 'sunrise';
  return {
    ...state,
    hour,
    batteryKwh,
    workHours: state.workHours + work,
    outcome,
    troubleLoad: lost,
    starvedLastHour: starved,
  };
}

/** The most work-hours any plan can finish: spare battery after the essentials, per job. */
export function bestPossibleWork(setup: JuggleSetup): number {
  const all = newJuggle(setup);
  const d = juggleDemands(setup, all);
  const essentialKwh = (d.life_support + d.thermal + d.comms) * setup.darkHours;
  const jobKw = Math.min(...WORK_LOADS.map((l) => d[l]).filter((v) => v > 0));
  const spare = setup.capacityKwh - essentialKwh;
  return spare > 0 && Number.isFinite(jobKw) ? Math.floor(spare / jobKw) : 0;
}
