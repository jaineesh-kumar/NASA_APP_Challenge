// App state: useReducer + Context (Spec B2; L6, L7)

import React, { createContext, useContext, useReducer } from 'react';
import { GuidedMission, MissionId, missionPresets, MissionPreset } from '../content/missions.ts';
import { isWithinBudget, massUsed } from '../engine/mass.ts';
import { loadParams } from '../engine/params.ts';
import { MAX_RULES } from '../engine/rules.ts';
import {
  CampaignResult,
  ComponentId,
  Design,
  IfThenRule,
  LoadId,
  MissionResult,
  Rules,
  SiteId,
  StormMode,
} from '../engine/types.ts';

/** B10.7: Junior Mode (ages 7-12, default) or Planner Mode (older players, teachers). */
export type PlayMode = 'junior' | 'planner';

export type ScreenId =
  'briefing' | 'design' | 'rules' | 'rehearse' | 'review' | 'learn' | 'model_card';

/** One tested design, for the mass-vs-risk chart (Spec B8: every design tried this session). */
export interface TriedDesign {
  n: number;
  massUsed: number;
  riskPct: number;
  stormMode: StormMode;
}

const MAX_HISTORY = 30;

/** The guided mission being played, if any (Missions page and How to play). */
export interface ActiveMission {
  id: MissionId;
  /** A fresh test has run since the mission was loaded. */
  hasTested: boolean;
  /** Crews home out of every 100 in the latest test of this mission. */
  lastHome: number | null;
}

export interface AppState {
  currentScreen: ScreenId;
  design: Design;
  rules: Rules;
  stormMode: StormMode;
  massUsed: number;
  isWithinBudget: boolean;
  campaignResult: CampaignResult | null;
  worstMissionResult: MissionResult | null;
  /** Design, rules or storm mode changed since the last campaign. */
  isResultStale: boolean;
  isRunningCampaign: boolean;
  campaignProgress: number;
  campaignError: string | null;
  history: TriedDesign[];
  mode: PlayMode;
  /** Index of the furthest mission step reached (for the Done stamps). */
  furthestStep: number;
  mission: ActiveMission | null;
}

export type Action =
  | { type: 'SET_SCREEN'; screen: ScreenId }
  | { type: 'SET_SITE'; site: SiteId }
  | { type: 'SET_PANELS'; panels: number }
  | { type: 'SET_MAST'; mastLevel: 0 | 1 | 2 | 3 }
  | { type: 'SET_BATTERIES'; batteries: number }
  | { type: 'SET_WATER_TIER'; tier: 0 | 1 }
  | { type: 'SET_O2_TIER'; tier: 0 | 1 }
  | { type: 'SET_GREENHOUSE'; modules: 0 | 1 | 2 | 3 }
  | { type: 'SET_SHIELDING'; layers: 0 | 1 | 2 | 3 }
  | { type: 'SET_SPARE'; component: ComponentId; count: 0 | 1 | 2 }
  | { type: 'SET_PRIORITY'; priority: LoadId[] }
  | { type: 'MOVE_PRIORITY'; index: number; direction: 'up' | 'down' }
  | { type: 'ADD_RULE'; rule: IfThenRule }
  | { type: 'REMOVE_RULE'; index: number }
  | { type: 'SET_PRESET'; preset: MissionPreset }
  | { type: 'LOAD_MISSION'; mission: GuidedMission }
  | { type: 'END_MISSION' }
  | { type: 'LOAD_SCENARIO'; design: Design; rules: Rules; stormMode?: StormMode }
  | { type: 'SET_STORM_MODE'; stormMode: StormMode }
  | { type: 'SET_MODE'; mode: PlayMode }
  | { type: 'START_CAMPAIGN' }
  | { type: 'SET_CAMPAIGN_PROGRESS'; progress: number }
  | { type: 'SET_CAMPAIGN_RESULT'; result: CampaignResult; worstRun: MissionResult }
  | { type: 'CAMPAIGN_FAILED'; message: string };

const params = loadParams();
const initialPreset = missionPresets[0];
if (!initialPreset) throw new Error('missionPresets must not be empty');

export const initialAppState: AppState = {
  currentScreen: 'briefing',
  design: initialPreset.design,
  rules: initialPreset.rules,
  stormMode: { kind: 'random' },
  massUsed: massUsed(initialPreset.design, params),
  isWithinBudget: isWithinBudget(initialPreset.design, params),
  campaignResult: null,
  worstMissionResult: null,
  isResultStale: false,
  isRunningCampaign: false,
  campaignProgress: 0,
  campaignError: null,
  history: [],
  mode: 'junior',
  furthestStep: 0,
  mission: null,
};

const FLOW_STEPS: readonly ScreenId[] = ['briefing', 'design', 'rules', 'rehearse', 'review'];

export function sameStormMode(a: StormMode, b: StormMode): boolean {
  return (
    a.kind === b.kind && (a.kind === 'random' || (b.kind === 'replay' && a.eventId === b.eventId))
  );
}

const clampInt = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.floor(v)));

function withConfig(
  state: AppState,
  design: Design,
  rules: Rules,
  stormMode = state.stormMode,
): AppState {
  const mass = massUsed(design, params);
  return {
    ...state,
    design,
    rules,
    stormMode,
    massUsed: mass,
    isWithinBudget: isWithinBudget(design, params),
    isResultStale: state.campaignResult !== null,
  };
}

