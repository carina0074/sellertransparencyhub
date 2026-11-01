# Research snapshot data dictionary
Version: 0.0.0
Exported: 2026-11-01T02:00:19.360008+00:00
Status: unreleased sample; no license, DOI or public release is asserted.
Generated from information_schema.columns in the same database snapshot as the records.
CSV uses schema column order, quoted RFC-style cells, empty cells for SQL NULL, and JSON strings for structured values. JSON preserves nulls, numbers, arrays and objects. Regions use explicit source scope; UNSPECIFIED is not a country or a U.S. inference.

## fee_records

| Field | SQL type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| marketplace | text | NO | — |
| fee_name | text | NO | — |
| category | text | NO | — |
| fee_type | text | NO | — |
| value | numeric | NO | — |
| value_type | text | NO | — |
| effective_date | date | YES | — |
| source_url | text | NO | — |
| source_title | text | NO | — |
| last_verified | date | NO | — |
| notes | text | YES | — |
| created_at | timestamp with time zone | NO | now() |
| pricing_details | jsonb | YES | — |
| verification_status | text | NO | 'verification_pending'::text |
| updated_at | timestamp with time zone | YES | — |
| region | text | YES | — |

## fee_changes

| Field | SQL type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| record_id | uuid | YES | — |
| marketplace | text | NO | — |
| fee_type | text | NO | — |
| category | text | NO | — |
| title | text | NO | — |
| old_value | numeric | NO | — |
| new_value | numeric | NO | — |
| value_type | text | NO | — |
| change_amount | numeric | NO | — |
| effective_date | date | YES | — |
| announcement_date | date | YES | — |
| impact_level | text | NO | — |
| source_url | text | NO | — |
| source_title | text | NO | — |
| summary | text | YES | — |
| created_at | timestamp with time zone | NO | now() |
| effective_date_precision | text | NO | 'exact'::text |
| effective_period | text | YES | — |
| evidence_details | jsonb | YES | — |
| region | text | YES | — |

## policy_changes

| Field | SQL type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| marketplace | text | NO | — |
| policy_area | text | NO | — |
| title | text | NO | — |
| summary | text | NO | — |
| body_markdown | text | YES | — |
| effective_date | date | YES | — |
| announcement_date | date | YES | — |
| impact_level | text | NO | — |
| affected_sellers | text | YES | — |
| source_url | text | NO | — |
| source_title | text | NO | — |
| last_verified | date | NO | — |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |
| effective_date_precision | text | NO | 'unknown'::text |
| effective_period | text | YES | — |
| evidence_details | jsonb | YES | — |
| region | text | YES | — |