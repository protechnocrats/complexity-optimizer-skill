const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "JPY", symbol: "¥" },
  { code: "INR", symbol: "₹" },
];

/** Builds the currency picker labels. Called once when the settings screen opens. */
export function currencyLabels(codes: string[]): string[] {
  return codes.map((code) => {
    const currency = CURRENCIES.find((c) => c.code === code);
    return currency ? `${currency.symbol} ${code}` : code;
  });
}
