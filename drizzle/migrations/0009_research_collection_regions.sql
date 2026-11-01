ALTER TABLE public.fee_records ADD COLUMN region text;
ALTER TABLE public.fee_changes ADD COLUMN region text;
ALTER TABLE public.policy_changes ADD COLUMN region text;
COMMENT ON COLUMN public.fee_records.region IS 'Explicit source-supported geographic scope. US and UK are country codes; UNSPECIFIED means the source establishes no country. No automatic default.';
COMMENT ON COLUMN public.fee_changes.region IS 'Explicit historical geographic scope, independent of linked current record. UNSPECIFIED when country is not established; currency alone is not region evidence.';
COMMENT ON COLUMN public.policy_changes.region IS 'Explicit source-supported policy geography. US and UK are country codes; UNSPECIFIED means country not established.';
-- All current records have independently documented U.S. scope. This is a prospective metadata edit and is logged by the existing triggers.
UPDATE public.fee_records SET region = 'US';
-- Retained eBay history explicitly covers ebay.com U.S. sellers. The Shopify USD cohort announcement does not independently establish a country.
UPDATE public.fee_changes SET region = CASE WHEN id IN ('2ab83dc6-dd91-45de-a5b8-4633f3d102bb'::uuid, '47d5cb5e-2ac5-4d02-9c26-d66295efe60a'::uuid) THEN 'US' ELSE 'UNSPECIFIED' END;
UPDATE public.policy_changes SET region = 'UK' WHERE id = '51561c2b-a955-4b42-8d0b-b7a1e73253e2'::uuid;
ALTER TABLE public.fee_records ADD CONSTRAINT fee_records_region_present CHECK (region IS NOT NULL AND (region ~ '^[A-Z]{2}$' OR region = 'UNSPECIFIED'));
ALTER TABLE public.fee_changes ADD CONSTRAINT fee_changes_region_present CHECK (region IS NOT NULL AND (region ~ '^[A-Z]{2}$' OR region = 'UNSPECIFIED'));
ALTER TABLE public.policy_changes ADD CONSTRAINT policy_changes_region_present CHECK (region IS NOT NULL AND (region ~ '^[A-Z]{2}$' OR region = 'UNSPECIFIED'));