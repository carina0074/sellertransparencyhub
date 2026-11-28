import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { API_COLUMNS, csvCell, datasetCitation, recordCitation, toCsv, versionLabel, permanentRecordUrl, DATA_LICENSE_URL } from "./citation";

describe("citations", () => {
  it("formats the dataset citation with version and retrieval date", () => {
    expect(datasetCitation("fee_database", { year: "2026", version: "2026-11-21", retrieved: "November 28, 2026" }))
      .toBe("Seller Transparency Hub. (2026). Marketplace Fee Database (Version 2026-11-21) [Data set]. Retrieved November 28, 2026, from https://sellertransparency.com/rate-card");
  });
  it("includes permanent URL and last-checked date in record citations", () => {
    const c = recordCitation("policy_archive", { id: "abc", title: "T", year: "2026", lastChecked: "2026-11-05", retrieved: "November 28, 2026" });
    expect(c).toContain("Last checked November 5, 2026.");
    expect(c).toContain("https://sellertransparency.com/policy-changes?record=abc");
  });
  it("derives the version label from the latest data change date", () => {
    expect(versionLabel("2026-11-21T02:27:31Z")).toBe("2026-11-21");
    expect(permanentRecordUrl("fee_change_feed", "x y")).toBe("https://sellertransparency.com/fees?record=x%20y");
  });
});

describe("csv", () => {
  it("escapes quotes and keeps JSON evidence intact", () => {
    expect(csvCell('He said "hi", ok')).toBe('"He said ""hi"", ok"');
    expect(csvCell({ quote: 'a "b"' })).toBe('"{""quote"":""a \\""b\\""""}"');
  });
  it("starts with the license line and uses the given columns", () => {
    const lines = toCsv(["id", "title"], [{ id: 1, title: "x", extra: "no" }]).split("\r\n");
    expect(lines[0]).toContain(DATA_LICENSE_URL);
    expect(lines[1]).toBe("id,title");
    expect(lines[2]).toBe("1,x");
  });
  it("matches the public API field lists", () => {
    for (const [file, key] of [["fees", "fee_database"], ["fee-changes", "fee_change_feed"], ["policy-changes", "policy_archive"]] as const) {
      const src = readFileSync(`src/routes/api/public/${file}.ts`, "utf8");
      const m = src.match(/\.select\("([^"]+)"\)/);
      expect(m?.[1]).toBe(API_COLUMNS[key].join(","));
    }
  });
});
