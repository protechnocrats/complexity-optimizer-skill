import { stockOnHand, type Movement } from "./inventory.ts";

export interface Store {
  id: string;
  movements: Movement[];
}

export interface RestockLine {
  storeId: string;
  sku: string;
  onHand: number;
}

/** For each store in turn, the catalog SKUs with at most `threshold` units on hand, in catalog order. Runs nightly. */
export function restockList(stores: Store[], catalog: string[], threshold: number): RestockLine[] {
  const lines: RestockLine[] = [];
  for (const store of stores) {
    for (const sku of catalog) {
      const onHand = stockOnHand(store.movements, sku);
      if (onHand <= threshold) lines.push({ storeId: store.id, sku, onHand });
    }
  }
  return lines;
}
