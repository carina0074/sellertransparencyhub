/**
 * Public corrections log. Entries are maintainer-supplied only; never add
 * entries that the maintainer has not stated. Shown newest first.
 */
export type CorrectionEntry = {
  date: string; // YYYY-MM-DD
  subject: string;
  problem: string;
  change: string;
  source: { title: string; url: string };
  recordHref?: string;
};

const AMAZON_2024 = { title: "Update to US referral and Fulfillment by Amazon fees", url: "https://sellingpartners.aboutamazon.com/Update%20to%20US%20referral%20and%20Fulfillment%20by%20Amazon%20fees" };
const ETSY_POLICY = { title: "Etsy — Fees & Payments Policy", url: "https://www.etsy.com/legal/fees/" };

export const corrections: CorrectionEntry[] = [
  {
    date: "2026-11-20",
    subject: "Claim: Etsy's transaction fee rose to 7%",
    problem: "Unsupported. Etsy's Fees & Payments Policy states 6.5% as of 2026-11-20.",
    change: "Claim rejected.",
    source: ETSY_POLICY,
    recordHref: "/rate-card?record=f4207dd9-af1a-4f58-bccb-f996b2efc595",
  },
  {
    date: "2026-11-20",
    subject: "eBay subtitle fee guide",
    problem: "The wording \"isn't refunded\" was not in the US source quotes.",
    change: "Removed \"isn't refunded\" from the guide.",
    source: { title: "eBay — U.S. standard selling fees", url: "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822" },
    recordHref: "/guides/ebay-subtitle-fee",
  },
  {
    date: "2026-11-20",
    subject: "Etsy shop set-up fee",
    problem: "The policy confirms the fee but states no amount.",
    change: "Marked partially verified.",
    source: ETSY_POLICY,
    recordHref: "/rate-card?record=2260c542-0ba8-4aa9-aca5-74bfcac9cf55",
  },
  {
    date: "2026-11-05",
    subject: "Amazon low-inventory-level fee",
    problem: "The record showed Jan 15, 2026 as 'Effective' without labelling it as the current-rates date, and the fee's first effective date (Apr 1, 2024) was not recorded.",
    change: "Separated \"first effective Apr 1, 2024\" from \"current rates effective Jan 15, 2026\".",
    source: AMAZON_2024,
    recordHref: "/rate-card?record=8df97652-1d8d-4d26-865f-d977a701484e",
  },
  {
    date: "2026-11-05",
    subject: "Amazon inbound placement and low-inventory-level fees",
    problem: "Third-party sources give Apr 15, 2024; Amazon's announcement states Mar 1 and Apr 1, 2024.",
    change: "Dates follow Amazon's announcement (Mar 1 and Apr 1, 2024).",
    source: AMAZON_2024,
    recordHref: "/fees",
  },
];

export function sortedCorrections(list: CorrectionEntry[] = corrections): CorrectionEntry[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}
