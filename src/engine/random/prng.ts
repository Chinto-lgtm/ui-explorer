/**
 * UI Explorer — Seeded Pseudo-Random Number Generator (PRNG)
 * Implements deterministic Mulberry32 algorithm.
 * Guarantees identical output for identical seeds across sessions.
 */

export interface PRNG {
  next(): number; // 0..1
  nextInt(min: number, max: number): number; // min..max inclusive
  nextFloat(min: number, max: number): number;
  choice<T>(array: T[]): T;
  weightedChoice<T>(options: { value: T; weight: number }[]): T;
}

/**
 * Converts any string or numeric seed into a 32-bit positive integer hash.
 */
export function hashSeed(seed: string | number): number {
  if (typeof seed === 'number') {
    return Math.floor(Math.abs(seed)) || 1;
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) || 12345;
}

/**
 * Creates a deterministic Mulberry32 PRNG instance.
 */
export function createSeededRandom(seedInput: string | number): PRNG {
  let s = hashSeed(seedInput);

  const next = (): number => {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nextInt = (min: number, max: number): number => {
    return Math.floor(next() * (max - min + 1)) + min;
  };

  const nextFloat = (min: number, max: number): number => {
    return next() * (max - min) + min;
  };

  const choice = <T>(array: T[]): T => {
    if (!array || array.length === 0) {
      throw new Error('PRNG.choice called on empty array');
    }
    return array[Math.floor(next() * array.length)];
  };

  const weightedChoice = <T>(options: { value: T; weight: number }[]): T => {
    if (!options || options.length === 0) {
      throw new Error('PRNG.weightedChoice called on empty options');
    }
    const totalWeight = options.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
    if (totalWeight <= 0) {
      return options[0].value;
    }
    let randomVal = next() * totalWeight;
    for (const item of options) {
      const w = Math.max(0, item.weight);
      if (randomVal < w) {
        return item.value;
      }
      randomVal -= w;
    }
    return options[options.length - 1].value;
  };

  return {
    next,
    nextInt,
    nextFloat,
    choice,
    weightedChoice
  };
}
