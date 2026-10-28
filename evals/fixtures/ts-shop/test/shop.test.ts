import { test } from "node:test";
import assert from "node:assert/strict";
import { shortestHops } from "../src/routing.ts";
import { runOrder } from "../src/scheduler.ts";
import { indexById } from "../src/indexing.ts";
import { withoutIgnored } from "../src/filters.ts";
import { rankScores } from "../src/leaderboard.ts";
import { loadProfiles } from "../src/profiles.ts";
import { hasAll } from "../src/permissions.ts";
import { recordEvent, spendReport } from "../src/reports.ts";
import { signIn } from "../src/session.ts";
import { currencyLabels } from "../src/currency.ts";
import { packsNeeded } from "../src/packing.ts";
import { stockOnHand } from "../src/inventory.ts";
import { restockList } from "../src/restock.ts";

test("shortest hops", () => {
  const graph = new Map([["a", ["b", "c"]], ["b", ["d"]], ["c", ["d"]], ["d", []]]);
  assert.equal(shortestHops(graph, "a", "d"), 2);
  assert.equal(shortestHops(graph, "d", "a"), -1);
});

test("jobs run earliest deadline first", () => {
  assert.deepEqual(
    runOrder([{ id: "x", deadline: 5 }, { id: "y", deadline: 2 }, { id: "z", deadline: 5 }]),
    ["y", "x", "z"],
  );
});

test("index by id", () => {
  const index = indexById([{ id: "7", name: "A" }, { id: "3", name: "B" }]);
  assert.equal(index["7"].name, "A");
  assert.equal(index["3"].name, "B");
});

test("ignored readings are removed", () => {
  assert.deepEqual(withoutIgnored([1, 2, 3, 2], [2]), [1, 3]);
});

test("scores ranked highest first", () => {
  assert.deepEqual(rankScores([3, 1, 2]), [3, 2, 1]);
});

test("profiles load in order", async () => {
  const client = { getProfile: async (id: string) => ({ id, displayName: id.toUpperCase() }) };
  assert.deepEqual(
    (await loadProfiles(["a", "b"], client)).map((p) => p.displayName),
    ["A", "B"],
  );
});

test("permission checks", () => {
  assert.equal(hasAll(["orders.read", "orders.write"], ["orders.read"]), true);
  assert.equal(hasAll(["orders.read"], ["orders.write"]), false);
});

test("spend report for signed-in user", () => {
  recordEvent({ userId: "u1", day: 1, amountCents: 500 });
  recordEvent({ userId: "u2", day: 1, amountCents: 900 });
  recordEvent({ userId: "u1", day: 5, amountCents: 100 });
  signIn("u1");
  assert.equal(spendReport(1, 3), 500);
  signIn("u2");
  assert.equal(spendReport(1, 3), 900);
});

test("currency labels", () => {
  assert.deepEqual(currencyLabels(["EUR", "XYZ"]), ["€ EUR", "XYZ"]);
});

test("fewest packs", () => {
  assert.equal(packsNeeded(20, [6, 10]), 2);
  assert.equal(packsNeeded(7, [6, 10]), -1);
  assert.equal(packsNeeded(0, [6, 10]), 0);
});

test("stock on hand", () => {
  assert.equal(stockOnHand([{ sku: "a", quantity: 5 }, { sku: "b", quantity: 2 }, { sku: "a", quantity: -3 }], "a"), 2);
});

test("restock list", () => {
  const stores = [
    { id: "s1", movements: [{ sku: "a", quantity: 10 }, { sku: "b", quantity: 1 }] },
    { id: "s2", movements: [{ sku: "a", quantity: 2 }] },
  ];
  assert.deepEqual(restockList(stores, ["a", "b"], 2), [
    { storeId: "s1", sku: "b", onHand: 1 },
    { storeId: "s2", sku: "a", onHand: 2 },
    { storeId: "s2", sku: "b", onHand: 0 },
  ]);
});
