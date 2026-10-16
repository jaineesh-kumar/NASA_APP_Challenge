// Global state management using useReducer and Context
// Spec B2, B5.2, Part C (L6, L7)

import React, { createContext, useContext, useReducer } from 'react';
import { missionPresets, MissionPreset } from '../content/missions.ts';
import { isWithinBudget, massUsed } from '../engine/mass.ts';
import { loadParams } from '../engine/params.ts';
import {
  CampaignResult,
  ComponentId,
  Design,
  IfThenRule,
  LoadId,
  MissionResult,
  Rules,
  SiteId,
} from '../engine/types.ts';

export type ScreenId =
  | 'briefing'
  | 'design'
  | 'rules'
  | 'rehearse'
  | 'review'
  | 'learn'
  | 'model_card';

export interface AppState {
  currentScreen: ScreenId;
  design: Design;
  rules: Rules;
  massUsed: number;
  isWithinBudget: boolean;
  campaignResult: CampaignResult | null;
  worstMissionResult: MissionResult | null;
  isRunningCampaign: boolean;
  campaignProgress: number;
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
  | { type: 'START_CAMPAIGN' }
  | { type: 'SET_CAMPAIGN_PROGRESS'; progress: number }
  | {
      type: 'SET_CAMPAIGN_RESULT';
      result: CampaignResult;
      worstRun: MissionResult;
    };

const defaultParams = loadParams();
const initialPreset = missionPresets[0]!;

export const initialAppState: AppState = {
  currentScreen: 'briefing',
  design: initialPreset.design,
  rules: initialPreset.rules,
  massUsed: massUsed(initialPreset.design, defaultParams),
  isWithinBudget: isWithinBudget(initialPreset.design, defaultParams),
  campaignResult: null,
  worstMissionResult: null,
  isRunningCampaign: false,
  campaignProgress: 0,
};

export function appReducer(state: AppState, action: Action): AppState {
  let nextDesign = state.design;
  let nextRules = state.rules;

  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.screen };

    case 'START_CAMPAIGN':
      return { ...state, isRunningCampaign: true, campaignProgress: 0 };

    case 'SET_CAMPAIGN_PROGRESS':
      return { ...state, campaignProgress: action.progress };

    case 'SET_CAMPAIGN_RESULT':
      return {
        ...state,
        isRunningCampaign: false,
        campaignProgress: 1.0,
        campaignResult: action.result,
        worstMissionResult: action.worstRun,
      };

    case 'SET_SITE':
      nextDesign = { ...state.design, site: action.site };
      break;

    case 'SET_PANELS':
      nextDesign = {
        ...state.design,
        panels: Math.max(1, Math.min(8, Math.floor(action.panels))),
      };
      break;

    case 'SET_MAST':
      nextDesign = { ...state.design, mastLevel: action.mastLevel };
      break;

    case 'SET_BATTERIES':
      nextDesign = {
        ...state.design,
        batteries: Math.max(1, Math.min(12, Math.floor(action.batteries))),
      };
      break;

    case 'SET_WATER_TIER':
      nextDesign = { ...state.design, waterLoopTier: action.tier };
      break;

    case 'SET_O2_TIER':
      nextDesign = { ...state.design, o2LoopTier: action.tier };
      break;

    case 'SET_GREENHOUSE':
      nextDesign = { ...state.design, greenhouseModules: action.modules };
      break;

    case 'SET_SHIELDING':
      nextDesign = { ...state.design, shieldingLayers: action.layers };
      break;

    case 'SET_SPARE':
      nextDesign = {
        ...state.design,
        spares: {
          ...state.design.spares,
          [action.component]: action.count,
        },
      };
      break;

    case 'SET_PRIORITY':
      nextRules = { ...state.rules, priority: action.priority };
      break;

    case 'MOVE_PRIORITY': {
      const { index, direction } = action;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= state.rules.priority.length) {
        return state;
      }
      const newPriority = [...state.rules.priority];
      const itemToMove = newPriority[index];
      const itemToSwap = newPriority[targetIndex];
      if (itemToMove && itemToSwap) {
        newPriority[index] = itemToSwap;
        newPriority[targetIndex] = itemToMove;
      }
      nextRules = { ...state.rules, priority: newPriority };
      break;
    }

    case 'ADD_RULE':
      if (state.rules.ifThen.length >= 5) {
        return state;
      }
      nextRules = {
        ...state.rules,
        ifThen: [...state.rules.ifThen, action.rule],
      };
      break;

    case 'REMOVE_RULE':
      nextRules = {
        ...state.rules,
        ifThen: state.rules.ifThen.filter((_, idx) => idx !== action.index),
      };
      break;

    case 'SET_PRESET':
      nextDesign = action.preset.design;
      nextRules = action.preset.rules;
      break;

    default:
      return state;
  }

  const updatedMass = massUsed(nextDesign, defaultParams);
  const updatedWithinBudget = isWithinBudget(nextDesign, defaultParams);

  return {
    ...state,
    design: nextDesign,
    rules: nextRules,
    massUsed: updatedMass,
    isWithinBudget: updatedWithinBudget,
  };
}

interface AppStoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppStoreContext = createContext<AppStoreContextType | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  return (
    <AppStoreContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore(): AppStoreContextType {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
}
