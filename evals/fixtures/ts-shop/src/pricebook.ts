export interface PriceEntry {
  sku: string;
  cents: number;
}

/** A supplier price list. If a SKU is listed more than once, the first listing is the one in force. */
export class PriceBook {
  private readonly entries: PriceEntry[] = [];

  add(entry: PriceEntry): void {
    this.entries.push(entry);
  }

  /** Price of `sku` in cents, or 0 when it is not listed. */
  priceOf(sku: string): number {
    return this.entries.find((entry) => entry.sku === sku)?.cents ?? 0;
  }
}
