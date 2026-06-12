import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Database, ShieldCheck, GitBranch, Calculator, Code2 } from "lucide-react";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — Marketplace Fee Database" },
      { name: "description", content: "How the marketplace fee database is sourced, verified, version-controlled, and how impact estimates are calculated." },
      { property: "og:title", content: "Methodology — Marketplace Fee Database" },
      { property: "og:description", content: "Documented sourcing, verification cadence, and impact-calculation methodology behind every published fee record." },
    ],
  }),
  component: MethodologyPage,
});

const sections = [
  {
    icon: Database,
    title: "Where data comes from",
    body: "Every fee record is sourced directly from a marketplace's public seller help center: Amazon Seller Central, Walmart Seller Help, and Shopify's pricing pages. Each record stores the canonical source URL and the human-readable source title. We do not scrape third-party blogs or community posts — only first-party documentation issued by the marketplace itself.",
  },
  {
    icon: ShieldCheck,
    title: "How often it's verified",
    body: "Records carry a last_verified date. We re-open the canonical source on a rolling cadence — at minimum quarterly, and within five business days of a marketplace fee announcement. When the published value still matches, we update last_verified. When the value has changed, we open a new version (see below).",
  },
  {
    icon: GitBranch,
    title: "How fee changes are tracked",
    body: "When a marketplace publishes a new fee, the previous value is preserved in the fee_changes table with old_value, new_value, effective_date, and announcement_date. The active record in fee_records is updated to the new value. This means the database carries a complete version history and every change is auditable to its source URL.",
  },
  {
    icon: Calculator,
    title: "How impact is estimated",
    body: "Per-record percentage impact is calculated as (new_value − old_value) / old_value. Impact level (low / medium / high) is assigned editorially based on per-unit dollar delta and the share of typical sellers affected, using publicly reported category-mix data. Estimated seller impact figures published in long-form Impact Reports cite their methodology and sample size inline.",
  },
  {
    icon: Code2,
    title: "Public, programmatic access",
    body: "The same data powering this site is exposed at /api/public/fees, /api/public/fee-changes, and /api/public/marketplaces as JSON. Endpoints are read-only and unauthenticated, intended for researchers, journalists, and seller tooling. Every JSON record includes its source_url so third parties can independently verify any value.",
  },
];

function MethodologyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Documented system"
        title="Methodology"
        description="How fee data is sourced, verified, version-controlled, and translated into impact estimates. Maintained as a public transparency resource for marketplace sellers."
      />
      <section className="mx-auto max-w-3xl space-y-4 px-4 py-12 sm:px-6">
        {sections.map((s) => (
          <Card key={s.title} className="border-border">
            <CardContent className="flex gap-4 p-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <div className="space-y-1.5">
                <h2 className="text-base font-semibold text-foreground">{s.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        <p className="pt-4 text-center text-xs text-muted-foreground">
          Methodology last reviewed June 2026. Corrections welcome — every record links back to its original public source.
        </p>
      </section>
    </>
  );
}