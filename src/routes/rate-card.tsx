import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { getFeeRecords, formatFeeValue } from "@/lib/fees.functions";

const feeRecordsQuery = queryOptions({
  queryKey: ["fee-records"],
  queryFn: () => getFeeRecords(),
});

export const Route = createFileRoute("/rate-card")({
  head: () => ({
    meta: [
      { title: "Marketplace Fee Database — Amazon, Walmart, Shopify rates" },
      { name: "description", content: "A continuously updated public database of Amazon, Walmart, and Shopify seller fees. Every record carries a source URL and last-verified date." },
      { property: "og:title", content: "Marketplace Fee Database" },
      { property: "og:description", content: "Sourced, dated, and auditable marketplace fee data for e-commerce sellers." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(feeRecordsQuery),
  errorComponent: ({ error }) => (
    <p className="mx-auto max-w-2xl p-12 text-center text-sm text-destructive" role="alert">
      Couldn't load the fee database: {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-12 text-center">Not found.</p>,
  component: RateCardPage,
});

function RateCardPage() {
  const { data: records } = useSuspenseQuery(feeRecordsQuery);

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
        description="Every published seller fee — marketplace, category, fee type, current value, source URL, effective date, and last-verified date. Continuously maintained as a public transparency resource."
      />
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Records in database" value={records.length.toString()} />
          <StatCard label="Marketplaces tracked" value={marketplaces.length.toString()} />
          <StatCard label="Last verified" value={maxDate(records.map((r) => r.last_verified))} />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_180px_200px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search by category, type, marketplace…" className="pl-9" />
          </div>
          <Select value={mkt} onValueChange={setMkt}>
            <SelectTrigger><SelectValue placeholder="Marketplace" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All marketplaces</SelectItem>
              {marketplaces.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ft} onValueChange={setFt}>
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
                    <TableHead>Last verified</TableHead>
                    <TableHead className="text-right">Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full">{r.marketplace}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.fee_name}</TableCell>
                      <TableCell className="font-medium text-foreground">{r.category}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatFeeValue(r.value, r.value_type)}
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{r.effective_date}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{r.last_verified}</TableCell>
                      <TableCell className="text-right">
                        <a
                          href={r.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          Source <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
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
              Every record is sourced from a public marketplace help page. We re-verify rates on a rolling cadence and write a new <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">last_verified</code> date when we do. When a marketplace publishes a new fee, the historical version is preserved in the <a href="/fees" className="text-primary hover:underline">Seller Fee Change Feed</a> so the change is auditable.
            </p>
          </CardContent>
        </Card>
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

function maxDate(dates: string[]): string {
  if (dates.length === 0) return "—";
  return dates.reduce((a, b) => (a > b ? a : b));
}