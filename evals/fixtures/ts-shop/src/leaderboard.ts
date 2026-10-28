/** Returns scores from highest to lowest. */
export function rankScores(scores: number[]): number[] {
  return [...scores].sort().reverse();
}
