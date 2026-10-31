import { describe, expect, test } from "bun:test";
import { calculatorSupportStatus, createCalculatorResultTracker } from "./calculator-analytics";
import { calculateFees, CATEGORIES, type FeeInputs } from "./marketplace-fees";

describe("calculator result analytics", () => {
  test("initial load records no result and does not consume the first pair", () => {
    const view = createCalculatorResultTracker();
    expect(view(false, "amazon", "home")).toBeNull();
    expect(view(true, "amazon", "home")).toEqual({ marketplace: "amazon", category: "home", support_status: "modeled_with_exclusions" });
  });

  test("numeric edits and returning to a pair do not duplicate results within a mount", () => {
    const view = createCalculatorResultTracker();
    expect(view(true, "amazon", "home")).not.toBeNull();
    expect(view(true, "amazon", "home")).toBeNull();
    expect(view(true, "walmart", "home")).not.toBeNull();
    expect(view(true, "walmart", "toys")?.support_status).toBe("partially_supported");
    expect(view(true, "amazon", "home")).toBeNull();
    expect(createCalculatorResultTracker()(true, "amazon", "home")).not.toBeNull();
  });

  test("all Amazon, Shopify and Etsy selectable categories model primary fees despite exclusions", () => {
    for (const marketplace of ["amazon", "shopify", "etsy"] as const) {
      for (const { id: category } of CATEGORIES) {
        const inputs: FeeInputs = { marketplace, category, price: 30, cost: 8, shipping: 2, weightLb: 1, sizeTier: "small_standard", storageMonths: 2 };
        expect(calculateFees(inputs).unsupported.length).toBeGreaterThan(0);
        expect(calculatorSupportStatus(marketplace, category)).toBe("modeled_with_exclusions");
      }
    }
  });

  test("Walmart supported referrals differ from missing important referral coverage", () => {
    for (const category of ["electronics", "home", "apparel"]) {
      expect(calculatorSupportStatus("walmart", category)).toBe("modeled_with_exclusions");
    }
    for (const category of ["electronics_accessories", "beauty", "toys", "grocery", "books", "tools"]) {
      expect(calculatorSupportStatus("walmart", category)).toBe("partially_supported");
    }
  });

  test("combinations with no available primary model are unsupported", () => {
    expect(calculatorSupportStatus("ebay", "home")).toBe("unsupported");
    expect(calculatorSupportStatus("amazon", "unknown_category")).toBe("unsupported");
  });

  test("result payload contains only the three approved non-personal parameters", () => {
    const payload = createCalculatorResultTracker()(true, "etsy", "home");
    expect(payload).toEqual({ marketplace: "etsy", category: "home", support_status: "modeled_with_exclusions" });
    expect(Object.keys(payload ?? {}).sort()).toEqual(["category", "marketplace", "support_status"]);
  });
});