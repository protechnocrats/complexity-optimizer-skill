/** Returns the minimum number of hops from `start` to `goal`, or -1 if unreachable. */
export function shortestHops(adjacency: Map<string, string[]>, start: string, goal: string): number {
  const distance = new Map<string, number>([[start, 0]]);
  const queue: string[] = [start];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === goal) return distance.get(current)!;
    for (const next of adjacency.get(current) ?? []) {
      if (!distance.has(next)) {
        distance.set(next, distance.get(current)! + 1);
        queue.push(next);
      }
    }
  }
  return -1;
}
