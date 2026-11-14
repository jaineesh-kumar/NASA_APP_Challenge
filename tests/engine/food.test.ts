import { describe, expect, it } from 'vitest';
import { stepFood } from '../../src/engine/food.ts';
import { mulberry32 } from '../../src/engine/rng.ts';
import { k } from './fixtures.ts';

describe('food (L4 AC9)', () => {
  it('AC9: food stock is never negative', () => {
    const rng = mulberry32(4);
    let food = k.foodNeedKcalPerH * 50;
    for (let t = 0; t < 2000; t++) {
      const r = stepFood(
        food,
        {
          modules: Math.floor(rng() * 4),
          isGreenhousePowered: rng() < 0.5,
          ghLow: rng() < 0.5,
          allocatedH: rng(),
          neededH: rng(),
          waterKg: rng() < 0.1 ? 0 : 100,
        },
        k,
      );
      expect(r.foodKcal).toBeGreaterThanOrEqual(0);
      food = r.foodKcal;
    }
  });

  it('greenhouse output scales with power mode and crew time', () => {
    const input = {
      modules: 2,
      isGreenhousePowered: true,
      ghLow: false,
      allocatedH: 1,
      neededH: 1,
      waterKg: 10,
    };
    const full = stepFood(1e6, input, k).ghKcal;
    expect(full).toBeCloseTo(2 * k.greenhouseKcalPerModulePerH, 10);
    expect(stepFood(1e6, { ...input, ghLow: true }, k).ghKcal).toBeCloseTo(
      full * k.greenhouseLowPowerFactor,
      10,
    );
    expect(stepFood(1e6, { ...input, allocatedH: 0.5 }, k).ghKcal).toBeCloseTo(full / 2, 10);
    expect(stepFood(1e6, { ...input, waterKg: 0 }, k).ghKcal).toBe(0);
  });

  it('shortfall is flagged when stores run out', () => {
    const r = stepFood(
      0,
      {
        modules: 0,
        isGreenhousePowered: false,
        ghLow: false,
        allocatedH: 0,
        neededH: 0,
        waterKg: 1,
      },
      k,
    );
    expect(r.isShortfall).toBe(true);
    expect(r.foodKcal).toBe(0);
  });
});
