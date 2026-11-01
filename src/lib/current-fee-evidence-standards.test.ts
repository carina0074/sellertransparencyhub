import { beforeAll, afterAll, expect, test } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

const db = new PGlite();
const reference = { title: "Test source", url: "https://example.org", quote: "Supporting test quote", heading: "Test section" };
const details = { references: [reference] };
beforeAll(async () => {
  await db.exec(`CREATE TABLE public.fee_records (id integer PRIMARY KEY, pricing_details jsonb, verification_status text, value numeric, value_type text, source_url text, source_title text, notes text, region text);
    INSERT INTO public.fee_records VALUES (1, '{"references":[{"title":"Legacy","url":"https://example.org"}]}', 'verified_current_value', 0.15, 'percent', 'https://example.org', 'Legacy', NULL, 'US');`);
  await db.exec(await readFile(new URL("../../drizzle/migrations/0010_prospective_current_fee_evidence_standards.sql", import.meta.url), "utf8"));
}, 30000);
afterAll(async () => { await db.close(); });

test("Existing evidence stays untouched; unrelated edits do not require backfilled quotes", async () => {
  expect((await db.query<{ pricing_details: unknown }>("SELECT pricing_details FROM public.fee_records WHERE id=1")).rows[0]?.pricing_details).toEqual({ references: [{ title: "Legacy", url: "https://example.org" }] });
  await db.exec("UPDATE public.fee_records SET region='UK' WHERE id=1");
  expect((await db.query("SELECT id FROM public.fee_records WHERE region='UK'")).rows).toHaveLength(1);
});

test("Every new reference requires both a nonblank quote and heading", async () => {
  for (const ref of [{ ...reference, quote: " " }, { ...reference, heading: "" }, { title: reference.title, url: reference.url }]) {
    await expect(db.query("INSERT INTO public.fee_records (id,pricing_details,verification_status) VALUES (2,$1,'verified_current_value')", [JSON.stringify({ references: [ref] })])).rejects.toThrow("quote and source section heading");
  }
  await db.query("INSERT INTO public.fee_records (id,pricing_details,verification_status) VALUES (2,$1,'verified_current_value')", [JSON.stringify(details)]);
  expect((await db.query("SELECT id FROM public.fee_records WHERE id=2")).rows).toHaveLength(1);
});

test("Changing evidence or a headline on legacy records requires complete references", async () => {
  await expect(db.exec("UPDATE public.fee_records SET value=0.16 WHERE id=1")).rejects.toThrow("quote and source section heading");
  await expect(db.query("UPDATE public.fee_records SET pricing_details=$1 WHERE id=1", [JSON.stringify({ references: [{ ...reference, heading: " " }] })])).rejects.toThrow("quote and source section heading");
  await db.query("UPDATE public.fee_records SET pricing_details=$1 WHERE id=1", [JSON.stringify(details)]);
});

test("Partial verification requires confirmed headline evidence", async () => {
  await expect(db.query("INSERT INTO public.fee_records (id,pricing_details,verification_status,notes) VALUES (3,$1,'partially_verified','Scope unconfirmed')", [JSON.stringify(details)])).rejects.toThrow("confirmed headline evidence");
  await expect(db.query("INSERT INTO public.fee_records (id,pricing_details,verification_status,notes) VALUES (3,$1,'partially_verified','Scope unconfirmed')", [JSON.stringify({ ...details, verification: { headline_value_confirmed: false, unconfirmed_elements: ["Scope"] } })])).rejects.toThrow("confirmed headline evidence");
});

test("Partial verification identifies at least one unconfirmed element in notes", async () => {
  const partial = { ...details, verification: { headline_value_confirmed: true, unconfirmed_elements: ["Seller eligibility"] } };
  await expect(db.query("INSERT INTO public.fee_records (id,pricing_details,verification_status,notes) VALUES (4,$1,'partially_verified','Generic notes')", [JSON.stringify(partial)])).rejects.toThrow("Notes must identify each unconfirmed");
  await expect(db.query("INSERT INTO public.fee_records (id,pricing_details,verification_status,notes) VALUES (4,$1,'partially_verified','Unconfirmed')", [JSON.stringify({ ...partial, verification: { headline_value_confirmed: true, unconfirmed_elements: [] } })])).rejects.toThrow("at least one unconfirmed");
  await db.query("INSERT INTO public.fee_records (id,pricing_details,verification_status,notes) VALUES (4,$1,'partially_verified','Seller eligibility is unconfirmed')", [JSON.stringify(partial)]);
  await expect(db.exec("UPDATE public.fee_records SET notes='Generic notes' WHERE id=4")).rejects.toThrow("Notes must identify each unconfirmed");
  expect((await db.query("SELECT id FROM public.fee_records WHERE id=4")).rows).toHaveLength(1);
});