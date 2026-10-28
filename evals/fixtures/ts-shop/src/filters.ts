/** Removes ignored sensor readings. Readings may contain NaN for failed samples. */
export function withoutIgnored(readings: number[], ignored: number[]): number[] {
  return readings.filter((value) => ignored.indexOf(value) === -1);
}
