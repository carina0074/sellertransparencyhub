import { describe, it, expect } from "vitest";
import { isProductionHost } from "./analytics";

describe("GA4 production-only hosts", () => {
  it("allows the two production hostnames", () => {
    expect(isProductionHost("sellertransparency.com")).toBe(true);
    expect(isProductionHost("www.sellertransparency.com")).toBe(true);
  });
  it("blocks preview, published-slug and local hosts", () => {
    expect(isProductionHost("sellertransparencyhub.lovable.app")).toBe(false);
    expect(isProductionHost("id-preview--57626a55-63a3-4565-b480-7d737f1b59ad.lovable.app")).toBe(false);
    expect(isProductionHost("localhost")).toBe(false);
    expect(isProductionHost("evil-sellertransparency.com")).toBe(false);
  });
});
