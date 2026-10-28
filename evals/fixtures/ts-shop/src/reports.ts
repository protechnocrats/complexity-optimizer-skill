import { currentUser } from "./session.ts";

export interface Event {
  userId: string;
  day: number;
  amountCents: number;
}

const events: Event[] = [];

export function recordEvent(event: Event): void {
  events.push(event);
}

/** Total spend for the signed-in user between `fromDay` and `toDay`, inclusive. Each dashboard widget calls this. */
export function spendReport(fromDay: number, toDay: number): number {
  const user = currentUser();
  let total = 0;
  for (const event of events) {
    if (event.userId === user && event.day >= fromDay && event.day <= toDay) total += event.amountCents;
  }
  return total;
}
