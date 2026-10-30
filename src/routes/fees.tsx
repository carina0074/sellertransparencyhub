import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Search, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeedbackPrompt } from "@/components/feedback-prompt";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getFeeChanges, formatFeeValue } from "@/lib/fees.functions";
import { historicalChangeLabel, historicalEffectiveDate, historicalEvidenceSchema } from "@/lib/historical-fee-formatting";

const feeChangesQuery = queryOptions({
  queryKey: ["fee-changes"],
  queryFn: () => getFeeChanges(),
});

export const Route = createFileRoute("/fees")({
  head: () => ({
    meta: [
      { title: "Seller Fee Change Feed — Recorded Marketplace Fee Changes" },
      { name: "description", content: "A manually maintained collection of documented historical marketplace fee changes with first-party evidence, applicability and effective-date precision." },
      { property: "og:title", content: "Seller Fee Change Feed" },
      { property: "og:description", content: "Documented historical marketplace fee changes with first-party evidence and clearly stated effective-date precision; not exhaustive marketplace coverage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(feeChangesQuery),
  errorComponent: ({ error }: { error: any; reset: () => void }) => (
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
        eyebrow="HISTORICAL DATASET"
        title="Seller Fee Change Feed"
        description="A manually maintained, evidence-backed collection of documented marketplace fee-change events, not an exhaustive history of every marketplace change."
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
            const parsedEvidence = historicalEvidenceSchema.safeParse(c.evidence_details);
            const evidence = parsedEvidence.success ? parsedEvidence.data : null;
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
                          {historicalEffectiveDate(c)}
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
                  {evidence && <details className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    <summary className="cursor-pointer font-medium text-primary">Historical evidence &amp; applicability</summary>
                    <div className="mt-2 space-y-2">
                      <p><strong>Scope:</strong> {evidence.scope}</p>
                      {evidence.conditions.map((condition) => <p key={condition}>{condition}</p>)}
                      {evidence.references.map((reference) => <div key={reference.url}>
                        <a href={reference.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{reference.title} <ExternalLink className="inline h-3 w-3" /></a>
                        <blockquote className="mt-1 border-l-2 border-border pl-2">{reference.quote}</blockquote>
                      </div>)}
                      <p>Evidence reviewed {evidence.reviewed_on}; review date is not an effective date.</p>
                      <p>{c.record_id ? "Linked to the same current fee concept." : "No current-record link."} {evidence.linkage_reason}</p>
                    </div>
                  </details>}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs">
                    <a
                      href={c.source_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {c.source_title} <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="font-medium text-foreground tabular-nums">
                      {historicalChangeLabel(c.old_value, c.new_value)}
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

        <div className="mt-10">
          <FeedbackPrompt variant="survey" resourceType="fee_change_feed" resourcePath="/fees" />
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