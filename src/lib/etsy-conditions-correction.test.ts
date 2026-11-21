import { expect, test } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import fixture from "./etsy-shopify-import.fixtures.json";
import { pricingDetailsSchema, presentFee } from "./fee-formatting";

test("Approved Etsy correction preserves values, quotes and all distinct conditions under prospective validation", async () => {
  const db = new PGlite();
  try {
    await db.exec("CREATE TABLE public.fee_records(id uuid PRIMARY KEY, marketplace text, fee_name text, value numeric, value_type text, notes text, verification_status text, pricing_details jsonb, source_url text, source_title text);");
    const setup = fixture.new.find(r => r.fee_name === "Shop set-up fee");
    if (!setup) throw new Error("Missing setup fixture");
    await db.query("INSERT INTO fee_records VALUES($1,'Etsy',$2,$3,$4,$5,$6,$7,$8,$9)", [setup.id, setup.fee_name, setup.value, setup.value_type, setup.notes, setup.verification_status, JSON.stringify(setup.pricing_details), setup.source_url, setup.source_title]);
    for (const [id, name, value, type] of [["413b8b13-08a9-4c93-9ffd-7a82cd4e7d4e", "Listing Fee", .20, "usd"], ["f4207dd9-af1a-4f58-bccb-f996b2efc595", "Transaction Fee", .065, "percent"]] as const) {
      const r = fixture.updates.find(r => r.id === id);
      if (!r || !("pricing_details" in r)) throw new Error("Missing conditions fixture");
      await db.query("INSERT INTO fee_records VALUES($1,'Etsy',$2,$3,$4,'Existing notes','verified_current_value',$5,'https://www.etsy.com/legal/fees/','Etsy')", [id, name, value, type, JSON.stringify(r.pricing_details)]);
    }
    await db.exec(await readFile(new URL("../../drizzle/migrations/0010_prospective_current_fee_evidence_standards.sql", import.meta.url), "utf8"));
    const before = (await db.query("SELECT id, value, value_type, pricing_details->'references' AS quotes FROM fee_records ORDER BY id")).rows;
    await db.exec(await readFile(new URL("../../scripts/etsy-conditions-correction.sql", import.meta.url), "utf8"));
    expect((await db.query("SELECT id, value, value_type, pricing_details->'references' AS quotes FROM fee_records ORDER BY id")).rows).toEqual(before);
    const records = (await db.query<{ fee_name: string; value: number | null; value_type: string; verification_status: string; notes: string; pricing_details: unknown }>("SELECT * FROM fee_records")).rows;
    const listing = pricingDetailsSchema.parse(records.find(r => r.fee_name === "Listing Fee")?.pricing_details);
    expect(listing.conditions).toHaveLength(5);
    expect(listing.conditions.filter(c => /Pattern-only/.test(c))).toHaveLength(1);
    expect(listing.conditions.filter(c => /private listings/.test(c))).toHaveLength(1);
    expect(listing.conditions.filter(c => /four months/.test(c))).toHaveLength(1);
    expect(listing.conditions.filter(c => /multiple quantities sold/.test(c))).toHaveLength(1);
    const transaction = pricingDetailsSchema.parse(records.find(r => r.fee_name === "Transaction Fee")?.pricing_details);
    expect(transaction.conditions).toHaveLength(4);
    expect(transaction.conditions.filter(c => /6.5%/.test(c))).toHaveLength(1);
    expect(transaction.conditions.filter(c => /processing fees.*tax-inclusive/.test(c))).toHaveLength(1);
    const updatedSetup = records.find(r => r.fee_name === "Shop set-up fee");
    if (!updatedSetup) throw new Error("Missing updated setup");
    expect(updatedSetup.verification_status).toBe("partially_verified");
    expect(updatedSetup.notes).toBe("Existence and conditions verified on the policy page; amount not stated in the policy.");
    expect(updatedSetup.value).toBeNull();
    const setupDetails = pricingDetailsSchema.parse(setup.pricing_details);
    if (setupDetails.kind !== "unspecified_amount") throw new Error("Expected source-unspecified setup amount");
    expect(presentFee({ ...updatedSetup, marketplace: "Etsy" }).value).toBe(setupDetails.display);
    expect(pricingDetailsSchema.parse(updatedSetup.pricing_details).verification?.unconfirmed_elements).toEqual(["amount not stated in the policy"]);
  } finally { await db.close(); }
}, 30000);