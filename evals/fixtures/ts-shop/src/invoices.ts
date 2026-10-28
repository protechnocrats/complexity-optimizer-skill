import type { PriceBook } from "./pricebook.ts";

export interface InvoiceLine {
  sku: string;
  quantity: number;
}

export interface Invoice {
  customerId: string;
  lines: InvoiceLine[];
}

export function invoiceTotal(invoice: Invoice, prices: PriceBook): number {
  return invoice.lines.reduce((total, line) => total + prices.priceOf(line.sku) * line.quantity, 0);
}

/** Total billed per customer, in order of each customer's first invoice. Runs at month end over every invoice. */
export function monthlyStatements(invoices: Invoice[], prices: PriceBook): Map<string, number> {
  const totals = new Map<string, number>();
  for (const invoice of invoices) {
    totals.set(invoice.customerId, (totals.get(invoice.customerId) ?? 0) + invoiceTotal(invoice, prices));
  }
  return totals;
}
