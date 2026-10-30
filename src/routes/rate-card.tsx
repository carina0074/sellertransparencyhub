import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink, Database, Search, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getFeeRecords, getDatabaseStats } from "@/lib/fees.functions";
import { effectiveDateLabel, presentFee, verificationLabel, tierAmount } from "@/lib/fee-formatting";
import { formatVerificationDate } from "@/lib/coverage-statistics";
import { FeedbackPrompt } from "@/components/feedback-prompt";
import { trackEvent } from "@/lib/analytics";

const feeRecordsQuery = queryOptions({
  queryKey: ["fee-records"],
  queryFn: () => getFeeRecords(),
});

const statsQuery = queryOptions({
  queryKey: ["fee-stats"],
  queryFn: () => getDatabaseStats(),
});

export const Route = createFileRoute("/rate-card")({
  head: () => ({
    meta: [
      { title: "Marketplace Fee Database — Amazon, Walmart, eBay, Shopify, Etsy rates" },
      { name: "description", content: "Current U.S. seller fees for Amazon, Walmart, eBay, Shopify, and Etsy, with pricing tiers, applicability, first-party evidence and current-value review status." },
      { property: "og:title", content: "Marketplace Fee Database" },
      { property: "og:description", content: "Current U.S. marketplace fees with pricing conditions, official evidence and separate current-value and effective-date information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(feeRecordsQuery),
      context.queryClient.ensureQueryData(statsQuery),
    ]),
  errorComponent: ({ error }: { error: any; reset: () => void }) => (
    <p className="mx-auto max-w-2xl p-12 text-center text-sm text-destructive" role="alert">
      Couldn't load the fee database: {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-12 text-center">Not found.</p>,
  component: RateCardPage,
});

function RateCardPage() {
  const { data: records } = useSuspenseQuery(feeRecordsQuery);
  const { data: stats } = useSuspenseQuery(statsQuery);

  useEffect(() => {
    trackEvent("fee_database_view");
  }, []);

  const marketplaces = useMemo(
    () => Array.from(new Set(records.map((r) => r.marketplace))).sort(),
    [records],
  );
  const feeTypes = useMemo(
    () => Array.from(new Set(records.map((r) => r.fee_type))).sort(),
    [records],
  );

  const [q, setQ] = useState("");
  const [mkt, setMkt] = useState<string>("all");
  const [ft, setFt] = useState<string>("all");

  // Contextual feedback prompt: appears inline ~8s after the first meaningful
  // interaction (search, filter change, or source-link click), never on load,
  // and at most once per browser session (including after dismiss/submit).
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showContextualFeedback, setShowContextualFeedback] = useState(false);
  const markInteraction = () => setHasInteracted(true);

  useEffect(() => {
    if (!hasInteracted) return;
    const timer = window.setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      try {
        if (window.sessionStorage.getItem("sthub.contextualFeedbackShown")) return;
        window.sessionStorage.setItem("sthub.contextualFeedbackShown", "1");
      } catch {
        // sessionStorage unavailable — fall through and show once per page view
      }
      setShowContextualFeedback(true);
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [hasInteracted]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return records.filter((r) => {
      if (mkt !== "all" && r.marketplace !== mkt) return false;
      if (ft !== "all" && r.fee_type !== ft) return false;
      if (!needle) return true;
      return [r.marketplace, r.fee_name, r.category, r.fee_type, r.notes ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [records, q, mkt, ft]);

  return (
    <>
      <PageHeader
        eyebrow="Public data asset"
        title="Marketplace Fee Database"
        description="Current U.S. seller fees for Amazon, Walmart, eBay, Shopify, and Etsy — with pricing conditions, official sources, current-value review status, and effective dates where independently established."
      />
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Current Fee Records" value={`${stats.activeRecords}`} />
          <StatCard label="Historical Fee-Change Events" value={`${stats.historicalChanges}`} />
          <StatCard label="Marketplaces Tracked" value={`${stats.marketplaces}`} />
          <StatCard label="Category Labels" value={`${stats.categories}`} />
        </div>
        <p className="text-xs text-muted-foreground">
          Latest fee verification: {formatVerificationDate(stats.lastUpdated)} · <a href="/methodology" className="text-primary hover:underline">Methodology</a> · <a href="/api/public/fees" className="text-primary hover:underline">Public API</a>
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Amazon FBA fulfillment varies by dimensions, shipping weight, price, product class, season and program eligibility. Former flat-fee records have been retired; consult the <a href="https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW" target="_blank" rel="noreferrer" className="text-primary hover:underline">current official FBA schedule</a> and its fuel/logistics surcharge. Current-value verification does not establish a fee’s original effective date.
        </p>

        <div className="grid gap-3 sm:grid-cols-[1fr_180px_200px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); markInteraction(); }}
              placeholder="Search by category, type, marketplace…" className="pl-9" />
          </div>
          <Select value={mkt} onValueChange={(v) => { setMkt(v); markInteraction(); trackEvent("marketplace_filter_used", { marketplace: v }); }}>
            <SelectTrigger><SelectValue placeholder="Marketplace" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All marketplaces</SelectItem>
              {marketplaces.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ft} onValueChange={(v) => { setFt(v); markInteraction(); }}>
            <SelectTrigger><SelectValue placeholder="Fee type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fee types</SelectItem>
              {feeTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Card className="border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">Marketplace</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Effective</TableHead>
                    <TableHead>Current-value review</TableHead>
                    <TableHead className="text-right">Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const presentation = presentFee(r);
                    return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full">{r.marketplace}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.fee_name}
                        {r.notes && <p className="mt-1 min-w-48 max-w-80 whitespace-normal text-xs leading-relaxed text-muted-foreground/80">{r.notes}</p>}
                        {presentation.details && <details className="mt-2 min-w-48 max-w-80 whitespace-normal text-xs leading-relaxed">
                          <summary className="cursor-pointer font-medium text-primary">Fee details &amp; conditions</summary>
                          <div className="mt-2 space-y-2">
                            {presentation.details.scope && <p><strong>Scope:</strong> {presentation.details.scope}</p>}
                            {presentation.details.basis && <p><strong>Basis:</strong> {presentation.details.basis}</p>}
                            {presentation.details.kind === "tiered" && <ul className="space-y-1">
                              {presentation.details.tiers.map((t) => <li key={t.label}><strong>{t.label}:</strong> {tierAmount(t, presentation.details?.kind === "tiered" ? presentation.details.unit : "")}{t.effective_date && ` (effective ${t.effective_date})`}</li>)}
                            </ul>}
                            {presentation.details.minimum_minor != null && <p>Minimum referral fee: ${(presentation.details.minimum_minor / 100).toFixed(2)} USD per item, where applicable.</p>}
                            {presentation.details.separate_closing_minor !== undefined && <p>Separate closing fee: ${(presentation.details.separate_closing_minor / 100).toFixed(2)} USD per item sold (not part of the percentage).</p>}
                            {presentation.details.conditions.map((condition) => <p key={condition}>{condition}</p>)}
                          </div>
                        </details>}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{r.category}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        <span className={presentation.details ? "block min-w-36 max-w-52 whitespace-normal" : undefined}>{presentation.value}</span>
                      </TableCell>
                      <TableCell className="max-w-40 whitespace-normal text-xs text-muted-foreground tabular-nums">{effectiveDateLabel(r.effective_date)}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        <Badge variant="outline" className="max-w-40 whitespace-normal text-xs">{verificationLabel(r.verification_status)}</Badge>
                        <p className="mt-1 text-xs">{r.verification_status === "verification_pending" ? "Previous review: " : "Reviewed: "}{r.last_verified}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <a
                          href={r.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          onClick={() => { markInteraction(); trackEvent("fee_source_clicked", { marketplace: r.marketplace, fee_type: r.fee_type }); }}
                        >
                          <Badge variant="outline" className="rounded-full text-[10px] font-normal">{presentation.details?.legacy_source ? "Legacy reference" : "Official source"}</Badge>
                          {r.source_title} <ExternalLink className="h-3 w-3" />
                        </a>
                        {presentation.details && <div className="mt-2 space-y-2 whitespace-normal text-xs">
                          {presentation.details.references.map((reference) => <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer" className="block text-primary hover:underline">{reference.title} <ExternalLink className="inline h-3 w-3" /></a>)}
                          <p className="text-muted-foreground">Current-value evidence reviewed {presentation.details.reviewed_on}.</p>
                        </div>}
                      </TableCell>
                    </TableRow>
                  );})}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No fees match your filters.</p>
        )}

        <Card className="border-border bg-muted/40">
          <CardContent className="flex items-start gap-3 p-6 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Current fee records include source and verification information. Separately documented fee changes are published in the <a href="/fees" className="text-primary hover:underline">Seller Fee Change Feed</a> with their available source and effective-date evidence.
            </p>
          </CardContent>
        </Card>

        <FeedbackPrompt id="feedback" variant="survey" resourceType="fee_database" resourcePath="/rate-card" />
      </section>

    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border">
      <CardContent className="flex items-center gap-3 p-5">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
          <Database className="h-5 w-5" />
        </span>
        <div>
          <div className="text-xl font-semibold tabular-nums text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
