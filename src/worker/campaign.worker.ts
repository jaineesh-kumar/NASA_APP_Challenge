// Runs runCampaign off the main thread so the UI stays responsive.
// Spec B3, B5.7

import { runCampaign } from '../engine/montecarlo.ts';
import { CampaignResult, Design, Rules, StormMode } from '../engine/types.ts';

export interface WorkerIncomingMessage {
  type: 'RUN_CAMPAIGN';
  id: number;
  design: Design;
  rules: Rules;
  stormMode: StormMode;
  runs?: number;
}

export type WorkerOutgoingMessage =
  | { type: 'PROGRESS'; id: number; progress: number }
  | { type: 'RESULT'; id: number; result: CampaignResult }
  | { type: 'ERROR'; id: number; error: string };

/** Pure handler so tests can drive the worker protocol without a real Worker. */
export function handleWorkerMessage(
  data: WorkerIncomingMessage,
  post: (msg: WorkerOutgoingMessage) => void,
): void {
  try {
    const result = runCampaign(
      data.design,
      data.rules,
      data.runs,
      undefined,
      (progress) => post({ type: 'PROGRESS', id: data.id, progress }),
      { stormMode: data.stormMode },
    );
    post({ type: 'RESULT', id: data.id, result });
  } catch (err) {
    post({ type: 'ERROR', id: data.id, error: err instanceof Error ? err.message : String(err) });
  }
}

// Guard so importing this module in tests (jsdom window) does not hijack onmessage.
if (typeof window === 'undefined' && typeof self !== 'undefined') {
  self.onmessage = (event: MessageEvent<WorkerIncomingMessage>) => {
    if (event.data?.type === 'RUN_CAMPAIGN') {
      handleWorkerMessage(event.data, (msg) => self.postMessage(msg));
    }
  };
}
