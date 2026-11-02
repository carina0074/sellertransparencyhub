import { shareImageMeta } from "@/lib/share-metadata";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink, Database, Search, ShieldCheck, History, Store, Tags, Check } from "lucide-react";
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
import { getFeeRecords, getDatabaseStats, type FeeRecord } from "@/lib/fees.functions";
import { effectiveDateLabel, presentFee, verificationLabel, tierAmount } from "@/lib/fee-formatting";
import { formatVerificationDate } from "@/lib/coverage-statistics";
import { archiveLinksQuery } from "@/lib/archive-links";
import { ArchiveCopyLink } from "@/components/archive-copy-link";
import { trackEvent } from "@/lib/analytics";
import { QuickFeedback } from "@/components/quick-feedback";
import { isValueMomentClick, recordFromClick, type ValueRecord } from "@/lib/quick-feedback";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      ...shareImageMeta,
      { title: "Marketplace Fee Database — Amazon, Walmart, eBay, Shopify, Etsy rates" },
      { name: "description", content: "Current U.S. seller fees on marketplaces and selling platforms (Amazon, Walmart, eBay, Etsy and Shopify), with pricing tiers, applicability, first-party evidence and current-value review status." },
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
      context.queryClient.ensureQueryData(archiveLinksQuery),
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
  const [valueMoment, setValueMoment] = useState(false);
  const [record, setRecord] = useState<ValueRecord | null>(null);


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
    <div onClickCapture={(e) => { if (isValueMomentClick(e.target)) { setValueMoment(true); setRecord(recordFromClick(e.target)); } }}>
      <PageHeader
        eyebrow="Fee database"
        title="Marketplace Fee Database"
        description="Current U.S. seller fees on marketplaces and selling platforms (Amazon, Walmart, eBay, Etsy and Shopify), with pricing conditions, official sources, current-value review status, and effective dates where independently established."
      />
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={Database} label="Current Fee Records" value={`${stats.activeRecords}`} />
          <a href="/fees" className="hover:underline"><StatCard icon={History} label="Historical Fee-Change Events" value={`${stats.historicalChanges}`} /></a>
          <StatCard icon={Store} label="Marketplaces and Selling Platforms Tracked" value={`${stats.marketplaces}`} />
          <a href="#category-labels" className="hover:underline"><StatCard icon={Tags} label="Category Labels" value={`${stats.categories}`} /></a>
        </div>
        <details id="category-labels" className="text-sm text-muted-foreground">
          <summary className="cursor-pointer font-medium text-primary">{stats.categories} category labels</summary>
          <ul className="mt-3 grid list-inside list-disc gap-2 sm:grid-cols-2 lg:grid-cols-3">{Array.from(new Set(records.map(r => r.category))).sort().map(category => <li key={category}>{category}</li>)}</ul>
        </details>
        <p className="text-xs text-muted-foreground">
          Latest fee verification: {formatVerificationDate(stats.lastUpdated)} · <a href="/methodology" className="text-primary hover:underline">Methodology</a> · <a href="/api/public/fees" className="text-primary hover:underline">Public API</a>
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Amazon FBA fulfillment varies by dimensions, shipping weight, price, product class, season and program eligibility. Former flat-fee records have been retired; consult the <a href="https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW" target="_blank" rel="noreferrer" className="text-primary hover:underline">current official FBA schedule</a> and its fuel/logistics surcharge. Current-value verification does not establish a fee’s original effective date.
        </p>

        <div className="grid gap-3 sm:grid-cols-[1fr_180px_200px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); }}
              placeholder="Search by category, type, marketplace…" className="pl-9" />
          </div>
          <Select value={mkt} onValueChange={(v) => { setMkt(v); setValueMoment(true); trackEvent("marketplace_filter_used", { marketplace: v }); }}>
            <SelectTrigger><SelectValue placeholder="Marketplace" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All marketplaces</SelectItem>
              {marketplaces.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ft} onValueChange={(v) => { setFt(v); setValueMoment(true); }}>
            <SelectTrigger><SelectValue placeholder="Fee type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fee types</SelectItem>
              {feeTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 md:hidden">
          {filtered.map((r) => <MobileFeeCard key={r.id} r={r} />)}
        </div>

        <Card className="hidden border-border md:block">
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
                    <TableRow key={r.id} data-record-id={r.id} data-record-type="fee_record">
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
                        <ReviewStatus status={r.verification_status} lastVerified={r.last_verified} />
                      </TableCell>
                      <TableCell className="text-right">
                        <a
                          href={r.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          onClick={() => { trackEvent("fee_source_clicked", { marketplace: r.marketplace, fee_type: r.fee_type }); }}
                        >
                          <Badge variant="outline" className="rounded-full text-[10px] font-normal">{presentation.details?.legacy_source ? "Legacy reference" : "Official source"}</Badge>
                          {r.source_title} <ExternalLink className="h-3 w-3" />
                        </a>
                        {presentation.details && <div className="mt-2 space-y-2 whitespace-normal text-xs">
                          {presentation.details.references.map((reference) => <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer" className="block text-primary hover:underline">{reference.title} <ExternalLink className="inline h-3 w-3" /></a>)}
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

        <QuickFeedback resourceType="fee_database" resourcePath="/rate-card" active={valueMoment} recordId={record?.id} recordType={record?.type} />

        <Card className="border-border bg-muted/40">
          <CardContent className="flex items-start gap-3 p-6 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Current fee records include source and verification information. Separately documented fee changes are published in the <a href="/fees" className="text-primary hover:underline">Seller Fee Change Feed</a> with their available source and effective-date evidence.
            </p>
          </CardContent>
        </Card>

              </section>

    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Database; label: string; value: string }) {
  return (
    <Card className="border-border">
      <CardContent className="flex items-center gap-3 p-3 sm:p-5">
        <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary sm:grid">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-lg font-semibold tabular-nums text-foreground sm:text-xl">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewStatus({ status, lastVerified }: { status?: string; lastVerified: string | null }) {
  const checked = status === "verified_current_value";
  const label = checked ? "Checked" : verificationLabel(status);
  return (
    <TooltipProvider><Tooltip><TooltipTrigger asChild>
      <span tabIndex={0} className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
        {checked && <Check className="h-3.5 w-3.5 text-primary" aria-hidden />}{label}
        <span className="font-normal text-muted-foreground"> · {formatVerificationDate(lastVerified)}</span>
      </span>
    </TooltipTrigger><TooltipContent className="max-w-72">{checked ? "Current value checked against source. " : status === "verification_pending" ? "Date shown is the previous review. " : ""}Checking the current value against its source does not establish when the fee took effect.</TooltipContent></Tooltip></TooltipProvider>
  );
}

function MobileFeeCard({ r }: { r: FeeRecord }) {
  const presentation = presentFee(r);
  const d = presentation.details;
  return (
    <Card className="border-border" data-record-id={r.id} data-record-type="fee_record">
      <CardContent className="space-y-2 p-4 text-sm">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="secondary" className="rounded-full">{r.marketplace}</Badge>
          <span className="text-right font-semibold tabular-nums text-foreground">{presentation.value}</span>
        </div>
        <div>
          <div className="font-medium text-foreground">{r.fee_name}</div>
          <div className="text-xs text-muted-foreground">{r.category}</div>
        </div>
        {(r.notes || d) && <details className="text-xs leading-relaxed text-muted-foreground">
          <summary className="cursor-pointer font-medium text-primary">Fee details &amp; conditions</summary>
          <div className="mt-2 space-y-2">
            {r.notes && <p>{r.notes}</p>}
            {d?.scope && <p><strong>Scope:</strong> {d.scope}</p>}
            {d?.basis && <p><strong>Basis:</strong> {d.basis}</p>}
            {d?.kind === "tiered" && <ul className="space-y-1">{d.tiers.map((t) => <li key={t.label}><strong>{t.label}:</strong> {tierAmount(t, d.unit)}{t.effective_date && ` (effective ${t.effective_date})`}</li>)}</ul>}
            {d?.minimum_minor != null && <p>Minimum referral fee: ${(d.minimum_minor / 100).toFixed(2)} USD per item, where applicable.</p>}
            {d?.separate_closing_minor !== undefined && d && <p>Separate closing fee: ${(d.separate_closing_minor / 100).toFixed(2)} USD per item sold (not part of the percentage).</p>}
            {d?.conditions.map((c) => <p key={c}>{c}</p>)}
            <p>Effective: {effectiveDateLabel(r.effective_date)}</p>
          </div>
        </details>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a href={r.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            onClick={() => { trackEvent("fee_source_clicked", { marketplace: r.marketplace, fee_type: r.fee_type }); }}>
            {d?.legacy_source ? "Legacy reference" : "Official source"}: {r.source_title} <ExternalLink className="h-3 w-3" />
          </a>
          <ArchiveCopyLink url={r.source_url} />
        </div>
        <div><ReviewStatus status={r.verification_status} lastVerified={r.last_verified} /></div>
      </CardContent>
    </Card>
  );
}
