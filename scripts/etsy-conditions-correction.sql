-- Approved Etsy correction; preserves all values, source quotes and business dates.
BEGIN;
UPDATE public.fee_records
SET pricing_details = jsonb_set(pricing_details, '{conditions}', '[
  "$0.20 USD per ordinary Etsy listing, charged when created or renewed; no fee for editing.",
  "Charged whether or not the item sells, except private listings, which are charged when sold.",
  "Etsy.com listings expire after four months.",
  "Multi-quantity listings automatically renew at $0.20 after each item sells; multiple quantities sold can incur additional listing fees.",
  "Pattern-only listings are exempt."
]'::jsonb)
WHERE id = '413b8b13-08a9-4c93-9ffd-7a82cd4e7d4e' AND marketplace = 'Etsy' AND fee_name = 'Listing Fee';

UPDATE public.fee_records
SET pricing_details = jsonb_set(pricing_details, '{conditions}', '[
  "6.5% of the displayed listing price plus shipping and gift wrapping.",
  "Optional paid personalization is added to the display price subject to the transaction fee.",
  "For U.S. sellers, sales tax is excluded.",
  "Transaction fee is separate from Etsy Payments processing fees, which have a different tax-inclusive basis."
]'::jsonb)
WHERE id = 'f4207dd9-af1a-4f58-bccb-f996b2efc595' AND marketplace = 'Etsy' AND fee_name = 'Transaction Fee';

-- For this source-unspecified amount, the confirmed headline is the existence
-- and setup-process display, not a numeric amount; value remains NULL.
UPDATE public.fee_records
SET verification_status = 'partially_verified',
    notes = 'Existence and conditions verified on the policy page; amount not stated in the policy.',
    pricing_details = jsonb_set(pricing_details, '{verification}', '{"headline_value_confirmed":true,"unconfirmed_elements":["amount not stated in the policy"]}'::jsonb)
WHERE id = '2260c542-0ba8-4aa9-aca5-74bfcac9cf55' AND marketplace = 'Etsy' AND fee_name = 'Shop set-up fee';
COMMIT;