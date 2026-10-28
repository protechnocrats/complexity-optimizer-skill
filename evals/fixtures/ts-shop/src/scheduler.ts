export interface Job {
  id: string;
  deadline: number;
}

/** Returns job IDs in the order they run: earliest deadline first; ties run in submission order. */
export function runOrder(jobs: Job[]): string[] {
  const pending = [...jobs];
  const order: string[] = [];
  while (pending.length > 0) {
    let best = 0;
    for (let i = 1; i < pending.length; i++) {
      if (pending[i].deadline < pending[best].deadline) best = i;
    }
    order.push(pending[best].id);
    pending.splice(best, 1);
  }
  return order;
}
