// Mulberry32 deterministic pseudorandom number generator
// Spec B5.3

export type RngFn = () => number;

/**
 * Creates a deterministic pseudorandom number generator using mulberry32.
 * Output is in the half-open interval [0, 1).
 *
 * @param seed - 32-bit integer seed
 * @returns PRNG function returning floats in [0, 1)
 */
export function mulberry32(seed: number): RngFn {
  let s = (seed | 0) >>> 0;
  return function (): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