/** Applies a design change only if it stays within the mass budget (L6 AC2). Removing is always allowed. */
function tryDesign(state: AppState, next: Design): AppState {
  const nextMass = massUsed(next, params);
  if (nextMass > state.massUsed && !isWithinBudget(next, params)) return state;
  return withConfig(state, next, state.rules);
}

export function appReducer(state: AppState, action: Action): AppState {
  const d = state.design;
  switch (action.type) {
    case 'SET_SCREEN':
      return {
        ...state,
        currentScreen: action.screen,
        furthestStep: Math.max(state.furthestStep, FLOW_STEPS.indexOf(action.screen)),
      };
    case 'START_CAMPAIGN':
      return { ...state, isRunningCampaign: true, campaignProgress: 0, campaignError: null };
    case 'SET_CAMPAIGN_PROGRESS':
      return { ...state, campaignProgress: action.progress };
    case 'CAMPAIGN_FAILED':
      return { ...state, isRunningCampaign: false, campaignError: action.message };
    case 'SET_CAMPAIGN_RESULT': {
      const n = (state.history.at(-1)?.n ?? 0) + 1;
      const entry: TriedDesign = {
        n,
        massUsed: action.result.massUsed,
        riskPct: (1 - action.result.survivalRate) * 100,
        stormMode: action.result.stormMode,
      };
      return {
        ...state,
        isRunningCampaign: false,
        campaignProgress: 1,
        campaignError: null,
        campaignResult: action.result,
        worstMissionResult: action.worstRun,
        isResultStale: false,
        history: [...state.history, entry].slice(-MAX_HISTORY),
        mission: state.mission
          ? {
              ...state.mission,
              hasTested: true,
              lastHome: Math.round(action.result.survivalRate * 100),
            }
          : null,
      };
    }
    case 'SET_SITE':
      return tryDesign(state, { ...d, site: action.site });
    case 'SET_PANELS':
      return tryDesign(state, { ...d, panels: clampInt(action.panels, 1, 8) });
    case 'SET_MAST':
      return tryDesign(state, { ...d, mastLevel: action.mastLevel });
    case 'SET_BATTERIES':
      return tryDesign(state, { ...d, batteries: clampInt(action.batteries, 1, 12) });
    case 'SET_WATER_TIER':
      return tryDesign(state, { ...d, waterLoopTier: action.tier });
    case 'SET_O2_TIER':
      return tryDesign(state, { ...d, o2LoopTier: action.tier });
    case 'SET_GREENHOUSE':
      return tryDesign(state, { ...d, greenhouseModules: action.modules });
    case 'SET_SHIELDING':
      return tryDesign(state, { ...d, shieldingLayers: action.layers });
    case 'SET_SPARE':
      return tryDesign(state, { ...d, spares: { ...d.spares, [action.component]: action.count } });
    case 'SET_PRIORITY': {
      // Only accept a full permutation of the six loads (L6 AC3).
      const cur = new Set(state.rules.priority);
      const next = action.priority;
      if (
        next.length !== cur.size ||
        new Set(next).size !== cur.size ||
        next.some((l) => !cur.has(l))
      ) {
        return state;
      }
      return withConfig(state, d, { ...state.rules, priority: [...next] });
    }
    case 'MOVE_PRIORITY': {
      const to = action.direction === 'up' ? action.index - 1 : action.index + 1;
      const p = [...state.rules.priority];
      const a = p[action.index];
      const b = p[to];
      if (a === undefined || b === undefined) return state;
      p[action.index] = b;
      p[to] = a;
      return withConfig(state, d, { ...state.rules, priority: p });
    }
    case 'ADD_RULE':
      if (state.rules.ifThen.length >= MAX_RULES) return state;
      return withConfig(state, d, { ...state.rules, ifThen: [...state.rules.ifThen, action.rule] });
    case 'REMOVE_RULE':
      return withConfig(state, d, {
        ...state.rules,
        ifThen: state.rules.ifThen.filter((_, i) => i !== action.index),
      });
    case 'SET_PRESET':
      return withConfig(state, action.preset.design, action.preset.rules);
    case 'LOAD_MISSION':
      return {
        ...withConfig(state, action.mission.design, action.mission.rules, action.mission.stormMode),
        mission: { id: action.mission.id, hasTested: false, lastHome: null },
      };
    case 'END_MISSION':
      return { ...state, mission: null };
    case 'LOAD_SCENARIO':
      return withConfig(state, action.design, action.rules, action.stormMode ?? state.stormMode);
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_STORM_MODE':
      return sameStormMode(action.stormMode, state.stormMode)
        ? state
        : withConfig(state, d, state.rules, action.stormMode);
    default:
      return state;
  }
}

interface AppStoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppStoreContext = createContext<AppStoreContextType | null>(null);

export function AppStoreProvider({
  children,
  initialState = initialAppState,
}: {
  children: React.ReactNode;
  initialState?: AppState;
}) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const value = React.useMemo(() => ({ state, dispatch }), [state]);
  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreContextType {
  const context = useContext(AppStoreContext);
  if (!context) throw new Error('useAppStore must be used within an AppStoreProvider');
  return context;
}
