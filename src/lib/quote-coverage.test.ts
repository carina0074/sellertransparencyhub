import { describe, expect, it } from "bun:test";
import { countRecordsWithQuote } from "./quote-coverage";

describe("countRecordsWithQuote", () => {
  it("counts only records with a non-empty quote", () => {
    expect(countRecordsWithQuote([
      { pricing_details: { references: [{ quote: "Fee is 6.5%" }] } },
      { pricing_details: { references: [{ quote: "  " }, { title: "x" }] } },
      { pricing_details: null },
      { pricing_details: { references: [{ title: "a" }, { quote: "Yes" }] } },
    ])).toBe(2);
  });
});
