export type Rng = () => number;

const normalizeSeed = (seed: number | string) => {
  if (typeof seed === 'number') {
    return Math.abs(Math.floor(seed)) || 1;
  }

  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash || 1;
};

export function createSeededRng(seed: number | string): Rng {
  let value = normalizeSeed(seed) % 0x7fffffff;

  if (value <= 0) {
    value += 0x7ffffffe;
  }

  return () => {
    value = (value * 48271) % 0x7fffffff;
    return (value - 1) / 0x7ffffffe;
  };
}

export function randomFloat(rng: Rng = Math.random, min = 0, max = 1) {
  return min + rng() * (max - min);
}

export function randomInt(rng: Rng, min: number, max: number) {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);

  return Math.floor(randomFloat(rng, lower, upper + 1));
}

export function weightedChoice<T>(
  items: T[],
  getWeight: (item: T) => number,
  rng: Rng = Math.random,
) {
  const totalWeight = items.reduce((total, item) => total + getWeight(item), 0);

  if (items.length === 0 || totalWeight <= 0) {
    throw new Error('Cannot choose from an empty or unweighted list.');
  }

  let threshold = rng() * totalWeight;

  for (const item of items) {
    threshold -= getWeight(item);

    if (threshold <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
}
