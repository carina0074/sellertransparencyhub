# Seller Transparency Hub

An independent, public record of what it costs to sell on major U.S. online marketplaces, and how those costs and rules change over time.

Live site: https://sellertransparency.com

Seller Transparency Hub is not affiliated with or endorsed by Amazon, eBay, Walmart, Etsy or Shopify.

## What this project is

Marketplace fees are published across many help pages, change without much notice, and come in different shapes: flat rates, tiers, per-order thresholds, minimums and monthly plans. This makes it hard for a small seller to answer a simple question: *what will it actually cost me to sell this product here?*

This project keeps a structured, source-linked record of those fees and rules in one schema across five marketplaces:

| Collection | What it holds | Public endpoint |
|---|---|---|
| Fee Database | Current fee records, each with its first-party source and review date | `/api/public/fees` |
| Fee Change Feed | Documented historical fee changes, with old and new values and timing evidence | `/api/public/fee-changes` |
| Policy Archive | Documented marketplace policy changes, with claim-level evidence | `/api/public/policy-changes` |

It also publishes quarterly Marketplace Fee Transparency Reports and an educational selling-cost estimator.

Coverage is curated and non-exhaustive. Each record is meant to be traceable to evidence, and records that can't be supported are corrected or retired. See the [Methodology](https://sellertransparency.com/methodology).

## Data model in brief

- Structured amounts (fields ending in `_minor`) are integer minor units (cents) with an explicit currency. Headline values use the unit stated by `value_type`.
- Tiered and conditional fees keep their structure (`pricing_details`), never collapsed into one flat rate.
- Each fee records its region, and its basis, scope and conditions where the source defines them.
- Evidence is stored per record: source URL, title, section and, where possible, a short supporting quote. Policy evidence lists which fields each source supports.
- Announcement date, effective date (with precision: exact, month, year or unknown) and last-reviewed date are kept separate and never inferred from one another.
- Edits to fee records are logged in an append-only history from November 2026 onward. Earlier records were not backfilled.

Full field definitions are in [`DATA_DICTIONARY.md`](DATA_DICTIONARY.md) [TO ADD with the first data release].

## Data releases

Versioned CSV and JSON snapshots of all three collections are published as [GitHub Releases](../../releases) [NONE YET] and archived with a DOI [TO ADD]. Released files never change. Corrections appear in the next version's release notes.

To cite the data, cite the specific version you used. See [`CITATION.cff`](CITATION.cff) [TO ADD].

## Corrections and history

In October 2026 every published record and report was reviewed against marketplace documentation. Unsupported records were retired, and tiered fees were restructured. The original June 2026 Q2 report is preserved unchanged as a historical document. Details: [Research Integrity & Source Verification Update](https://sellertransparency.com/changelog/october-2026).

Found an error? Open an issue with the record, what's wrong and a link to the source.

## How it's built

- **Research, data standards and editorial decisions:** see [`CONTRIBUTIONS.md`](CONTRIBUTIONS.md).
- **Application code:** generated with AI assistance using Lovable (TanStack Start, React, TypeScript, Tailwind) on Supabase (PostgreSQL). Commits authored by `gpt-engineer-app[bot]` are made by Lovable.
- **Analytics:** Google Analytics 4, limited to non-personal parameters. See the [Privacy page](https://sellertransparency.com/privacy).

### Run locally

```bash
bun install
bun run dev
```

Requires Supabase environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).

## License

- **Data** (fee records, change events, policy events and their exports): [Creative Commons Attribution 4.0 (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). See [`LICENSE-DATA`](LICENSE-DATA).
- **Code:** [MIT License](LICENSE).
- Marketplace names and quoted source text belong to their respective owners.

## Maintainer

Seller Transparency Hub · research@sellertransparency.com
