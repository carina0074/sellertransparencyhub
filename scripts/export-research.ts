import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { COLLECTIONS, dataDictionary, snapshotCsv, validateSnapshot, type Snapshot } from "../src/lib/research-snapshot";

const [version, destination] = process.argv.slice(2);
if (!version || !destination || !/^\d+\.\d+\.\d+$/.test(version)) throw new Error("Usage: bun scripts/export-research.ts X.Y.Z /absolute/private/destination");
const output = resolve(destination);
if (!output.startsWith("/tmp/") && !output.startsWith("/mnt/documents/")) throw new Error("Export only to private scratch or Files, never public project assets");
// One SELECT and one PostgreSQL statement snapshot for all collections AND schema.
const sql = `SELECT jsonb_build_object(
  'version', '${version}', 'exported_at', statement_timestamp(), 'status', 'unreleased_sample',
  'schema', (SELECT jsonb_agg(to_jsonb(s) ORDER BY table_name, ordinal_position) FROM (SELECT table_name,column_name,data_type,is_nullable,column_default,ordinal_position FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('fee_records','fee_changes','policy_changes')) s),
  'collections', jsonb_build_object(
    'fee_records',(SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY id),'[]'::jsonb) FROM public.fee_records r),
    'fee_changes',(SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY id),'[]'::jsonb) FROM public.fee_changes r),
    'policy_changes',(SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY id),'[]'::jsonb) FROM public.policy_changes r)
  )) AS snapshot`;
const processResult = Bun.spawn(["lovable", "supabase", "query", sql, "--json"], { stdout: "pipe", stderr: "pipe" });
const raw = await new Response(processResult.stdout).text();
if (await processResult.exited !== 0) throw new Error("Read-only snapshot query failed");
const response = JSON.parse(raw) as { rows?: { snapshot?: Snapshot }[] };
const value = response.rows?.[0]?.snapshot;
if (!value) throw new Error("Snapshot response missing");
const snapshot = validateSnapshot(value);
const folder = resolve(output, `research-${version}-${snapshot.exported_at.replaceAll(/[^\dA-Za-z]/g, "-")}`);
await mkdir(folder, { recursive: false });
await writeFile(resolve(folder, "snapshot.json"), JSON.stringify(snapshot, null, 2) + "\n");
await writeFile(resolve(folder, "data-dictionary.md"), dataDictionary(snapshot));
for (const collection of COLLECTIONS) {
  await writeFile(resolve(folder, `${collection}.json`), JSON.stringify({ version: snapshot.version, exported_at: snapshot.exported_at, status: snapshot.status, data: snapshot.collections[collection] }, null, 2) + "\n");
  await writeFile(resolve(folder, `${collection}.csv`), snapshotCsv(snapshot, collection));
}
await writeFile(resolve(folder, "manifest.json"), JSON.stringify({ version: snapshot.version, exported_at: snapshot.exported_at, status: snapshot.status, counts: Object.fromEntries(COLLECTIONS.map((name) => [name, snapshot.collections[name].length])), files: ["snapshot.json", "data-dictionary.md", ...COLLECTIONS.flatMap((name) => [`${name}.csv`, `${name}.json`])] }, null, 2) + "\n");
console.log(folder);