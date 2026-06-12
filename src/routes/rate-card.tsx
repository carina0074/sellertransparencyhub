import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Database, Search, ArrowUp, ArrowDown, Minus } from "lucide-react";
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FEE_DATABASE, FEE_TYPES_LIST, MARKETPLACES_LIST,
  deltaSummary, formatFeeValue, type FeeRecord,
} from "@/lib/fee-database";

export const Route = createFileRoute("/rate-card")({
  head: () => ({
    meta: [
      { title: "Marketplace Fee Database — Amazon, Walmart, Shopify rates with history" },
      { name: "description", content: "Searchable database of marketplace seller fees with effective dates, source links, and full change history. Covers Amazon, Walmart, and Shopify." },
      { property: "og:title", content: "Marketplace Fee Database" },
      { property: "og:description", content: "Every fee, every change, every source — in one auditable table." },
    ],
  }),
  component: RateCardPage,
});

function RateCardPage() {
  const [q, setQ] = useState("");
  const [mkt, setMkt] = useState<string>("all");
  const [ft, setFt] = useState<string>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return FEE_DATABASE.filter((r) => {
      if (mkt !== "all" && r.marketplace !== mkt) return false;
      if (ft !== "all" && r.feeType !== ft) return false;
      if (!needle) return true;
      return [r.marketplace, r.category, r.feeType, r.notes ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [q, mkt, ft]);

  return (
    <>
      <PageHeader
        eyebrow="Data asset"
        title="Marketplace Fee Database"
        description="Every published seller fee — with marketplace, category, fee type, effective date, source URL, and full change history. Hand-curated, auditable, and free to use."
      />
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
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
              {MARKETPLACES_LIST.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ft} onValueChange={setFt}>
            <SelectTrigger><SelectValue placeholder="Fee type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fee types</SelectItem>
              {FEE_TYPES_LIST.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Marketplace</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Fee type</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead>Effective</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead className="text-right">Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const d = deltaSummary(r);
                    const effective = r.history[0]?.effective ?? "—";
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-full">{r.marketplace}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{r.category}</TableCell>
                        <TableCell className="text-muted-foreground">{r.feeType}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatFeeValue(r.current, r.unit)}
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">{effective}</TableCell>
                        <TableCell>
                          {d ? <DeltaBadge dir={d.direction} pct={d.pct} /> : <span className="text-xs text-muted-foreground">No prior</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <HistoryDialog record={r} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
            <Database className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              The database lives in <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">src/lib/fee-database.ts</code>.
              Every record carries marketplace, category, fee type, current value, source URL, and a newest-first version history.
              When a marketplace publishes a new fee, we append to <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">history</code> — prior entries are never mutated. This is the underlying data asset behind both our calculator and the fee change feed.
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function DeltaBadge({ dir, pct }: { dir: "up" | "down" | "flat"; pct: number }) {
  const map = {
    up: { cls: "bg-destructive/10 text-destructive", Icon: ArrowUp },
    down: { cls: "bg-success/10 text-success", Icon: ArrowDown },
    flat: { cls: "bg-muted text-muted-foreground", Icon: Minus },
  } as const;
  const { cls, Icon } = map[dir];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      <Icon className="h-3 w-3" /> {dir === "flat" ? "no change" : `${(pct * 100).toFixed(1)}%`}
    </span>
  );
}

function HistoryDialog({ record }: { record: FeeRecord }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs">
          View history
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">
            {record.marketplace} · {record.category}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{record.feeType}</span>
            <a
              href={record.sourceUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              {record.sourceTitle} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          {record.notes && (
            <p className="rounded-md border border-border bg-muted/40 p-3 text-muted-foreground">{record.notes}</p>
          )}
          <ol className="space-y-2 border-l border-border pl-4">
            {record.history.map((h, i) => (
              <li key={`${h.effective}-${i}`} className="relative">
                <span className="absolute -left-[21px] top-1.5 grid h-3 w-3 place-items-center rounded-full bg-primary" />
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-foreground tabular-nums">{h.effective}</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatFeeValue(h.value, record.unit)}
                  </span>
                </div>
                {h.note && <p className="mt-0.5 text-xs text-muted-foreground">{h.note}</p>}
              </li>
            ))}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}