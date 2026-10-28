/**
 * Fewest packs needed to ship exactly `units` items, using any number of packs of each size.
 * Each supplier has its own pack sizes, which are positive integers.
 * Returns -1 when no combination of packs adds up to `units` exactly.
 */
export function packsNeeded(units: number, packSizes: number[]): number {
  if (units === 0) return 0;
  let best = -1;
  for (const size of packSizes) {
    if (size <= units) {
      const rest = packsNeeded(units - size, packSizes);
      if (rest !== -1 && (best === -1 || rest + 1 < best)) best = rest + 1;
    }
  }
  return best;
}
