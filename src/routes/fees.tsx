import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownNarrowWide, Search, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/fees")({
  head: () => ({
    meta: [
      { title: "Marketplace Fee Transparency Dashboard — Amazon, Walmart, Shopify" },
      { name: "description", content: "Track Amazon, Walmart, and Shopify fee changes as they happen. Estimated seller impact and affected categories at a glance." },
      { property: "og:title", content: "Fee Transparency Dashboard" },
      { property: "og:description", content: "Recent marketplace fee changes and seller impact estimates." },
    ],
  }),
  component: FeesPage,
});

type Change = {
  id: string;
  marketplace: "Amazon" | "Walmart" | "Shopify";
  title: string;
  date: string;
  impact: "low" | "medium" | "high";
  direction: "up" | "down";
  estimate: string;
  categories: string[];
  summary: string;
};

const CHANGES: Change[] = [
  { id: "1", marketplace: "Amazon", title: "FBA fulfillment fee restructure for large standard", date: "2026-05-12", impact: "high", direction: "up", estimate: "+$0.42 per unit avg.", categories: ["Home & Kitchen", "Toys"], summary: "Tier boundaries shifted; items between 12-16 oz now reclassified into the higher band." },
  { id: "2", marketplace: "Amazon", title: "Low-inventory-level fee expansion", date: "2026-04-28", impact: "medium", direction: "up", estimate: "+0.8% of revenue (affected SKUs)", categories: ["All categories"], summary: "Threshold raised to 28 days of supply. Sellers with leaner inventory will see new charges." },
  { id: "3", marketplace: "Walmart", title: "Referral fee cut for sporting goods", date: "2026-04-05", impact: "medium", direction: "down", estimate: "-2 pts referral", categories: ["Sporting Goods"], summary: "Walmart reduces referral fee from 15% to 13% for items under $100 in sporting goods." },
  { id: "4", marketplace: "Shopify", title: "Online credit card rate increase (Basic)", date: "2026-03-22", impact: "low", direction: "up", estimate: "+0.1%", categories: ["All"], summary: "Basic plan online rate increases from 2.9% + 30¢ to 3.0% + 30¢." },
  { id: "5", marketplace: "Amazon", title: "Aged inventory surcharge tiers refined", date: "2026-03-09", impact: "medium", direction: "up", estimate: "+$0.18 per cu.ft. (271–365 days)", categories: ["Books", "Apparel"], summary: "New 271-365 day tier introduced; previously merged with 365+." },
  { id: "6", marketplace: "Walmart", title: "WFS pick & pack tier added for small electronics", date: "2026-02-14", impact: "low", direction: "up", estimate: "+$0.15 per unit", categories: ["Electronics"], summary: "New small electronics tier created with slightly higher pick & pack." },
  { id: "7", marketplace: "Shopify", title: "Shopify Payments chargeback reversal credit", date: "2026-02-01", impact: "low", direction: "down", estimate: "-$15 per reversed chargeback", categories: ["All"], summary: "Shopify now refunds the $15 chargeback fee on merchant-won disputes." },
];

function FeesPage() {
  const [q, setQ] = useState("");
  const [marketplace, setMarketplace] = useState<string>("all");
  const [sort, setSort] = useState<"date" | "impact">("date");

  const filtered = useMemo(() => {
    const impactRank = { high: 3, medium: 2, low: 1 } as const;
    return CHANGES
      .filter((c) => (marketplace === "all" ? true : c.marketplace === marketplace))
      .filter((c) => {
        const s = q.trim().toLowerCase();
        if (!s) return true;
        return [c.title, c.summary, ...c.categories].join(" ").toLowerCase().includes(s);
      })
      .sort((a, b) =>
        sort === "date"
          ? b.date.localeCompare(a.date)
          : impactRank[b.impact] - impactRank[a.impact]
      );
  }, [q, marketplace, sort]);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Fee Transparency Dashboard"
        description="Recent marketplace fee changes across Amazon, Walmart, and Shopify — with estimated seller impact and affected categories."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px_200px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search fees, categories, summaries…" className="pl-9" />
          </div>
          <Select value={marketplace} onValueChange={setMarketplace}>
            <SelectTrigger><SelectValue placeholder="Marketplace" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All marketplaces</SelectItem>
              <SelectItem value="Amazon">Amazon</SelectItem>
              <SelectItem value="Walmart">Walmart</SelectItem>
              <SelectItem value="Shopify">Shopify</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as "date" | "impact")}>
            <SelectTrigger>
              <span className="flex items-center gap-2">
                <ArrowDownNarrowWide className="h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort: Most recent</SelectItem>
              <SelectItem value="impact">Sort: Highest impact</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map((c) => (
            <Card key={c.id} className="border-border transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="rounded-full">{c.marketplace}</Badge>
                      <span>{new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-foreground">{c.title}</h3>
                  </div>
                  <ImpactBadge level={c.impact} direction={c.direction} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{c.summary}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {c.categories.map((cat) => (
                      <span key={cat} className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{cat}</span>
                    ))}
                  </div>
                  <span className="font-medium text-foreground">{c.estimate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-sm text-muted-foreground">No fee changes match your filters.</p>
        )}
      </section>
    </>
  );
}

function ImpactBadge({ level, direction }: { level: "low" | "medium" | "high"; direction: "up" | "down" }) {
  const map = {
    high: "bg-destructive/10 text-destructive",
    medium: "bg-warning/15 text-warning-foreground",
    low: "bg-success/10 text-success",
  } as const;
  const Icon = direction === "up" ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${map[level]}`}>
      <Icon className="h-3.5 w-3.5" /> {level} impact
    </span>
  );
}