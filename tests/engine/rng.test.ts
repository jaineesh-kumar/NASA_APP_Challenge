import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../src/engine/rng.ts';

describe('mulberry32 RNG (Spec B5.3, AC3, AC4)', () => {
  it('yields identical first 1000 values for the same seed, all in [0, 1)', () => {
    const seed = 42;
    const rng1 = mulberry32(seed);
    const rng2 = mulberry32(seed);

    const sequence1: number[] = [];
    const sequence2: number[] = [];

    for (let i = 0; i < 1000; i++) {
      const v1 = rng1();
      const v2 = rng2();

      expect(v1).toBeGreaterThanOrEqual(0);
      expect(v1).toBeLessThan(1);
      expect(v2).toBeGreaterThanOrEqual(0);
      expect(v2).toBeLessThan(1);

      sequence1.push(v1);
      sequence2.push(v2);
    }

    expect(sequence1).toEqual(sequence2);
  });

  it('yields different sequences for different seeds', () => {
    const rngA = mulberry32(1);
    const rngB = mulberry32(2);

    let identicalCount = 0;
    const testCount = 50;

    for (let i = 0; i < testCount; i++) {
      if (rngA() === rngB()) {
        identicalCount++;
      }
    }

    // Two different seeds must produce different sequences
    expect(identicalCount).toBeLessThan(5);
  });

  it('handles negative or large seeds deterministically', () => {
    const rngNeg1 = mulberry32(-12345);
    const rngNeg2 = mulberry32(-12345);

    for (let i = 0; i < 100; i++) {
      expect(rngNeg1()).toBe(rngNeg2());
    }
  });
});
