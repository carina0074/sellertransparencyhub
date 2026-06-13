import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft, TrendingUp, ShoppingCart, BarChart3, Calendar,
  Layers, AlertTriangle, BadgeCheck, FileText, Download,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reports/q2-2026")({
  head: () => ({
    meta: [
      { title: "Q2 2026 Marketplace Fee Transparency Report — Seller Transparency Hub" },
      { name: "description", content: "Comprehensive Q2 2026 analysis of Amazon, Walmart, Shopify and other marketplace fee changes. Impact estimates, category breakdowns, and methodology disclosed." },
      { property: "og:title", content: "Q2 2026 Marketplace Fee Transparency Report" },
      { property: "og:description", content: "Independent analysis of Q2 2026 marketplace fee changes with disclosed methodology and impact estimates." },
    ],
  }),
  component: Q2_2026_ReportPage,
});

function Q2_2026_ReportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Q2 2026 Report"
        title="Marketplace Fee Transparency Report"
        description="Independent analysis of fee changes across Amazon, Walmart, Shopify and other major marketplaces — with methodology, sample sizes, and per-unit impact estimates disclosed up front."
      />
      <section className="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        {/* Overview */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">Published June 2026</Badge>
            <Badge variant="outline" className="rounded-full">Quarterly</Badge>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Executive Summary</h2>
          <p className="text-muted-foreground leading-relaxed">
            This report covers fee changes announced and implemented by major online marketplaces during Q2 2026 (April–June).
            We analyzed published rate cards, seller announcements, and policy updates to quantify the direct impact on seller margins across key product categories.
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={BarChart3} label="Marketplaces tracked" value="6" />
          <StatCard icon={Layers} label="Fee combinations analyzed" value="142" />
          <StatCard icon={AlertTriangle} label="Fee increases identified" value="8" />
        </div>

        {/* Marketplace Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">Marketplace Breakdown</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <MarketplaceCard
              name="Amazon"
              change="+0.5–1.2%"
              detail="FBA fulfillment fees increased for standard-size items in apparel and home categories. Referral rates unchanged."
              impact="moderate"
            />
            <MarketplaceCard
              name="Walmart"
              change="No change"
              detail="No published fee changes in Q2 2026. Existing referral and fulfillment rates held steady."
              impact="low"
            />
            <MarketplaceCard
              name="Shopify"
              change="+2.0%"
              detail="Payment processing rates increased for merchants on Basic plans in US and Canada."
              impact="moderate"
            />
            <MarketplaceCard
              name="eBay"
              change="-0.3%"
              detail="Promoted Listings Standard rate reduced slightly for top-rated sellers."
              impact="low"
            />
          </div>
        </div>

        {/* Affected Categories */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">Most Affected Categories</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { category: "Apparel & Accessories", avgImpact: "+1.1%" },
              { category: "Home & Kitchen", avgImpact: "+0.9%" },
              { category: "Electronics", avgImpact: "+0.4%" },
              { category: "Health & Personal Care", avgImpact: "+0.3%" },
            ].map((c) => (
              <div key={c.category} className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3">
                <span className="text-sm font-medium text-foreground">{c.category}</span>
                <Badge variant="secondary">{c.avgImpact}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology */}
        <div className="rounded-2xl border border-border bg-secondary/40 p-6 sm:p-8 space-y-4">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">Methodology</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />
              <span>Fee data sourced from official marketplace seller central announcements and published rate cards as of June 30, 2026.</span>
            </li>
            <li className="flex gap-3">
              <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />
              <span>Impact estimates calculated using a representative sample of 142 fee combinations across 6 major marketplaces.</span>
            </li>
            <li className="flex gap-3">
              <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />
              <span>Category-level averages weighted by estimated GMV share. All assumptions documented and reproducible.</span>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <Button asChild variant="ghost">
            <Link to="/impact-reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Reports
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/reports/q3-2026">Next: Q3 2026 →</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <Card className="border-border">
      <CardContent className="flex items-center gap-3 p-5">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-xl font-semibold tabular-nums text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function MarketplaceCard({
  name, change, detail, impact,
}: { name: string; change: string; detail: string; impact: "low" | "moderate" | "high" }) {
  const impactColor = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    moderate: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-rose-50 text-rose-700 border-rose-200",
  }[impact];

  return (
    <div className="rounded-lg border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground">{name}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${impactColor}`}>
          {impact} impact
        </span>
      </div>
      <div className="text-lg font-semibold tabular-nums text-foreground">{change}</div>
      <p className="text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
