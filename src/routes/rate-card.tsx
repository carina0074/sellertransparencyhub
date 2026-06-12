import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, FileJson } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AMAZON_REFERRAL_RATES,
  AMAZON_FULFILLMENT_FEES,
  AMAZON_STORAGE_PER_CUFT,
} from "@/lib/marketplace-fees";

export const Route = createFileRoute("/rate-card")({
  head: () => ({
    meta: [
      { title: "Amazon FBA Public Rate Card — Referral, Fulfillment & Storage Fees" },
      { name: "description", content: "Hand-maintained JSON of Amazon's public referral percentages, FBA fulfillment fees, and monthly storage rate. Sourced directly from Seller Central." },
      { property: "og:title", content: "Amazon Public Rate Card" },
      { property: "og:description", content: "Transparent reference of the Amazon fee rates that power our calculator." },
    ],
  }),
  component: RateCardPage,
});

function RateCardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Amazon FBA Public Rate Card"
        description="The exact JSON used by our profit calculator. Hand-maintained from Amazon's published Seller Central fee schedule — no API access required."
      />
      <section className="mx-auto max-w-5xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">Source</Badge>
          <a
            href="https://sellercentral.amazon.com/help/hub/reference/external/200336920"
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Amazon Seller Central — Fee Schedule <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <span>·</span>
          <span>Last reviewed: January 2025</span>
        </div>

        <JsonCard
          title="Referral fee percentages by category"
          description="Percent of item price Amazon deducts on each sale."
          data={AMAZON_REFERRAL_RATES}
          format="pct"
        />

        <JsonCard
          title="FBA fulfillment fee by size tier (USD)"
          description="Per-unit fee Amazon charges to pick, pack, and ship."
          data={AMAZON_FULFILLMENT_FEES}
          format="usd"
        />

        <JsonCard
          title="Monthly storage fee (per cubic foot)"
          description="Standard-size, January through September."
          data={{ standard_jan_sep: AMAZON_STORAGE_PER_CUFT }}
          format="usd"
        />

        <Card className="border-border bg-muted/40">
          <CardContent className="p-6 text-sm text-muted-foreground">
            <p>
              These values are stored in <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">src/lib/marketplace-fees.ts</code> and
              updated by hand whenever Amazon publishes a new fee schedule. We deliberately do <strong>not</strong> call the
              SP-API <code className="font-mono text-xs">getMyFeesEstimate</code> endpoint — keeping a versioned JSON gives sellers
              a transparent, auditable source of truth they can verify against the official Amazon documentation.
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function JsonCard({
  title, description, data, format,
}: { title: string; description: string; data: Record<string, number>; format: "pct" | "usd" }) {
  const fmt = (n: number) =>
    format === "pct" ? `${(n * 100).toFixed(0)}%` : `$${n.toFixed(2)}`;
  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <FileJson className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
{JSON.stringify(data, null, 2)}
          </pre>
          <ul className="divide-y divide-border rounded-md border border-border">
            {Object.entries(data).map(([k, v]) => (
              <li key={k} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="capitalize text-muted-foreground">{k.replace(/_/g, " ")}</span>
                <span className="font-semibold tabular-nums text-foreground">{fmt(v)}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}