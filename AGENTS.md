# Architecture rules

- Store current percentage fees as decimal fractions; preserve historical data conventions independently to avoid rewriting past events.
- Store optional fee applicability and composite pricing in `fee_records.pricing_details`; monetary components use integer minor units and explicit currency, and pure formatting lives in `src/lib/fee-formatting.ts` so UI and tests share one interpretation.