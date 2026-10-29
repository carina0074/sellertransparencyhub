import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Database, ClipboardList, FileText, Archive } from "lucide-react";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — Seller Transparency Hub" },
      { name: "description", content: "How Seller Transparency Hub sources, reviews, dates, and qualifies marketplace fee and policy information, and the limits of its coverage." },
      { property: "og:title", content: "Methodology — Seller Transparency Hub" },
      { property: "og:description", content: "Source standards, verification and date practices, and coverage limitations behind Seller Transparency Hub's curated marketplace fee research." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MethodologyPage,
});

const sources = [
  { icon: FileText, label: "Dated official marketplace announcements" },
  { icon: ClipboardList, label: "Official fee schedules" },
  { icon: Database, label: "Official seller help, policy, and program documentation" },
  { icon: Archive, label: "Archived copies of official marketplace pages (for historical research)" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="border-border">
      <CardContent className="space-y-3 p-6 text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

const linkClass = "text-primary hover:underline";

function MethodologyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Research methodology"
        title="Methodology"
        description="How marketplace fee and policy information is sourced, reviewed, dated, and qualified, and where its limits are."
      />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
        <Section title="Research approach">
          <p>
            Seller Transparency Hub collects and reviews publicly available fee and policy information from major e-commerce marketplaces. Research is carried out manually. Records are reviewed and updated as research is conducted and source documentation is re-evaluated. There is no automated or real-time monitoring of marketplace pages, and no fixed review schedule.
          </p>
          <p>Material records are meant to be traceable to identifiable evidence wherever that evidence is available.</p>
        </Section>

        <Section title="What we track">
          <p>The research covers three separate kinds of records:</p>
          <Bullets
            items={[
              <><span className="font-medium text-foreground">Current fee records</span> (<Link to="/rate-card" className={linkClass}>Fee Database</Link>): current marketplace fees that have been reviewed against identified source documentation, including their scope and conditions.</>,
              <><span className="font-medium text-foreground">Historical fee changes</span> (<Link to="/fees" className={linkClass}>Fee Change Feed</Link>): documented transitions where the evidence supports the previous value, the new value, the timing, and who was affected.</>,
              <><span className="font-medium text-foreground">Policy events</span> (<Link to="/policy-changes" className={linkClass}>Policy Archive</Link>): selected marketplace policy developments that meet the same evidence standard.</>,
            ]}
          />
          <p>Coverage currently spans Amazon, eBay, Walmart Marketplace, Etsy, and Shopify. All three collections are curated and non-exhaustive.</p>
        </Section>

        <Card className="border-border">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-base font-semibold text-foreground">Source standards</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Marketplace fee and policy facts are based mainly on documentation published by the marketplaces themselves. Preferred sources, in order:
            </p>
            <ul className="space-y-3">
              {sources.map((s) => (
                <li key={s.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-4 w-4" />
                  </span>
                  {s.label}
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Different source types support different claims. A current help page can support a current rule, but it doesn't prove when that rule began or what came before it. Not every source is an announcement, and records are labeled by the kind of evidence behind them. Third-party summaries, forums, and search snippets are not used as the sole basis for material facts.
            </p>
          </CardContent>
        </Card>

        <Section title="Current fee verification">
          <p>
            Each current fee record lists its source and the date it was last reviewed against current first-party evidence. Verification applies to the value and scope as written in the record. It does not establish when that value first took effect.
          </p>
        </Section>

        <Section title="Historical fee changes and policy events">
          <p>
            Historical research needs stronger evidence about timing than current-value research does. Suitable evidence includes dated official announcements, archived official pages, dated marketplace documentation, and official historical notices. A current pricing or policy page on its own is generally not enough to establish a previous value, a transition date, or who a change applied to.
          </p>
          <p>
            Missing records don't mean nothing happened. The absence of a record does not mean a fee never changed or a policy was never updated.
          </p>
        </Section>

        <Section title="Dates and verification">
          <p>Each date has its own meaning:</p>
          <Bullets
            items={[
              <><span className="font-medium text-foreground">Effective date:</span> when a fee or policy took effect, recorded only when evidence supports it.</>,
              <><span className="font-medium text-foreground">Announcement date:</span> when the marketplace published the change. This can differ from the effective date.</>,
              <><span className="font-medium text-foreground">Last reviewed / verified:</span> when the record was checked against evidence. This is not when the marketplace changed the fee, and not a review of the whole dataset.</>,
              <><span className="font-medium text-foreground">Record created / updated:</span> internal bookkeeping dates, never used as evidence of marketplace timing.</>,
            ]}
          />
          <p>
            Effective dates are never inferred from page access dates, page update timestamps, current pricing pages, or database modification dates. Historical events record dates to the precision the evidence supports: an exact day, a month, a year, or unknown. Current fee records whose start date is not established show no effective date.
          </p>
        </Section>

        <Section title="Conditional and tiered fees">
          <p>
            Many marketplace fees depend on conditions such as marketplace, seller plan, category, item price or price band, fulfillment method, product size and weight, storage duration, season, geography, advertising attribution, or seller eligibility. Conditional fees are not turned into misleading universal flat rates. Instead, records may show tiers explicitly, attach conditions, limit their stated scope, or be retired if a single value would oversimplify the fee. The Fee Database does not calculate every possible seller cost.
          </p>
        </Section>

        <Section title="Calculator method">
          <p>
            The <Link to="/calculator" className={linkClass}>Calculator</Link> is an educational estimation tool. It uses supported fee logic and states its assumptions. Its rates are maintained separately and are not generated automatically from every Fee Database record. It is not a quote, a billing statement, or a full invoice simulator, and it may not include every seller-specific charge. When the inputs or evidence aren't enough to estimate a complex component, such as some fulfillment or storage fees, it shows "Not estimated" rather than making up a figure.
          </p>
        </Section>

        <Section title="Quarterly reports">
          <p>
            Quarterly reports are research publications about specific periods. The methodology has developed over time, so earlier reports were not all produced with today's practices. The <Link to="/reports/q2-2026" className={linkClass}>Q2 2026 report</Link> remains a historical publication, with later source-review notes labeled separately. The <Link to="/reports/q3-2026" className={linkClass}>Q3 2026 report</Link> uses claim-level citations.
          </p>
        </Section>

        <Section title="Corrections">
          <p>
            Public records may be updated when first-party documentation changes, better historical evidence becomes available, a scope was overgeneralized, a fee was oversimplified, a source no longer supports what was published, or an error is found. Accuracy comes before record counts. Research-integrity reviews may correct a record, narrow its scope, improve its sourcing, or retire an unsupported historical claim. A retired historical record means the available evidence was not strong enough to keep publishing the original claim as established fact. It does not necessarily mean the event never happened.
          </p>
        </Section>

        <Section title="Coverage and limitations">
          <p>
            Coverage is selected, curated, and non-exhaustive. It does not aim to capture every fee, category, seller plan, geographic market, historical change, or policy event. The main focus is information relevant to U.S. sellers. Some records cover other marketplace regions, such as an eBay UK policy event, and are labeled with that geographic scope rather than presented as U.S. events.
          </p>
          <Bullets
            items={[
              "Marketplace documentation changes, and historical pages may become unavailable.",
              "Current pages may not establish historical timing.",
              "Fees can depend on seller, product, and geographic conditions.",
              "Complex fulfillment and storage pricing may need inputs that a simplified database doesn't capture.",
              "Terminology differs across marketplaces.",
              "Source availability and the quality of historical evidence vary.",
            ]}
          />
          <div className="rounded-md bg-muted/50 p-4">
            <p className="font-medium text-foreground">What Seller Transparency Hub does not claim</p>
            <Bullets
              items={[
                "Exhaustive marketplace coverage",
                "Real-time monitoring or automatic detection of marketplace changes",
                "Guaranteed seller-specific cost calculations",
                "That a missing record means there was no fee or no change",
                "That current documentation proves historical timing",
                "Perfect reproducibility for records whose original evidence is no longer available",
              ]}
            />
          </div>
        </Section>

        <Section title="Independence">
          <p>Seller Transparency Hub is independently maintained and is not affiliated with or endorsed by the marketplaces it covers.</p>
        </Section>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          Methodology last reviewed October 2026. Corrections are welcome. Current fee records list their source documentation.
        </p>
      </section>
    </>
  );
}
