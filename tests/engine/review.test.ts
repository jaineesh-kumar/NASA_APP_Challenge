import { describe, expect, it } from 'vitest';
import { buildCauseChain } from '../../src/engine/review.ts';
import { runMission } from '../../src/engine/sim.ts';
import { LogEntry, LogType } from '../../src/engine/types.ts';
import { goldenDesign, goldenRules, params } from './fixtures.ts';

describe('cause chain (L5 AC11, Spec B5.9)', () => {
  it('no failure -> no chain', () => {
    expect(buildCauseChain([])).toEqual({ failure: null, chain: [], concept: null });
  });

  it('follows the B5.9 table: oxygen <- life support off <- battery empty <- dark window', () => {
    const log: LogEntry[] = [
      { t: 100, type: 'dark_window_start', detail: '' },
      { t: 120, type: 'battery_empty', detail: '' },
      { t: 121, type: 'load_off', detail: 'life_support' },
      { t: 124, type: 'failure', detail: 'oxygen' },
    ];
    const r = buildCauseChain(log);
    expect(r.chain.map((l) => l.cause.type)).toEqual([
      'load_off',
      'battery_empty',
      'dark_window_start',
    ]);
    expect(r.concept).toBe('margin');
  });

  it('dose chain reaches the comms link when a warning was missed', () => {
    const log: LogEntry[] = [
      { t: 10, type: 'rule_fired', detail: 'shed comms when battery_below_pct 30' },
      { t: 50, type: 'warning_missed', detail: 'X' },
      { t: 50, type: 'spe_start', detail: 'unsheltered' },
      { t: 60, type: 'failure', detail: 'dose' },
    ];
    const r = buildCauseChain(log);
    expect(r.chain.map((l) => l.cause.type)).toEqual(['spe_start', 'warning_missed', 'rule_fired']);
    expect(r.concept).toBe('communication');
  });

  it('AC11 property: every link is a real entry, earlier than its effect, max 5 links', () => {
    const types: LogType[] = [
      'dark_window_start',
      'dust_start',
      'component_failed',
      'battery_empty',
      'load_off',
      'rule_fired',
      'spe_start',
      'warning_missed',
      'spe_warning',
      'shield_layer_built',
    ];
    const details = [
      '',
      'life_support',
      'comms',
      'greenhouse',
      'o2_generator',
      'co2_scrubber',
      'unsheltered',
      'shed comms when x',
    ];
    let state = 12345;
    const rand = () => (state = (state * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let trial = 0; trial < 300; trial++) {
      const log: LogEntry[] = [];
      const n = Math.floor(rand() * 40);
      for (let i = 0; i < n; i++) {
        log.push({
          t: i,
          type: types[Math.floor(rand() * types.length)] ?? 'dust_start',
          detail: details[Math.floor(rand() * details.length)] ?? '',
        });
      }
      const causes = ['oxygen', 'co2', 'water', 'food', 'dose'];
      log.push({ t: n, type: 'failure', detail: causes[trial % 5] ?? 'oxygen' });
      const r = buildCauseChain(log);
      expect(r.chain.length).toBeLessThanOrEqual(5);
      for (const link of r.chain) {
        expect(log).toContain(link.cause);
        expect(log.indexOf(link.cause)).toBeLessThan(log.indexOf(link.effect));
      }
    }
  });

  it('works on real failed missions', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const m = runMission({ ...goldenDesign, batteries: 2 }, goldenRules, seed, params);
      const r = buildCauseChain(m);
      if (!m.survived) {
        expect(r.failure?.detail).toBe(m.failureCause);
        expect(r.concept).not.toBeNull();
      }
    }
  });
});
