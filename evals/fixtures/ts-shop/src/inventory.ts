export interface Movement {
  sku: string;
  /** Positive for stock received, negative for stock shipped. */
  quantity: number;
}

/** Units of `sku` on hand after applying `movements`. */
export function stockOnHand(movements: Movement[], sku: string): number {
  let total = 0;
  for (const movement of movements) {
    if (movement.sku === sku) total += movement.quantity;
  }
  return total;
}
