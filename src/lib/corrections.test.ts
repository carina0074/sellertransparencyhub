import { describe, expect, it } from "bun:test";
import { corrections, sortedCorrections } from "./corrections";

describe("corrections log", () => {
  it("contains only the five maintainer-supplied entries", () => {
    expect(corrections).toHaveLength(5);
  });
  it("lists newest first", () => {
    const dates = sortedCorrections([{ ...corrections[3]! }, { ...corrections[0]! }]).map(c => c.date);
    expect(dates).toEqual(["2026-11-20", "2026-11-05"]);
  });
});
