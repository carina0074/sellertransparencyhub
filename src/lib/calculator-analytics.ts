import { CATEGORIES, WALMART_REFERRAL_RATES } from "./marketplace-fees";

export type CalculatorSupportStatus =
  | "modeled_with_exclusions"
  | "partially_supported"
  | "unsupported";

const categoryIds = new Set<string>(CATEGORIES.map((category) => category.id));

/** Coverage of the primary fee model, not the presence of intentional exclusions. */
export function calculatorSupportStatus(
  marketplace: string,
  category: string,
): CalculatorSupportStatus {
  if (!categoryIds.has(category)) return "unsupported";
  switch (marketplace) {
    case "amazon":
    case "shopify":
    case "etsy":
      return "modeled_with_exclusions";
    case "walmart":
      // Apparel has its own tiered model; other supported referrals use this map.
      return category === "apparel" || WALMART_REFERRAL_RATES[category] != null
        ? "modeled_with_exclusions"
        : "partially_supported";
    default:
      return "unsupported";
  }
}

/** One tracker per mounted page. Accept identifiers only, never financial inputs. */
export function createCalculatorResultTracker() {
  const viewed = new Set<string>();
  return (interacted: boolean, marketplace: string, category: string) => {
    if (!interacted) return null;
    const key = `${marketplace}|${category}`;
    if (viewed.has(key)) return null;
    viewed.add(key);
    return {
      marketplace,
      category,
      support_status: calculatorSupportStatus(marketplace, category),
    };
  };
}