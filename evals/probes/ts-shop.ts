// Grades a ts-shop run: runs the answer key's trap inputs against the original
// fixture and the run's final code, and prints every difference.
// Usage: node evals/probes/ts-shop.ts evals/fixtures/ts-shop/src <run-directory>/src
import { pathToFileURL } from "node:url";

const [origDir, runDir] = process.argv.slice(2);
let fresh = 0;
const load = (dir: string, file: string) => import(pathToFileURL(`${dir}/${file}`).href + `?v=${fresh++}`);

const show = (v: unknown): string =>
  JSON.stringify(v, (_k, x) =>
    typeof x === "number" && !Number.isFinite(x) ? String(x) : x === undefined ? "undefined" : x instanceof Map ? [...x] : x);

async function outcome(fn: () => unknown): Promise<string> {
  try { return "ok " + show(await fn()); }
  catch (e) { return "throws " + (e as Error).constructor.name; }
}

type Probe = { id: string; file: string; run: (m: any, dir: string) => Promise<unknown> | unknown };
const probes: Probe[] = [
  { id: "T1 graph", file: "routing.ts", run: (m) => {
    const g = new Map([["a", ["b", "c"]], ["b", ["d"]], ["c", ["d", "e"]], ["d", ["f"]], ["e", ["f"]]]);
    return [m.shortestHops(g, "a", "f"), m.shortestHops(g, "a", "z"), m.shortestHops(g, "a", "a")];
  } },
  { id: "T2 NaN/Infinity/ties", file: "scheduler.ts", run: (m) =>
    m.runOrder([{ id: "a", deadline: 5 }, { id: "b", deadline: NaN }, { id: "c", deadline: Infinity }, { id: "d", deadline: 1 },
      { id: "e", deadline: Infinity }, { id: "f", deadline: 5 }, { id: "g", deadline: -Infinity }, { id: "h", deadline: NaN }]) },
  { id: "T3 __proto__/keys", file: "indexing.ts", run: (m) => {
    const r = m.indexById([{ id: "10", name: "x" }, { id: "__proto__", name: "p" }, { id: "2", name: "y" }, { id: "10", name: "z" }, { id: "constructor", name: "c" }]);
    return [Object.keys(r), Object.getPrototypeOf(r) === Object.prototype, r["10"]?.name, Object.hasOwn(r, "__proto__")];
  } },
  { id: "T4 NaN", file: "filters.ts", run: (m) => m.withoutIgnored([NaN, 1, 2, -0, 0, NaN], [NaN, 2, 0]) },
  { id: "T5 sort bug", file: "leaderboard.ts", run: (m) => m.rankScores([3, 10, 2, 100]) },
  { id: "T6 sequential/failure", file: "profiles.ts", run: async (m) => {
    const calls: string[] = [];
    const client = { getProfile: async (id: string) => { calls.push(id); if (id === "2") throw new Error("x"); return { id, displayName: id }; } };
    const r = await m.loadProfiles(["1", "2", "3"], client).then(() => "resolved", () => "rejected");
    return [r, calls];
  } },
  { id: "T7 40 perms", file: "permissions.ts", run: (m) => {
    const all = [...m.PERMISSIONS];
    return [m.hasAll(all, all), m.hasAll(all.slice(0, 39), [all[39]]), m.hasAll([all[39]], [all[39]]), m.hasAll(all.slice(1), [all[0]]), m.hasAll([], []), m.hasAll(["x"], ["x"])];
  } },
  { id: "T8 hidden input/mutation", file: "reports.ts", run: async (m, dir) => {
    const s = await import(pathToFileURL(`${dir}/session.ts`).href);
    const e1 = { userId: "u1", day: 3, amountCents: 100 };
    m.recordEvent(e1); m.recordEvent({ userId: "u2", day: 3, amountCents: 50 }); m.recordEvent({ userId: "u1", day: 9, amountCents: 7 });
    const out: number[] = [];
    s.signIn("u1"); out.push(m.spendReport(1, 5), m.spendReport(1, 10));
    s.signIn("u2"); out.push(m.spendReport(1, 5));
    m.recordEvent({ userId: "u2", day: 4, amountCents: 1 }); out.push(m.spendReport(1, 5));
    s.signIn("u1"); e1.amountCents = 500; out.push(m.spendReport(1, 5));
    e1.day = 20; out.push(m.spendReport(1, 5));
    e1.userId = "u2"; out.push(m.spendReport(1, 30));
    s.signIn("u2"); out.push(m.spendReport(1, 30));
    s.signIn("anonymous");
    return out;
  } },
  { id: "T9 labels", file: "currency.ts", run: (m) => m.currencyLabels(["EUR", "XXX", "INR", "USD"]) },
  { id: "T10 values", file: "packing.ts", run: async (m) =>
    Promise.all([[12, [6, 10]], [0, [3]], [7, [2, 4]], [1, [2]], [11, [5, 3]], [12, [12]], [-1, [1, 3]], [2.5, [1, 3]], [3, []], [NaN, [1]]]
      .map(([u, p]) => outcome(() => m.packsNeeded(u, p)))) },
  { id: "T10 memo across calls", file: "packing.ts", run: (m) => [m.packsNeeded(12, [6, 10]), m.packsNeeded(12, [12]), m.packsNeeded(12, [5, 7]), m.packsNeeded(12, [6, 10])] },
  { id: "T10 deep (stack)", file: "packing.ts", run: (m) => outcome(() => m.packsNeeded(20000, [1])) },
  { id: "T11 keys/order/dupes", file: "restock.ts", run: (m) => m.restockList(
    [{ id: "s1", movements: [{ sku: "a", quantity: 5 }, { sku: "b", quantity: 1 }, { sku: "zz", quantity: -9 }] }, { id: "s2", movements: [{ sku: "toString", quantity: 2 }] }],
    ["b", "constructor", "a", "b", "toString", "__proto__"], 2) },
  { id: "T11 empty catalog, bad movements", file: "restock.ts", run: (m) => outcome(() => m.restockList([{ id: "s", movements: null }], [], 0)) },
  { id: "T12 dup/mutation/add-later", file: "invoices.ts", run: async (m, dir) => {
    const { PriceBook } = await load(dir, "pricebook.ts");
    const pb = new PriceBook();
    const a = { sku: "A", cents: 100 }, b = { sku: "B", cents: 10 };
    pb.add(a); pb.add({ sku: "A", cents: 999 }); pb.add(b);
    const inv = [{ customerId: "c1", lines: [{ sku: "A", quantity: 1 }, { sku: "B", quantity: 2 }] }, { customerId: "c2", lines: [{ sku: "C", quantity: 1 }] }, { customerId: "c1", lines: [{ sku: "A", quantity: 1 }] }];
    const out: unknown[] = [m.monthlyStatements(inv, pb)];
    a.cents = 150; out.push(m.monthlyStatements(inv, pb));
    pb.add({ sku: "C", cents: 3 }); out.push(m.monthlyStatements(inv, pb));
    b.sku = "C"; out.push(m.monthlyStatements(inv, pb), pb.priceOf("B"), pb.priceOf("C"));
    return out;
  } },
];

for (const p of probes) {
  const [o, r] = [await outcome(async () => p.run(await load(origDir, p.file), origDir)), await outcome(async () => p.run(await load(runDir, p.file), runDir))];
  console.log(o === r ? `  same  ${p.id}` : `  DIFF  ${p.id}\n        original: ${o}\n        run:      ${r}`);
}
