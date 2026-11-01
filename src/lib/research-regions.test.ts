import { expect, test } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

test("Region migration sets US current/eBay records, UK policy, and unspecified Shopify historical scope", async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE TABLE public.fee_records(id uuid PRIMARY KEY); CREATE TABLE public.fee_changes(id uuid PRIMARY KEY); CREATE TABLE public.policy_changes(id uuid PRIMARY KEY);
      INSERT INTO public.fee_records VALUES ('10000000-0000-4000-8000-000000000001');
      INSERT INTO public.fee_changes VALUES ('2ab83dc6-dd91-45de-a5b8-4633f3d102bb'),('47d5cb5e-2ac5-4d02-9c26-d66295efe60a'),('0cb1ef44-8e6f-4d77-940b-065d85aa990a');
      INSERT INTO public.policy_changes VALUES ('51561c2b-a955-4b42-8d0b-b7a1e73253e2');`);
    await db.exec(await readFile(new URL("../../drizzle/migrations/0009_research_collection_regions.sql", import.meta.url), "utf8"));
    expect((await db.query<{ region: string }>("SELECT region FROM public.fee_records")).rows[0]?.region).toBe("US");
    expect((await db.query<{ region: string }>("SELECT region FROM public.policy_changes")).rows[0]?.region).toBe("UK");
    expect((await db.query<{ region: string }>("SELECT region FROM public.fee_changes ORDER BY id")).rows.map((row) => row.region)).toEqual(["UNSPECIFIED", "US", "US"]);
    await expect(db.exec("INSERT INTO public.fee_records VALUES ('10000000-0000-4000-8000-000000000002',NULL)")).rejects.toThrow();
  } finally { await db.close(); }
}, 30000);