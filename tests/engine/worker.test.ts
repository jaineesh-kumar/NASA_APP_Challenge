import { describe, expect, it, vi } from 'vitest';
import { runCampaign } from '../../src/engine/montecarlo.ts';
import { WorkerOutgoingMessage } from '../../src/worker/campaign.worker.ts';
import { goldenDesign, goldenRules } from './sim.test.ts';

describe('campaign web worker protocol (Spec B5.7, AC7)', () => {
  it('posts progress messages and returns valid CampaignResult (AC7)', () => {
    const postedMessages: WorkerOutgoingMessage[] = [];
    const mockPostMessage = vi.fn((msg: WorkerOutgoingMessage) => {
      postedMessages.push(msg);
    });

    // Simulate worker logic
    const design = goldenDesign;
    const rules = goldenRules;
    const runs = 20;

    const result = runCampaign(design, rules, runs, undefined, (progress) => {
      mockPostMessage({
        type: 'PROGRESS',
        id: 'test-123',
        progress,
      });
    });

    mockPostMessage({
      type: 'RESULT',
      id: 'test-123',
      result,
    });

    expect(postedMessages.length).toBeGreaterThan(1);
    const progressMessages = postedMessages.filter(
      (m): m is Extract<WorkerOutgoingMessage, { type: 'PROGRESS' }> => m.type === 'PROGRESS',
    );
    expect(progressMessages.length).toBeGreaterThan(0);

    const finalMsg = postedMessages[postedMessages.length - 1];
    expect(finalMsg?.type).toBe('RESULT');
    if (finalMsg && finalMsg.type === 'RESULT') {
      expect(finalMsg.result.runs).toBe(runs);
      expect(finalMsg.result.survivalRate).toBeGreaterThanOrEqual(0);
      expect(finalMsg.result.rating).toBeDefined();
    }
  });
});
