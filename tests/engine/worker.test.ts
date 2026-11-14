import { describe, expect, it } from 'vitest';
import { runCampaign } from '../../src/engine/montecarlo.ts';
import { handleWorkerMessage, WorkerOutgoingMessage } from '../../src/worker/campaign.worker.ts';
import { goldenDesign, goldenRules } from './fixtures.ts';

describe('campaign worker (L5 AC9)', () => {
  it('AC9: the worker result equals calling runCampaign directly', () => {
    const msgs: WorkerOutgoingMessage[] = [];
    handleWorkerMessage(
      {
        type: 'RUN_CAMPAIGN',
        id: 7,
        design: goldenDesign,
        rules: goldenRules,
        sunEra: 'quiet',
        runs: 25,
      },
      (m) => msgs.push(m),
    );
    const last = msgs.at(-1);
    expect(last?.type).toBe('RESULT');
    expect(msgs.some((m) => m.type === 'PROGRESS')).toBe(true);
    if (last?.type === 'RESULT') {
      expect(last.id).toBe(7);
      expect(last.result).toEqual(
        runCampaign(goldenDesign, goldenRules, 25, undefined, undefined, { sunEra: 'quiet' }),
      );
    }
  });

  it('reports engine errors instead of crashing', () => {
    const msgs: WorkerOutgoingMessage[] = [];
    const bad = { ...goldenRules, priority: goldenRules.priority.slice(1) };
    handleWorkerMessage(
      { type: 'RUN_CAMPAIGN', id: 1, design: goldenDesign, rules: bad, sunEra: 'all', runs: 2 },
      (m) => msgs.push(m),
    );
    expect(msgs.at(-1)?.type).toBe('ERROR');
  });
});
