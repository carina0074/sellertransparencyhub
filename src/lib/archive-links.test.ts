import { describe, expect, test } from "bun:test";
import { archiveFor, normalizeSourceUrl } from "./archive-links";

const SOURCE = "https://www.ebay.com/sellercenter/resources/seller-updates/2025-january/final-value-fee";
const ARCHIVE = `https://web.archive.org/web/20261102033327/${SOURCE}`;

describe("archived copy links", () => {
  test("source URL normalization drops fragment, trailing slash and case", () => {
    expect(normalizeSourceUrl(`${SOURCE}#quotes`)).toBe(SOURCE.toLowerCase());
    expect(normalizeSourceUrl("https://Example.com/pricing/")).toBe("https://example.com/pricing");
    expect(normalizeSourceUrl("  https://marketplace.walmart.com/pricing/  ")).toBe("https://marketplace.walmart.com/pricing");
  });

  test("archived copy is found for the record's own source link", () => {
    const links = { [normalizeSourceUrl(SOURCE)]: ARCHIVE };
    expect(archiveFor(links, `${SOURCE}#section`)).toBe(ARCHIVE);
    expect(archiveFor(links, SOURCE)).toBe(ARCHIVE);
  });

  test("no archived copy is shown when none is held", () => {
    const links = { [normalizeSourceUrl(SOURCE)]: ARCHIVE };
    expect(archiveFor(links, "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822")).toBeNull();
    expect(archiveFor(links, null)).toBeNull();
    expect(archiveFor(links, "")).toBeNull();
    expect(archiveFor(undefined, SOURCE)).toBeNull();
  });
});
