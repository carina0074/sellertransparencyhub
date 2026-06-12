import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Search, TrendingUp, TrendingDown, ExternalLink, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { EmailCapture } from "@/components/email-capture";
import { getFeeChanges, formatFeeValue } from "@/lib/fees.functions";

const feeChangesQuery = queryOptions({
  queryKey: ["fee-changes"],
  queryFn: () => getFeeChanges(),
});

export const Route = createFileRoute("/fees")({
  head: () => ({
    meta: [
      { title: "Seller Fee Change Feed — Amazon, Walmart, Shopify rate changes" },
      { name: "description", content: "Every published marketplace fee change in one feed. Old vs new rate, effective date, source link, and estimated seller impact." },
      { property: "og:title", content: "Seller Fee Change Feed" },
      { property: "og:description", content: "Subscribe to marketplace fee change alerts across Amazon, Walmart, and Shopify." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(feeChangesQuery),
  errorComponent: ({ error }) => (
    <p className="mx-auto max-w-2xl p-12 text-center text-sm text-destructive" role="alert">
      Couldn't load the change feed: {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-12 text-center">Not found.</p>,
  component: FeesPage,
});

function FeesPage() {
  const { data: changes } = useSuspenseQuery(feeChangesQuery);

  const marketplaces = useMemo(
    () => Array.from(new Set(changes.map((c) => c.marketplace))).sort(),
    [changes],
  );
  const feeTypes = useMemo(
    () => Array.from(new Set(changes.map((c) => c.fee_type))).sort(),
    [changes],
  );

  const [q, setQ] = useState("");
  const [marketplace, setMarketplace] = useState<string>("all");
  const [feeType, setFeeType] = useState<string>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return changes.filter((c) => {
      if (marketplace !== "all" && c.marketplace !== marketplace) return false;
      if (feeType !== "all" && c.fee_type !== feeType) return false;
      if (!needle) return true;
      return [c.title, c.category, c.fee_type, c.summary ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [changes, q, marketplace, feeType]);

  return (
    <>
      <PageHeader
        eyebrow="Live feed"
        title="Seller Fee Change Feed"
        description="Every marketplace fee change, sourced from public Seller Central, Walmart Seller Help, and Shopify pricing pages. Old rate, new rate, effective date, and source link — all in one place."
        actions={
          <Link
            to="/impact-reports"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <BookOpen className="h-4 w-4" /> Read impact reports
          </Link>
        }
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_200px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search fee changes…" className="pl-9" />
          </div>
          <Select value={marketplace} onValueChange={setMarketplace}>
            <SelectTrigger><SelectValue placeholder="Marketplace" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All marketplaces</SelectItem>
              {marketplaces.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={feeType} onValueChange={setFeeType}>
            <SelectTrigger><SelectValue placeholder="Fee type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fee types</SelectItem>
              {feeTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map((c) => {
            const pct = c.old_value === 0 ? 1 : (c.new_value - c.old_value) / c.old_value;
            const direction: "up" | "down" = c.new_value >= c.old_value ? "up" : "down";
            return (
              <Card key={c.id} className="border-border transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="rounded-full">{c.marketplace}</Badge>
                        <Badge variant="outline" className="rounded-full">{c.fee_type}</Badge>
                        <span className="tabular-nums">
                          {new Date(c.effective_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-foreground">{c.title}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{c.category}</p>
                    </div>
                    <ImpactBadge level={c.impact_level} direction={direction} />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2 text-lg font-semibold tabular-nums">
                    <span className="text-muted-foreground line-through decoration-muted-foreground/40">
                      {c.old_value === 0 ? "—" : formatFeeValue(c.old_value, c.value_type)}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-foreground">{formatFeeValue(c.new_value, c.value_type)}</span>
                  </div>
                  {c.summary && (
                    <p className="mt-3 text-sm text-muted-foreground">{c.summary}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                    <a
                      href={c.source_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {c.source_title} <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="font-medium text-foreground tabular-nums">
                      {direction === "up" ? "+" : ""}{(pct * 100).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-sm text-muted-foreground">No fee changes match your filters.</p>
        )}

        <div className="mt-12">
          <EmailCapture
            topic="fee_changes"
            title="Get fee change alerts in your inbox"
            description="The moment Amazon, Walmart, or Shopify publishes a fee update, you'll get a short email with the old rate, new rate, and impact estimate. No spam — only material changes."
          />
        </div>
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