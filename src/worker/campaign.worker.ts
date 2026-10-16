// Web worker for running Monte Carlo campaign off the main thread
// Spec B3, B5.7

import { runCampaign } from '../engine/montecarlo.ts';
import { CampaignResult, Design, Rules } from '../engine/types.ts';

export interface WorkerIncomingMessage {
  type: 'RUN_CAMPAIGN';
  id?: string;
  design: Design;
  rules: Rules;
  runs?: number;
}

export type WorkerOutgoingMessage =
  | { type: 'PROGRESS'; id?: string; progress: number }
  | { type: 'RESULT'; id?: string; result: CampaignResult }
  | { type: 'ERROR'; id?: string; error: string };

self.onmessage = (event: MessageEvent<WorkerIncomingMessage>) => {
  const data = event.data;

  if (data && data.type === 'RUN_CAMPAIGN') {
    try {
      const result = runCampaign(
        data.design,
        data.rules,
        data.runs ?? 300,
        undefined,
        (progress: number) => {
          self.postMessage({
            type: 'PROGRESS',
            id: data.id,
            progress,
          } satisfies WorkerOutgoingMessage);
        },
      );

      self.postMessage({
        type: 'RESULT',
        id: data.id,
        result,
      } satisfies WorkerOutgoingMessage);
    } catch (err) {
      self.postMessage({
        type: 'ERROR',
        id: data.id,
        error: err instanceof Error ? err.message : String(err),
      } satisfies WorkerOutgoingMessage);
    }
  }
};
