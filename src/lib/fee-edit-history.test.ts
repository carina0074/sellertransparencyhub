import { beforeAll, afterAll, describe, expect, test } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

const db = new PGlite();
const id = "10000000-0000-4000-8000-000000000001";
type History = { field_changed: string; old_value: unknown; new_value: unknown; source_url: string | null };

beforeAll(async () => {
  await db.exec(`
    CREATE ROLE authenticated;
    CREATE ROLE service_role;
    CREATE SCHEMA private;
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'SELECT NULL::uuid';
    CREATE FUNCTION private.has_role(uuid, public.app_role) RETURNS boolean LANGUAGE sql AS 'SELECT false';
    CREATE TABLE public.fee_records (
      id uuid PRIMARY KEY, value numeric NOT NULL, notes text, source_url text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    INSERT INTO public.fee_records (id, value, notes, source_url, created_at)
    VALUES ('${id}', 0.15, NULL, 'https://sellertransparency.com', '2026-06-12T00:00:00Z');
  `);
  await db.exec(await readFile(new URL("../../drizzle/migrations/0008_fee_record_edit_history.sql", import.meta.url), "utf8"));
}, 30000);

afterAll(async () => { await db.close(); });

describe("Prospective fee edit timestamps and append-only history", () => {
  test("Existing records retain creation time and get no estimated update time or history", async () => {
    const { rows } = await db.query<{ updated_at: unknown; created_at: Date }>("SELECT updated_at, created_at FROM public.fee_records WHERE id=$1", [id]);
    expect(rows[0]?.updated_at).toBeNull();
    expect(rows[0]?.created_at.toISOString()).toBe("2026-06-12T00:00:00.000Z");
    expect((await db.query("SELECT * FROM public.fee_record_edit_history")).rows).toHaveLength(0);
  });

  test("Each edit automatically sets updated_at; each changed field records before/after and available source", async () => {
    await db.exec("BEGIN");
    try {
      await db.query("UPDATE public.fee_records SET value=0.16, notes='test' WHERE id=$1", [id]);
      const { rows } = await db.query<History>("SELECT field_changed,old_value,new_value,source_url FROM public.fee_record_edit_history ORDER BY field_changed");
      expect(rows).toEqual([
        { field_changed: "notes", old_value: null, new_value: "test", source_url: "https://sellertransparency.com" },
        { field_changed: "value", old_value: 0.15, new_value: 0.16, source_url: "https://sellertransparency.com" },
      ]);
      const checks = await db.query<{ valid: boolean }>("SELECT bool_and(h.changed_at=r.updated_at AND r.updated_at IS NOT NULL AND r.created_at='2026-06-12T00:00:00Z') AS valid FROM public.fee_record_edit_history h JOIN public.fee_records r ON r.id=h.record_id");
      expect(checks.rows[0]?.valid).toBe(true);
      const first = await db.query<{ updated_at: Date }>("SELECT updated_at FROM public.fee_records WHERE id=$1", [id]);
      await db.query("UPDATE public.fee_records SET value=value WHERE id=$1", [id]);
      const second = await db.query<{ updated_at: Date }>("SELECT updated_at FROM public.fee_records WHERE id=$1", [id]);
      expect(Number(second.rows[0]?.updated_at)).toBeGreaterThanOrEqual(Number(first.rows[0]?.updated_at));
      expect((await db.query("SELECT * FROM public.fee_record_edit_history")).rows).toHaveLength(2);
    } finally { await db.exec("ROLLBACK"); }
  });

  test("History rejects updates, deletes and truncation", async () => {
    await db.query("UPDATE public.fee_records SET notes='test' WHERE id=$1", [id]);
    for (const statement of ["UPDATE public.fee_record_edit_history SET source_url=NULL", "DELETE FROM public.fee_record_edit_history", "TRUNCATE public.fee_record_edit_history"]) {
      await expect(db.exec(statement)).rejects.toThrow("append-only");
    }
    expect((await db.query("SELECT * FROM public.fee_record_edit_history")).rows).toHaveLength(1);
  });

  test("History survives removal of its fee record", async () => {
    await db.query("DELETE FROM public.fee_records WHERE id=$1", [id]);
    expect((await db.query("SELECT record_id FROM public.fee_record_edit_history WHERE record_id=$1", [id])).rows).toHaveLength(1);
  });

  test("Anonymous and authenticated callers cannot write history; RLS is enabled", async () => {
    const { rows } = await db.query<{ relrowsecurity: boolean; can_insert: boolean; can_update: boolean; can_delete: boolean }>(`SELECT relrowsecurity,
      has_table_privilege('authenticated','public.fee_record_edit_history','INSERT') AS can_insert,
      has_table_privilege('service_role','public.fee_record_edit_history','UPDATE') AS can_update,
      has_table_privilege('service_role','public.fee_record_edit_history','DELETE') AS can_delete
      FROM pg_class WHERE oid='public.fee_record_edit_history'::regclass`);
    expect(rows[0]).toEqual({ relrowsecurity: true, can_insert: false, can_update: false, can_delete: false });
  });
});