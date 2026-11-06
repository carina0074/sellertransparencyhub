import { expect, test } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { announcementDateLabel, currentFeeTiming, sortFeeEvents } from "./fee-presentation";
import events from "./amazon-historical-events.fixtures.json";
import legacy from "./historical-fees.fixtures.json";

test("missing announcement date is Not recorded; recorded date is short", () => {
  expect(announcementDateLabel(null)).toBe("Not recorded");
  expect(announcementDateLabel("2023-12-05")).toBe("Dec 5, 2023");
});
test("low-inventory introduction comes from linked A05 and current timing stays independent", () => {
  const a05=events[2];
  expect(currentFeeTiming({effective_date:"2026-01-15"},a05)).toEqual(["First effective Apr 1, 2024","Current rates effective Jan 15, 2026"]);
  expect(currentFeeTiming({effective_date:"2026-01-15"})).toEqual(["Jan 15, 2026"]);
});
test("three most recent events use effective date, newest first", () => {
  expect(sortFeeEvents([...legacy,...events]).slice(0,3).map(c=>c.effective_date)).toEqual(["2025-02-14","2024-04-01","2024-03-15"]);
});
test("partial WFS timing reflects only two dated aged subtiers", () => {
  const pricing={kind:"tiered",mode:"schedule",currency:"USD",unit:"/ cu.ft / month",reviewed_on:"2026-10-29",legacy_source:false,conditions:["Season and age dependent"],references:[],tiers:[{label:"Jan–Sep",amount_minor:75},{label:"Oct–Dec, ≤30 days",amount_minor:75},{label:"Oct–Dec, >30 days",amount_minor:225},{label:"366–450 days",amount_minor:225,effective_date:"2026-06-30"},{label:">450 days",amount_minor:750,effective_date:"2026-06-30"}]};
  expect(currentFeeTiming({effective_date:null,pricing_details:pricing})).toEqual(["Partial: 2 aged subtiers effective Jun 30, 2026"]);
  expect(currentFeeTiming({effective_date:null,pricing_details:{...pricing,tiers:pricing.tiers.slice(0,3)}})).toEqual(["Not independently established"]);
});
test("public corroborating URLs start empty, capture once on a change and never alter fee values", async () => {
  const db=new PGlite();
  try {
    await db.exec("CREATE TABLE public.fee_records(id uuid PRIMARY KEY,value numeric); CREATE TABLE public.evidence_captures(record_type text,record_id uuid,url text); INSERT INTO public.fee_records VALUES ('00000000-0000-0000-0000-000000000001',0.32);");
    await db.exec(await readFile(new URL("../../drizzle/migrations/0018_public_corroborating_fee_source.sql",import.meta.url),"utf8"));
    expect((await db.query("SELECT public_corroborating_source_url FROM public.fee_records")).rows).toEqual([{public_corroborating_source_url:null}]);
    await db.exec("UPDATE public.fee_records SET public_corroborating_source_url='https://example.com/official'; UPDATE public.fee_records SET public_corroborating_source_url='https://example.com/official';");
    expect((await db.query("SELECT url FROM public.evidence_captures")).rows).toEqual([{url:"https://example.com/official"}]);
    expect((await db.query("SELECT value::text FROM public.fee_records")).rows).toEqual([{value:"0.32"}]);
    await expect(db.exec("UPDATE public.fee_records SET public_corroborating_source_url='https://sellercentral.amazon.com/help';")).rejects.toThrow();
  } finally { await db.close(); }
});