import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { EmailCapture } from "@/components/email-capture";
import {
  getRecentChanges, formatFeeValue, MARKETPLACES_LIST, FEE_TYPES_LIST,
} from "@/lib/fee-database";

export const Route = createFileRoute("/fees")({
  head: () => ({
    meta: [
      { title: "Seller Fee Change Feed — Amazon, Walmart, Shopify rate changes" },
      { name: "description", content: "Every published marketplace fee change in one feed. Old vs new rate, effective date, source link, and estimated seller impact." },
      { property: "og:title", content: "Seller Fee Change Feed" },
      { property: "og:description", content: "Subscribe to marketplace fee change alerts across Amazon, Walmart, and Shopify." },
    ],
  }),
  component: FeesPage,
});

function impactLevel(deltaPct: number): "low" | "medium" | "high" {
  const abs = Math.abs(deltaPct);
  if (abs >= 0.05) return "high";
  if (abs >= 0.02) return "medium";
  return "low";
}

function FeesPage() {
  const [q, setQ] = useState("");
  const [marketplace, setMarketplace] = useState<string>("all");
  const [feeType, setFeeType] = useState<string>("all");

  const events = useMemo(() => getRecentChanges(), []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return events.filter((c) => {
      if (marketplace !== "all" && c.marketplace !== marketplace) return false;
      if (feeType !== "all" && c.feeType !== feeType) return false;
      if (!needle) return true;
      return [c.marketplace, c.category, c.feeType, c.note ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [events, q, marketplace, feeType]);

  return (
    <>
      <PageHeader
        eyebrow="Live feed"
        title="Seller Fee Change Feed"
        description="Every marketplace fee change, sourced from public Seller Central, Walmart Seller Help, and Shopify pricing pages. Old rate, new rate, effective date, and source link — all in one place."
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
              {MARKETPLACES_LIST.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={feeType} onValueChange={setFeeType}>
            <SelectTrigger><SelectValue placeholder="Fee type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fee types</SelectItem>
              {FEE_TYPES_LIST.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map((c) => {
            const pct = c.oldValue === 0 ? 0 : (c.newValue - c.oldValue) / c.oldValue;
            const direction: "up" | "down" = c.newValue >= c.oldValue ? "up" : "down";
            const level = impactLevel(pct);
            return (
              <Card key={`${c.recordId}-${c.effective}`} className="border-border transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="rounded-full">{c.marketplace}</Badge>
                        <Badge variant="outline" className="rounded-full">{c.feeType}</Badge>
                        <span className="tabular-nums">
                          {new Date(c.effective).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-foreground">{c.category}</h3>
                    </div>
                    <ImpactBadge level={level} direction={direction} />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2 text-lg font-semibold tabular-nums">
                    <span className="text-muted-foreground line-through decoration-muted-foreground/40">
                      {formatFeeValue(c.oldValue, c.unit)}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-foreground">{formatFeeValue(c.newValue, c.unit)}</span>
                  </div>
                  {c.note && (
                    <p className="mt-3 text-sm text-muted-foreground">{c.note}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                    <a
                      href={c.sourceUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {c.sourceTitle} <ExternalLink className="h-3 w-3" />
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