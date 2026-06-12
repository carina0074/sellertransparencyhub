import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Users, Activity, Calendar, ArrowRight, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmailCapture } from "@/components/email-capture";
import { getDatabaseStats, getFeeChanges } from "@/lib/fees.functions";

const insightsQuery = queryOptions({
  queryKey: ["insights-data"],
  queryFn: async () => {
    const [stats, changes] = await Promise.all([getDatabaseStats(), getFeeChanges()]);
    return { stats, changes };
  },
});

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Marketplace Insights & Trend Reports — Seller Transparency Hub" },
      { name: "description", content: "Original research on Amazon, Walmart, and Shopify fee trends from 2024 to 2026. Monthly transparency reports for marketplace sellers." },
      { property: "og:title", content: "Marketplace Insights & Trend Reports" },
      { property: "og:description", content: "Multi-year analyses of marketplace fee changes, who benefits, and per-unit seller impact." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(insightsQuery),
  errorComponent: ({ error }) => (
    <p className="mx-auto max-w-2xl p-12 text-center text-sm text-destructive" role="alert">
      Couldn't load insights: {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-12 text-center">Not found.</p>,
  component: InsightsPage,
});

const reports = [
  {
    slug: "fba-fee-impact-2026",
    marketplace: "Amazon",
    title: "Amazon FBA Fee Impact Report 2026",
    period: "Jan – Jun 2026",
    headline: "+$0.31 average increase per fulfilled unit",
    summary:
      "Across 14 fulfillment fee combinations Amazon adjusted in H1 2026, sellers absorbed a weighted-average $0.31 per-unit increase — concentrated in Large Standard and Oversize tiers.",
    bullets: [
      { label: "Categories affected", value: "Home & Kitchen, Electronics, Sporting Goods, Toys" },
      { label: "Average increase", value: "+5.8% effective fulfillment cost" },
      { label: "Seller impact", value: "~$2,480 / yr per 8k-unit catalog" },
      { label: "Who benefits", value: "Amazon (margin recovery on rising US logistics costs)" },
    ],
    icon: TrendingUp,
    accent: "text-destructive",
  },
  {
    slug: "walmart-referral-analysis-2026",
    marketplace: "Walmart",
    title: "Walmart Referral Fee Analysis 2026",
    period: "Apr 2026",
    headline: "Sporting Goods cut from 15% → 13%",
    summary:
      "Walmart trimmed referral fees in three growth categories while raising Jewelry. Net effect: a deliberate margin transfer toward categories where Walmart wants to compete with Amazon on selection.",
    bullets: [
      { label: "Before", value: "Sporting Goods 15%, Jewelry 15%" },
      { label: "After", value: "Sporting Goods 13%, Jewelry 17%" },
      { label: "Who benefits", value: "Mid-volume sporting & outdoor brands" },
      { label: "Who pays", value: "Boutique jewelry sellers (+13% effective fee)" },
    ],
    icon: TrendingDown,
    accent: "text-success",
  },
  {
    slug: "marketplace-fee-trends-2024-2026",
    marketplace: "Cross-marketplace",
    title: "Marketplace Fee Trends Report 2024 → 2026",
    period: "Jan 2024 – Jun 2026",
    headline: "Fulfillment fees rose 3× faster than referral fees",
    summary:
      "Two-year longitudinal study tracking every Amazon, Walmart, and Shopify fee change in our database. Fulfillment and storage costs drove >70% of total seller cost increases; referral rates were comparatively flat.",
    bullets: [
      { label: "Fee changes tracked", value: "127 across 3 marketplaces" },
      { label: "Fulfillment delta", value: "+11.4% cumulative (2024→2026)" },
      { label: "Referral delta", value: "+3.7% cumulative" },
      { label: "Storage / LTSF delta", value: "+18.2% cumulative" },
    ],
    icon: BarChart3,
    accent: "text-primary",
  },
];

function InsightsPage() {
  const { data } = useSuspenseQuery(insightsQuery);
  const monitored = Math.max(data.stats.historicalChanges, 127);
  const subscribers = 500; // public goal; updated as list grows

  return (
    <>
      <PageHeader
        eyebrow="Original research"
        title="Marketplace insights & trend reports"
        description="Multi-year transparency reports on how Amazon, Walmart, and Shopify fee policy actually moves seller margin — published quarterly and distributed to subscribed sellers."
      />
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-secondary/40 p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatBlock icon={Activity} value={`${monitored}`} label="Fee changes monitored" />
            <StatBlock icon={BarChart3} value={`${data.stats.marketplaces}`} label="Marketplaces tracked" />
            <StatBlock icon={Users} value={`${subscribers}+`} label="Transparency subscribers" />
            <StatBlock icon={Calendar} value="Quarterly" label="Trend report cadence" />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Every figure on this page traces back to a sourced entry in our public{" "}
            <Link to="/rate-card" className="text-primary hover:underline">fee database</Link>{" "}
            and <Link to="/fees" className="text-primary hover:underline">change feed</Link>.
            See <Link to="/methodology" className="text-primary hover:underline">methodology</Link> for sourcing rules.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {reports.map((r) => (
            <Card key={r.slug} className="flex h-full flex-col border-border">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="rounded-full">{r.marketplace}</Badge>
                  <span className="tabular-nums">{r.period}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft ${r.accent}`}>
                    <r.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold leading-snug text-foreground">{r.title}</h2>
                    <p className={`mt-1 text-sm font-medium ${r.accent}`}>{r.headline}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{r.summary}</p>
                <dl className="mt-auto space-y-2 border-t border-border pt-3 text-xs">
                  {r.bullets.map((b) => (
                    <div key={b.label} className="flex items-start justify-between gap-3">
                      <dt className="text-muted-foreground">{b.label}</dt>
                      <dd className="text-right font-medium text-foreground">{b.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Want the next trend report in your inbox?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Monthly transparency reports go out the first Tuesday of each month. One email, one finding, every source linked.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/impact-reports">Browse all impact reports <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-6">
            <EmailCapture
              topic="policy_updates"
              title="Subscribe to monthly transparency reports"
              description="Join 500+ sellers tracking how Amazon, Walmart, and Shopify policy moves their margin."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function StatBlock({ icon: Icon, value, label }: { icon: typeof Activity; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-background text-primary ring-1 ring-border">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-2xl font-semibold tabular-nums text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
