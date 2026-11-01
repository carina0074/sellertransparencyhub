# Research snapshot data dictionary
Version: 0.0.0
Exported: 2026-11-01T02:00:19.360008+00:00
Status: unreleased sample; no license, DOI or public release is asserted.
Generated from information_schema.columns in the same database snapshot as the records.
CSV uses schema column order, quoted RFC-style cells, empty cells for SQL NULL, and JSON strings for structured values. JSON preserves nulls, numbers, arrays and objects. Regions use explicit source scope; UNSPECIFIED is not a country or a U.S. inference.

## fee_records

| Field | SQL type | Nullable | Default | Meaning |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | Record identifier, used for current-record relationships and prospective edit history. |
| marketplace | text | NO | — | Recorded values: Amazon, eBay, Walmart, Etsy and Shopify. Walmart Marketplace is the display name. |
| fee_name | text | NO | — | The record’s fee label. |
| category | text | NO | — | Recorded category, schedule, price band or applicability grouping; not a unified taxonomy. |
| fee_type | text | NO | — | Observed current values: Advertising, Aged Inventory, Card processing, Final value, Insertion, International, Listing, Low Inventory, Payment processing, Per-order, Referral, Storage, Subscription, Transaction, WFS fulfillment, WFS storage. |
| value | numeric | NO | — | Headline value. Current percentages are decimal fractions; monetary headlines use the unit stated by value_type. Read conditional values with pricing_details. |
| value_type | text | NO | — | Headline unit. Current percentages are decimal fractions; monetary headlines use the stated dollar-based unit. |
| effective_date | date | YES | — | Nullable effective day, only where established. Current records have no separate effective-date-precision field. |
| source_url | text | NO | — | Recorded primary source link. |
| source_title | text | NO | — | Recorded primary source title. |
| last_verified | date | NO | — | Last successful first-party current-value review, not an effective date or a failed access attempt. |
| notes | text | YES | — | Plain-language conditions and exceptions. |
| created_at | timestamp with time zone | NO | now() | Internal creation timestamp, never proof of marketplace timing. |
| pricing_details | jsonb | YES | — | Structured pricing, conditions and supporting references; see Normalization rules. |
| verification_status | text | NO | 'verification_pending'::text | verified_current_value: reviewed current value and recorded applicability, not proof of its start date. partially_verified: headline value confirmed in a first-party source; at least one stated condition, tier or scope element is unconfirmed and identified in notes. verification_pending: pending; the public formatter suppresses the numeric headline and directs readers to the source. |
| updated_at | timestamp with time zone | YES | — | Prospective current-fee edit timestamp. Earlier edits have not been backfilled. |
| region | text | YES | — | Explicit geographic scope. US and UK identify countries; UNSPECIFIED means the evidence does not establish a country. Currency alone is not geography. |

## fee_changes

| Field | SQL type | Nullable | Default | Meaning |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | Record identifier, used for current-record relationships and prospective edit history. |
| record_id | uuid | YES | — | Nullable link to the same current fee concept, only where supported by evidence. |
| marketplace | text | NO | — | Recorded values: Amazon, eBay, Walmart, Etsy and Shopify. Walmart Marketplace is the display name. |
| fee_type | text | NO | — | Recorded fee type; a free-text label, not a unified taxonomy. |
| category | text | NO | — | Recorded category, schedule, price band or applicability grouping; not a unified taxonomy. |
| title | text | NO | — | The record’s title. |
| old_value | numeric | NO | — | Fee value before the documented transition, in value_type units. |
| new_value | numeric | NO | — | Fee value after the documented transition, in value_type units. |
| value_type | text | NO | — | Unit of the stored fee values; historical conventions are preserved independently. |
| change_amount | numeric | NO | — | Stored difference; the displayed relative change is calculated separately. A zero baseline displays New fee. |
| effective_date | date | YES | — | Established effective day; empty when an exact day is not established. |
| announcement_date | date | YES | — | When the marketplace published the change; distinct from when it took effect. |
| impact_level | text | NO | — | Recorded impact classification; not an official marketplace rating. |
| source_url | text | NO | — | Recorded primary source link. |
| source_title | text | NO | — | Recorded primary source title. |
| summary | text | YES | — | Plain-language summary of the documented change. |
| created_at | timestamp with time zone | NO | now() | Internal creation timestamp, never proof of marketplace timing. |
| effective_date_precision | text | NO | 'exact'::text | How precisely the effective timing is established: exact day, month, year or unknown. |
| effective_period | text | YES | — | Effective month (YYYY-MM) or year (YYYY) when no exact day is established; empty for exact or unknown timing. |
| evidence_details | jsonb | YES | — | Historical change evidence, supporting references, review date, scope, conditions and current-record linkage reason. |
| region | text | YES | — | Explicit geographic scope. US and UK identify countries; UNSPECIFIED means the evidence does not establish a country. Currency alone is not geography. |

## policy_changes

| Field | SQL type | Nullable | Default | Meaning |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | Record identifier, used for current-record relationships and prospective edit history. |
| marketplace | text | NO | — | Recorded values: Amazon, eBay, Walmart, Etsy and Shopify. Walmart Marketplace is the display name. |
| policy_area | text | NO | — | Recorded policy or governance area. |
| title | text | NO | — | The record’s title. |
| summary | text | NO | — | Plain-language summary of the documented change. |
| body_markdown | text | YES | — | Additional explanatory text about the policy event. |
| effective_date | date | YES | — | Established effective day; empty when an exact day is not established. |
| announcement_date | date | YES | — | When the marketplace published the change; distinct from when it took effect. |
| impact_level | text | NO | — | Recorded impact classification; not an official marketplace rating. |
| affected_sellers | text | YES | — | Seller groups affected within the event’s recorded scope. |
| source_url | text | NO | — | Recorded primary source link. |
| source_title | text | NO | — | Recorded primary source title. |
| last_verified | date | NO | — | Last recorded policy evidence review, not marketplace change timing. |
| created_at | timestamp with time zone | NO | now() | Internal creation timestamp, never proof of marketplace timing. |
| updated_at | timestamp with time zone | NO | now() | Internal edit timestamp, never proof of marketplace timing. |
| effective_date_precision | text | NO | 'unknown'::text | How precisely the effective timing is established: exact day, month, year or unknown. |
| effective_period | text | YES | — | Effective month (YYYY-MM) or year (YYYY) when no exact day is established; empty for exact or unknown timing. |
| evidence_details | jsonb | YES | — | Policy event evidence, supporting references, review date, scope, conditions and seller impact. |
| region | text | YES | — | Explicit geographic scope. US and UK identify countries; UNSPECIFIED means the evidence does not establish a country. Currency alone is not geography. |