// Runs a campaign in the Web Worker (L7 AC1) and re-runs only the worst seed with a trace
// for the replay. Falls back to the main thread if workers are unavailable (L9 AC3).

import { useCallback, useEffect, useRef } from 'react';
import { getSimConstants } from '../engine/constants.ts';
import { runCampaign } from '../engine/montecarlo.ts';
import { loadParams } from '../engine/params.ts';
import { runMission } from '../engine/sim.ts';
import { CampaignResult } from '../engine/types.ts';
import type { WorkerIncomingMessage, WorkerOutgoingMessage } from '../worker/campaign.worker.ts';
import { useAppStore } from './store.tsx';

const params = loadParams();
export const CAMPAIGN_RUNS = getSimConstants(params).campaignRuns;

export function useCampaign() {
  const { state, dispatch } = useAppStore();
  const workerRef = useRef<Worker | null>(null);
  const requestId = useRef(0);

  useEffect(() => () => workerRef.current?.terminate(), []);

  const start = useCallback(() => {
    const { design, rules, stormMode } = state;
    const id = ++requestId.current;
    dispatch({ type: 'START_CAMPAIGN' });

    const finish = (result: CampaignResult) => {
      if (id !== requestId.current) return; // a newer run replaced this one
      const worstRun = runMission(design, rules, result.worstSeed, params, {
        stormMode,
        trace: true,
      });
      dispatch({ type: 'SET_CAMPAIGN_RESULT', result, worstRun });
    };
    const fail = (err: unknown) => {
      if (id !== requestId.current) return;
      dispatch({
        type: 'CAMPAIGN_FAILED',
        message: err instanceof Error ? err.message : String(err),
      });
    };
    const runHere = () => {
      // Yield one frame so the progress state paints before the blocking run.
      setTimeout(() => {
        try {
          finish(
            runCampaign(
              design,
              rules,
              CAMPAIGN_RUNS,
              params,
              (p) => dispatch({ type: 'SET_CAMPAIGN_PROGRESS', progress: p }),
              {
                stormMode,
              },
            ),
          );
        } catch (err) {
          fail(err);
        }
      }, 0);
    };

    if (typeof Worker === 'undefined') {
      runHere();
      return;
    }
    try {
      workerRef.current?.terminate();
      const worker = new Worker(new URL('../worker/campaign.worker.ts', import.meta.url), {
        type: 'module',
      });
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<WorkerOutgoingMessage>) => {
        const msg = event.data;
        if (msg.id !== id) return;
        if (msg.type === 'PROGRESS')
          dispatch({ type: 'SET_CAMPAIGN_PROGRESS', progress: msg.progress });
        else {
          worker.terminate();
          workerRef.current = null;
          if (msg.type === 'RESULT') finish(msg.result);
          else fail(new Error(msg.error));
        }
      };
      worker.onerror = () => {
        worker.terminate();
        workerRef.current = null;
        runHere();
      };
      const payload: WorkerIncomingMessage = {
        type: 'RUN_CAMPAIGN',
        id,
        design,
        rules,
        stormMode,
        runs: CAMPAIGN_RUNS,
      };
      worker.postMessage(payload);
    } catch {
      runHere();
    }
  }, [state, dispatch]);

  return { start };
}
