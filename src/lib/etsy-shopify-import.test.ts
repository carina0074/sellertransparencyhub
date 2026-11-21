import { expect, test } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import fixture from "./etsy-shopify-import.fixtures.json";
import { presentFee, pricingDetailsSchema, resolvePlanRate } from "./fee-formatting";

function row(name: string) {
  const record = fixture.new.find(r => r.fee_name === name);
  if (!record) throw new Error(`Missing ${name}`);
  return record;
}

test("Etsy setup has no invented zero or monetary headline", () => {
  const r = row("Shop set-up fee");
  expect(r.value).toBeNull();
  expect(pricingDetailsSchema.parse(r.pricing_details).kind).toBe("unspecified_amount");
  expect(presentFee(r).value).toBe("One-time; amount shown during shop setup (not stated in policy)");
});
test("Etsy currency conversion is a 2.5% decimal fraction on sale amount", () => {
  const r = row("Currency conversion fee");
  expect(r.value).toBe(0.025);
  expect(pricingDetailsSchema.parse(r.pricing_details).basis).toBe("sale amount");
});
test("Etsy Plus is $10 monthly, not a yearly price", () => {
  const d = pricingDetailsSchema.parse(row("Etsy Plus subscription").pricing_details);
  if (d.kind !== "subscription") throw new Error("Not subscription");
  expect(d.options).toEqual([{ label: "monthly billing", monthly_minor: 1000 }]);
});
test.each([
  ["Grow plan subscription", 10500, 8900],
  ["Advanced plan subscription", 39900, 35900],
])("%s preserves independent monthly and yearly billing", (name, monthly, yearly) => {
  const d = pricingDetailsSchema.parse(row(String(name)).pricing_details);
  if (d.kind !== "subscription") throw new Error("Not subscription");
  expect(d.options.map(o => o.monthly_minor)).toEqual([monthly, yearly]);
});
test.each([["Basic", .02], ["Grow", .01], ["Advanced", .006], ["Plus", .002]] as const)("Third-party payments %s selects its own rate", (plan, rate) => {
  const r = row("Third-party transaction fees");
  const d = pricingDetailsSchema.parse(r.pricing_details);
  if (d.kind !== "plan_rates") throw new Error("Not plan rates");
  expect(r.value).toBeNull();
  expect(resolvePlanRate(d, plan)).toBe(rate);
});
test("Shopify Plus is a $2300 starting price, not a fixed universal price", () => {
  const r = row("Shopify Plus subscription");
  const d = pricingDetailsSchema.parse(r.pricing_details);
  if (d.kind !== "subscription") throw new Error("Not subscription");
  expect(d.starting_price).toBe(true);
  expect(d.options[0]?.monthly_minor).toBe(230000);
  expect(presentFee(r).value.startsWith("From $2300.00 USD")).toBe(true);
});
test("All seven new current records have unknown effective dates and the approved review day", () => {
  expect(fixture.new).toHaveLength(7);
  for (const r of fixture.new) {
    expect(r.effective_date).toBeNull();
    expect(r.region).toBe("US");
    expect(r.last_verified).toBe("2026-11-20");
    expect(pricingDetailsSchema.parse(r.pricing_details).reviewed_on).toBe("2026-11-20");
  }
});
test("The three updates never write current fee values", () => {
  expect(fixture.updates).toHaveLength(3);
  for (const r of fixture.updates) expect(Object.keys(r).includes("value")).toBe(false);
});
test("Database allows unknown amounts only with explicitly structured pricing", async () => {
  const db = new PGlite();
  try {
    await db.exec("CREATE TABLE fee_records(value numeric NOT NULL, pricing_details jsonb);");
    await db.exec(await readFile(new URL("../../drizzle/migrations/0020_current_fee_unspecified_and_plan_pricing.sql", import.meta.url), "utf8"));
    await expect(db.exec("INSERT INTO fee_records VALUES(NULL,NULL)")).rejects.toThrow();
    await expect(db.exec("INSERT INTO fee_records VALUES(NULL,'{\"kind\":\"simple\"}')")).rejects.toThrow();
    await db.exec("INSERT INTO fee_records VALUES(NULL,'{\"kind\":\"unspecified_amount\"}'),(NULL,'{\"kind\":\"plan_rates\"}')");
    expect((await db.query("SELECT value FROM fee_records WHERE value IS NULL")).rows).toHaveLength(2);
  } finally { await db.close(); }
}, 30000);