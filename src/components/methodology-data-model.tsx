import type { ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-3 border-b border-border pb-6 text-sm leading-relaxed text-muted-foreground"><h2 className="text-base font-semibold text-foreground">{title}</h2>{children}</section>;
}
function Fields({ rows }: { rows: [string, string][] }) {
  return <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-border"><th className="py-2 pr-4">Field</th><th className="py-2">Meaning</th></tr></thead><tbody>{rows.map(([field, meaning]) => <tr key={field} className="border-b border-border"><td className="py-2 pr-4 align-top font-mono text-xs text-foreground">{field}</td><td className="py-2">{meaning}</td></tr>)}</tbody></table></div>;
}
export function MethodologyDataModel() {
  return <>
    <Block title="Data model">
      <p>Seller Transparency Hub publishes three separate collections: current fees, historical fee changes and policy events. Each records its own sources and geographic scope. Historical fee changes and policy events state how precisely their effective timing is known.</p>

    </Block>
    <Block title="Normalization rules">
      <p>Fees retain their stated units, conditions and geographic scope. Tiered pricing distinguishes a rate applied to the whole price from rates applied to portions of it, and from schedules based on other conditions. Records may be narrowed, corrected or retired when the evidence is insufficient. Fees awaiting verification may remain visible without a numeric headline.</p>
    </Block>
    <Block title="Evidence model">
      <p>Each record links to its own supporting sources. From now on, every current-fee reference must include a short supporting quote and the source section heading. Existing omissions are awaiting review and have not been filled in.</p>
      <p>Historical and policy sources support the stated change, its scope and its timing. The strength of the evidence and the precision of the effective date are recorded separately.</p>
    </Block>
    <Block title="How this differs from typical seller fee tools">
      <p>This project keeps related record structures across five marketplaces, links each record to its own sources, and keeps selected fee and policy changes as dated history with stated date precision. Its calculator is maintained separately from these records.</p>
    </Block>
  </>;
}
export function MethodologyTechnicalReference() {
  return <Accordion type="single" collapsible>
    <AccordionItem value="technical-reference">
      <AccordionTrigger className="text-base font-semibold text-foreground">Technical reference</AccordionTrigger>
      <AccordionContent className="space-y-6 text-muted-foreground">
        <Block title="Collections and public endpoints">
      <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-border"><th className="py-2 pr-3">Collection</th><th className="py-2 pr-3">One record represents</th><th className="py-2">Public endpoint</th></tr></thead><tbody>
        {[
          ["Current fee records", "One fee as currently documented for its recorded scope", "/api/public/fees"],
          ["Historical fee changes", "One documented fee transition, with old/new values and timing evidence", "/api/public/fee-changes"],
          ["Policy events", "One documented marketplace policy or governance change", "/api/public/policy-changes"],
        ].map(([name, meaning, endpoint]) => <tr key={endpoint} className="border-b border-border"><td className="py-2 pr-3 align-top">{name}</td><td className="py-2 pr-3">{meaning}</td><td className="py-2 break-all"><a href={endpoint} className="text-primary hover:underline">{endpoint}</a></td></tr>)}
      </tbody></table></div>
        </Block>
        <Block title="Record fields">
      <h3 className="font-semibold text-foreground">Core fields — current fee records</h3>
      <Fields rows={[
        ["id", "Record identifier, used for current-record relationships and prospective edit history."],
        ["marketplace", "Recorded values: Amazon, eBay, Walmart, Etsy and Shopify. Walmart Marketplace is the display name."],
        ["region", "Explicit geographic scope. US and UK identify countries; UNSPECIFIED means the evidence does not establish a country. Currency alone is not geography."],
        ["fee_name", "The record’s fee label."],
        ["category", "Recorded category, schedule, price band or applicability grouping; not a unified taxonomy."],
        ["fee_type", "Observed current values: Advertising, Aged Inventory, Card processing, Final value, Insertion, International, Listing, Low Inventory, Payment processing, Per-order, Referral, Storage, Subscription, Transaction, WFS fulfillment, WFS storage."],
        ["value, value_type", "Headline value and unit. Current percentages are decimal fractions; monetary headlines use the unit stated by value_type. Read conditional values with pricing_details."],
        ["pricing_details", "Structured pricing, conditions and supporting references; see Normalization rules."],
        ["source_url, source_title", "Recorded primary source link and title."],
        ["effective_date", "Nullable effective day, only where established. Current records have no separate effective-date-precision field."],
        ["last_verified", "Last successful first-party current-value review, not an effective date or a failed access attempt."],
        ["verification_status", "verified_current_value: reviewed current value and recorded applicability, not proof of its start date. partially_verified: headline value confirmed in a first-party source; at least one stated condition, tier or scope element is unconfirmed and identified in notes. verification_pending: pending; the public formatter suppresses the numeric headline and directs readers to the source."],
        ["notes", "Plain-language conditions and exceptions."],
        ["created_at, updated_at", "Creation timestamp and prospective current-fee edit timestamp. Earlier edits have not been backfilled."],
      ]} />
      <p>Historical fee changes are a separate shape, not current records with extra columns. Their fields are <code>id, record_id, marketplace, region, fee_type, category, title, old_value, new_value, value_type, change_amount, effective_date, announcement_date, impact_level, source_url, source_title, summary, created_at, effective_date_precision, effective_period, evidence_details</code>. <code>record_id</code> is nullable; <code>change_amount</code> is the stored difference, while the displayed relative change is calculated separately. A zero baseline displays “New fee”.</p>
      <p>Policy events have <code>id, marketplace, region, policy_area, title, summary, body_markdown, effective_date, announcement_date, impact_level, affected_sellers, source_url, source_title, last_verified, created_at, updated_at, effective_date_precision, effective_period, evidence_details</code>. They do not inherit current-fee values or pricing details.</p>
        </Block>
        <Block title="Pricing representation">
      <ol className="ml-5 list-decimal space-y-2">
        <li>Top-level monetary values use dollar-based units stated by <code>value_type</code>, not integer cents. Structured fields ending in <code>_minor</code> use integer minor units, with currency where the pricing variant defines it. Current percentage rates are decimal fractions; historical conventions are preserved independently.</li>
        <li>Tiered pricing preserves labeled tiers and distinguishes <code>threshold</code> (whole-price), <code>marginal</code> (portions) and <code>schedule</code> modes. Rates, amounts and bounds are recorded where applicable; an open-ended bound may be null or omitted.</li>
        <li><code>basis</code> and <code>scope</code> are optional structured fields. Additional applicability may appear in category, conditions and notes.</li>
        <li>Structured pricing includes a conditions array; qualifications can also appear in explanatory prose.</li>
        <li>Region is stored explicitly in each collection. It does not imply every title names the region.</li>
        <li>Records may be qualified, narrowed, corrected or retired when evidence or pricing representation is insufficient. Pending records can remain visible without a numeric headline.</li>
      </ol>        </Block>
        <Block title="Evidence references">
      <Fields rows={[
        ["Current-fee references", "pricing_details.references: title and HTTPS URL; new or revised evidence requires a short supporting quote and source section heading. Legacy omissions remain awaiting review."],
        ["Historical references", "evidence_details.references: title, HTTPS URL, quote and free-form evidence_type. Other evidence fields include status, reviewed_on, scope, conditions and linkage_reason."],
        ["Policy references", "evidence_details.references: title, HTTPS URL, quote, heading, free-form evidence_type and supported_fields. Other evidence fields include status, reviewed_on, scope, conditions and impact."],
      ]} />
          <p>For partial verification, <code>pricing_details.verification.headline_value_confirmed</code> records the reviewer's confirmation. <code>unconfirmed_elements</code> lists the unconfirmed conditions, tiers or scope elements; each must also appear in notes.</p>
        </Block>
    <Block title="Date model">
      <Fields rows={[
        ["announcement_date", "When the marketplace published the change; distinct from when it took effect."],
        ["effective_date", "Historical/policy exact precision requires a day and no effective_period. Month precision uses YYYY-MM in effective_period with no exact day; year uses YYYY; unknown leaves both empty. Current-fee effective_date is separately nullable."],
        ["last_verified / reviewed_on", "When the record was successfully checked against evidence, not marketplace change timing. Current/policy records have last_verified; historical review is in evidence_details.reviewed_on."],
        ["created_at / updated_at", "Internal timestamps, never proof of marketplace timing. Current-fee edits are automatically timestamped and logged per changed field; history is admin-only. Existing records initially had no update timestamp until an actual edit. Adding region is such an edit. There is no equivalent field-level history for historical or policy collections."],
      ]} />
    </Block>
      </AccordionContent>
    </AccordionItem>
  </Accordion>;
}
