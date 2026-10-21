# Etsy fee correction — proposed changes only

## Scope and inspection results

No application code, database records, page content, or deployment settings have been changed. This proposal is limited to the four existing Etsy current-fee records, their representation on the Marketplace Fee Database page, and focused tests.

Confirmed from the database and source files:
- `fee_records.value` is numeric; `value_type` is text. Sources, effective dates, and verification dates already exist. There is only one numeric amount per record, with no structured fixed component, country scope, or conditional rate.
- **All 25 non-Etsy percentage records use decimal fractions**, ranging from `0.0135` to `0.17`. **All three Etsy percentage records use percentage points**: `6.5`, `3.0`, and `15.0`.
- `src/lib/fees.functions.ts:158–170` multiplies every `percent` amount by 100. Therefore Etsy displays `650.0%`, `300.0%`, and `1500.0%`. It has no `usd` branch, so the listing fee displays `0.2`.
- `src/routes/rate-card.tsx:137–158` displays the numeric amount and dates, but not fee notes. The existing US fixed processing charge and Offsite Ads conditions are consequently hidden.
- `fee_changes` currently has no Etsy events. All existing historical records, including other marketplaces, will remain untouched.

## Official verification

The following official Etsy pages were successfully fetched during this review:

1. [Fees and Taxes for Selling on Etsy](https://help.etsy.com/hc/en-us/articles/115014483627-What-are-the-Fees-and-Taxes-for-Selling-on-Etsy): $0.20 per ordinary listing, due whether it sells or not; four-month expiry. Transaction fee is 6.5%, including charged shipping and gift wrapping. Listing renewals and additional quantities can incur additional listing fees.
2. [Payment Processing Fees](https://help.etsy.com/hc/en-us/articles/115015628847-What-are-Payment-Processing-Fees-for-Selling-on-Etsy): rates depend on the **seller’s bank-account location**, not a universal Etsy rate. US: **3% + $0.25 USD per order**. Processing applies to the sale total including shipping and applicable sales tax; VAT on processing fees applies where required.
3. [How Etsy’s Offsite Ads Work](https://help.etsy.com/hc/en-us/articles/360000338367-How-Etsy-s-Offsite-Ads-Work): **15%** for shops that have always remained below $10,000 USD in any consecutive 365-day period; participation is optional/eligible for opt-out. **12%** once a shop reaches at least $10,000 USD in any consecutive 365-day period; participation is required for the shop’s lifetime. Only attributed orders qualify, generally within 30 days of an ad click; maximum fee is **$100 USD per order**. A final click through an Etsy Ad instead is subject to the Etsy Ads fee, not both fees.

Country-specific examples verified from the processing table:

| Bank-account location | Current published processing fee |
|---|---|
| United States | 3% + $0.25 USD |
| United Kingdom | 4% + £0.20 GBP |
| Canada, domestic or US orders | 3% + C$0.25 CAD |
| Canada, other international orders | 4% + C$0.25 CAD |
| Australia, domestic orders | 3% + A$0.25 AUD |
| Australia, international orders | 4% + A$0.25 AUD |
| France / Germany / Spain | 4% + €0.30 EUR |

These examples establish that the existing payment record must be labeled **US**, not presented as worldwide. This task will not add a country-by-country dataset or additional fee rows; it will link to Etsy’s full country table.

**Source-link caveat:** the existing Offsite Ads URL returns 404; the existing transaction-fee URL redirects to the general Seller Handbook rather than a fee article. The existing Fees & Taxes URL reaches the correct fee schedule. To honor preservation of existing source URLs, retain every original `source_url` and `source_title` unchanged and add working supporting references. Display both the original reference and the directly relevant supporting documentation for the affected Etsy rows; mark the unusable original references as legacy references rather than implying they still substantiate the fee.

**Date caveat:** current documentation verifies current fees, not every stored historical effective date. Keep all four `effective_date` and `last_verified` values unchanged. Record this review’s separate check date as `2026-10-21` in the new supporting details, not as a replacement verification date. Do not imply that the stored 2018, 2020, or 2023 effective dates were independently proven by today’s fee schedule.

## Exact record-level proposal

Use **decimal fractions for every `value_type = 'percent'` current-fee amount**: `0.065 = 6.5%`. Do not use value-size guessing or change the meaning of `percent` in the formatter.

Add one nullable `pricing_details` JSONB column to `fee_records`. Only these four Etsy rows receive details; all other rows remain null. Details store structured fixed charges, conditional rates, applicability, and supporting references. Fixed monetary components and caps use integer minor units plus an explicit currency (US processing: `25` cents, USD; ads cap: `10000` cents, USD). The existing listing `value = 0.20` remains in dollars under the established `usd` value type.

| Existing record | Exact value change | Before display | Proposed primary display |
|---|---|---|---|
| Transaction Fee — `f4207dd9-af1a-4f58-bccb-f996b2efc595` | `6.5 → 0.065`; retain `percent` | `650.0%` | `6.5%` |
| Payment Processing Fee — `0f1a52ba-5275-4c22-9faa-98dfd0a9aa72` | `3.0 → 0.03`; retain `percent` | `300.0%` | `3.0% + $0.25 USD / order (US)` |
| Offsite Ads Fee — `5aa7bad9-5984-4156-8805-06e63bf60cdf` | `15.0 → 0.15`; retain `percent`; store alternative `0.12` in structured conditions | `1500.0%` | `12.0% or 15.0% — conditional` |
| Listing Fee — `413b8b13-08a9-4c93-9ffd-7a82cd4e7d4e` | No change: `0.20`, `usd` | `0.2` | `$0.20 USD / listing` |

The Offsite Ads row’s scalar `0.15` represents the documented below-threshold tier only; the visible display must use both structured tiers, never an unqualified 15% rate. Its details identify both tiers explicitly, including the **at least $10,000** boundary and lifetime participation condition. The public fee response will also include these details so readers can interpret the scalar correctly.

Visible supporting text for the Etsy rows:
- **Transaction:** applies to item price plus charged shipping and gift wrapping; separate from payment processing.
- **Payment:** US bank-account rate; charged per Etsy Payments order, including shipping and applicable sales tax; country-specific rates and currencies differ. Link to Etsy’s complete processing table. Do not turn the illustrative country examples above into new records.
- **Offsite Ads:** specify each threshold/rate, opt-out versus required participation, 30-day attribution, and $100 USD/order cap. Include the Etsy Ads last-click exception in the details.
- **Listing:** ordinary listing, payable regardless of sale; four-month expiry; renewals/additional quantities can incur additional fees; Etsy converts USD listing fees where applicable.

Retain original `notes` as well as IDs, names, categories, fee types, source fields, creation dates, effective dates, and verification dates. Display the corrected structured conditions instead of using the old Offsite Ads note’s inaccurate “over $10K in past 12 months” wording.

## Affected files

1. **New `supabase/migrations/<timestamp>_etsy_fee_normalization.sql`**
   - Add nullable `pricing_details` and update only the four listed IDs.
   - Guard expected original values and marketplace identities; fail/roll back if the records differ from the inspected state. Make reruns safe without dividing an already-normalized amount again.
   - Validate that all current percentage amounts are fractions in `[0, 1]`, then enforce that convention for `fee_records` only. Do not add constraints to or update `fee_changes`.
   - Preserve all fields specified above; add supporting URLs instead of replacing original URLs. No inserts, deletes, or new fee events.
2. **New `src/lib/fee-formatting.ts`**
   - Extract the existing pure formatter without changing existing percentage rounding or existing per-unit/per-month/per-cubic-foot output.
   - Add `usd` formatting as `$0.20 USD`.
   - Add a typed record-level presentation helper for Etsy’s fixed charge and conditional rates. Read those amounts from the database details, not hardcoded marketplace rates or parsing prose notes.
   - Reject malformed structured details rather than silently displaying an unconditional Offsite Ads rate.
3. **`src/lib/fees.functions.ts`**
   - Add the typed details field to `FeeRecord` and its SELECT/mapping.
   - Re-export `formatFeeValue` from the pure module to preserve existing imports and historical percentage behavior. Do not alter historical queries or server authentication.
4. **`src/routes/rate-card.tsx`**
   - Use the presentation helper for the four Etsy rows; show their conditions and supporting references beneath the relevant existing cells, with readable wrapping.
   - Keep other marketplaces’ displays and the existing table/filter behavior unchanged. Do not alter counts, freshness claims, calculator links, or page copy outside these fee rows.
5. **`src/routes/api/public/fees.ts`**
   - Include `pricing_details` in its existing response, preserving every existing response field. No new endpoint, no unrelated API changes.
6. **New `src/lib/fee-formatting.test.ts`**
   - Use Bun’s existing test runner; no test-library dependency needed.

The generated database types may refresh automatically after the migration; do not edit them manually. Document the percentage/details convention in the project’s architecture guidance during implementation, without adding unrelated rules.

## Focused tests and validation

Formatting regression tests:
- `formatFeeValue(0.065, 'percent')` returns `6.5%`.
- `formatFeeValue(0.03, 'percent')` returns `3.0%`.
- `formatFeeValue(0.12, 'percent')` and `formatFeeValue(0.15, 'percent')` return `12.0%` and `15.0%`.
- `formatFeeValue(0.20, 'usd')` returns `$0.20 USD`.
- Representative existing formats remain unchanged: `0.15 → 15.0%`, eBay `0.1325 → 13.3%`, `$3.45 / unit`, `$0.75 / cu.ft`, and `$39.00 / mo`.

Structured-rule tests, separate from styling or page-copy assertions:
- US processing represents fraction `0.03`, fixed component `25` cents, currency `USD`, and bank-account country `US`.
- Conditional ads data resolves to `0.15` below $10,000 USD when the threshold has never been reached, and `0.12` at exactly $10,000 USD or once that threshold was reached previously, even if recent revenue later falls below it.
- Ads applicability records 30-day attribution and a `10000`-cent USD cap; missing/malformed tier data cannot produce a universal-rate presentation.
- No detailed presentation is applied to another marketplace merely because it uses a similar fee name.

After approval, run the focused tests, confirm the automatic build succeeds, and verify the real `/rate-card` Etsy results in the browser. Read back the database to confirm only the approved fields changed, all four original source/date fields remain identical, non-Etsy records are unchanged, and historical records are unchanged.

## Explicit exclusions

No changes to coverage claims, calculator rates, historical records, other report/home/fee-change pages, deployment settings, or publication. No implementation until this proposal is reviewed and approved.