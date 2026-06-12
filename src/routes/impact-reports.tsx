import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  Microscope, Calendar, FileText, ChevronRight, ArrowRight, Layers,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { EmailCapture } from "@/components/email-capture";
import { getImpactReports, type ImpactReport } from "@/lib/fees.functions";

const impactReportsQuery = queryOptions({
  queryKey: ["impact-reports"],
  queryFn: () => getImpactReports(),
});

export const Route = createFileRoute("/impact-reports")({
  head: () => ({
    meta: [
      { title: "Marketplace Fee Impact Reports — Original Analysis for Sellers" },
      { name: "description", content: "Original research on Amazon, Walmart, and Shopify fee changes. Methodology, affected categories, sample sizes, and per-unit impact estimates." },
      { property: "og:title", content: "Marketplace Fee Impact Reports" },
      { property: "og:description", content: "Original analyses quantifying how marketplace fee changes affect seller margin." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(impactReportsQuery),
  errorComponent: ({ error }) => (
    <p className="mx-auto max-w-2xl p-12 text-center text-sm text-destructive" role="alert">
      Couldn't load impact reports: {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-12 text-center">Not found.</p>,
  component: ImpactReportsPage,
});

function ImpactReportsPage() {
  const { data: reports } = useSuspenseQuery(impactReportsQuery);
  const totalSample = useMemo(
    () => reports.reduce((s, r) => s + (r.sample_size ?? 0), 0),
    [reports],
  );

  return (
    <>
      <PageHeader
        eyebrow="Original research"
        title="Marketplace Fee Impact Reports"
        description="Independent analyses quantifying how each fee change actually affects seller margin — with methodology, sample size, and affected categories disclosed up front."
      />
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={FileText} label="Reports published" value={reports.length.toString()} />
          <StatCard icon={Layers} label="Fee combinations analyzed" value={totalSample.toString()} />
          <StatCard icon={Calendar} label="Latest report" value={reports[0]?.publish_date ?? "—"} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <ReportCard key={r.id} r={r} />
          ))}
        </div>

        {reports.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No reports published yet.</p>
        )}

        <div className="rounded-2xl border border-border bg-secondary/40 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Methodology, briefly
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Every report draws on the same underlying <Link to="/rate-card" className="text-primary hover:underline">fee database</Link> and <Link to="/fees" className="text-primary hover:underline">change feed</Link>. We document the sample, the assumptions, and the source URLs — so every number can be traced back to a public marketplace policy page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to="/rate-card">View the fee database <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild>
                <Link to="/fees">See change feed <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>

        <EmailCapture
          topic="policy_updates"
          title="Get new impact reports the day they publish"
          description="One short email per report, with the headline finding, sample size, and link to the full methodology. No filler."
        />
      </section>
    </>
  );
}

function StatCard({
  icon: Icon, label, value,
}: { icon: typeof FileText; label: string; value: string }) {
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

function ReportCard({ r }: { r: ImpactReport }) {
  return (
    <Card className="flex h-full flex-col border-border transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-3 p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="rounded-full">{r.marketplace}</Badge>
          <span className="tabular-nums">{r.publish_date}</span>
        </div>
        <h3 className="text-base font-semibold leading-snug text-foreground">{r.title}</h3>
        <p className="text-sm text-muted-foreground">{r.summary}</p>
        <div className="space-y-2 border-t border-border pt-3 text-xs">
          <Row label="Estimated impact" value={r.estimated_seller_impact} />
          {r.sample_size != null && <Row label="Sample size" value={`${r.sample_size} fee combinations`} />}
          {r.affected_categories.length > 0 && (
            <div>
              <div className="text-muted-foreground">Affected categories</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {r.affected_categories.map((c) => (
                  <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-foreground">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-auto pt-3">
          <ReportDialog r={r} />
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function ReportDialog({ r }: { r: ImpactReport }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between px-2 text-sm">
          Read full report
          <ChevronRight className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Microscope className="h-3.5 w-3.5 text-primary" />
            <Badge variant="secondary" className="rounded-full">{r.marketplace}</Badge>
            <span className="tabular-nums">{r.publish_date}</span>
          </div>
          <DialogTitle className="text-lg leading-snug">{r.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 rounded-md border border-border bg-muted/40 p-4 text-xs">
          <Row label="Estimated impact" value={r.estimated_seller_impact} />
          {r.sample_size != null && <Row label="Sample size" value={`${r.sample_size} fee combinations`} />}
          <div>
            <div className="text-muted-foreground">Methodology</div>
            <p className="mt-1 text-foreground">{r.methodology}</p>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <Markdown source={r.body_markdown} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Tiny safe markdown renderer for headings/lists/paragraphs/code/bold. */
function Markdown({ source }: { source: string }) {
  const blocks = useMemo(() => parseMarkdown(source), [source]);
  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground">
      {blocks.map((b, i) => {
        if (b.type === "h2") return <h3 key={i} className="mt-4 text-base font-semibold tracking-tight">{b.text}</h3>;
        if (b.type === "h3") return <h4 key={i} className="mt-3 text-sm font-semibold">{b.text}</h4>;
        if (b.type === "ul") return (
          <ul key={i} className="ml-5 list-disc space-y-1 text-foreground">
            {b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}
          </ul>
        );
        if (b.type === "ol") return (
          <ol key={i} className="ml-5 list-decimal space-y-1 text-foreground">
            {b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}
          </ol>
        );
        return <p key={i} className="text-muted-foreground"><Inline text={b.text} /></p>;
      })}
    </div>
  );
}

function Inline({ text }: { text: string }) {
  // Render **bold** segments without dangerouslySetInnerHTML.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function parseMarkdown(source: string): Block[] {
  const lines = source.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith("## ")) { blocks.push({ type: "h2", text: line.slice(3).trim() }); i++; continue; }
    if (line.startsWith("### ")) { blocks.push({ type: "h3", text: line.slice(4).trim() }); i++; continue; }
    if (/^\s*-\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*-\s+/, "").trim());
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, "").trim());
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    // paragraph: collect until blank
    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith("#") && !/^\s*[-\d]/.test(lines[i])) {
      paragraph.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "p", text: paragraph.join(" ") });
  }
  return blocks;
}