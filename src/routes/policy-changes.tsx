import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ExternalLink, BookOpen, RefreshCw, Layers, Building2, Filter } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPolicyChanges, type PolicyChange } from "@/lib/fees.functions";
import { policyEffectiveDate, policyEvidenceSchema } from "@/lib/policy-evidence";

const policyChangesQuery = queryOptions({
  queryKey: ["policy-changes"],
  queryFn: () => getPolicyChanges(),
});

export const Route = createFileRoute("/policy-changes")({
  head: () => ({
      meta: [
        { title: "Marketplace Policy Archive — Documented Changes | Seller Transparency Hub" },
      { name: "description", content: "A manually maintained, source-linked collection of documented marketplace policy changes with evidence, applicable scope and qualified historical dates." },
      { property: "og:title", content: "Marketplace Policy Archive" },
      { property: "og:description", content: "Documented marketplace policy changes with first-party evidence, applicable scope and qualified historical dates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(policyChangesQuery),
  errorComponent: ({ error }: { error: any; reset: () => void }) => (
    <p className="mx-auto max-w-2xl p-12 text-center text-sm text-destructive" role="alert">
      Couldn't load policy changes: {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-12 text-center">Not found.</p>,
  component: PolicyChangesPage,
});

const ALL = "All";

function PolicyChangesPage() {
  const { data: changes } = useSuspenseQuery(policyChangesQuery);
  const [marketplace, setMarketplace] = useState<string>(ALL);
  const [area, setArea] = useState<string>(ALL);

  const marketplaces = useMemo(
    () => [ALL, ...Array.from(new Set(changes.map((c) => c.marketplace))).sort()],
    [changes],
  );
  const areas = useMemo(
    () => [ALL, ...Array.from(new Set(changes.map((c) => c.policy_area))).sort()],
    [changes],
  );

  const filtered = useMemo(
    () =>
      changes.filter(
        (c) =>
          (marketplace === ALL || c.marketplace === marketplace) &&
          (area === ALL || c.policy_area === area),
      ),
    [changes, marketplace, area],
  );

  const officialSources = useMemo(
    () => new Set(changes.map((c) => c.source_url)).size,
    [changes],
  );

  return (
    <>
      <PageHeader
        eyebrow="Public dataset"
        title="Marketplace Policy Archive"
        description="A manually maintained, source-linked collection of documented marketplace policy changes. Coverage is not exhaustive; dates and applicability reflect the available evidence."
        actions={
          <Button asChild variant="outline" size="sm">
            <a href="/api/public/policy-changes" target="_blank" rel="noreferrer">
              Public API <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        }
      />
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BookOpen} label="Source links recorded" value={officialSources.toString()} />
          <StatCard icon={Layers} label="Policy records archived" value={changes.length.toString()} />
          <StatCard icon={Building2} label="Marketplaces covered" value={(marketplaces.length - 1).toString()} />
          <StatCard icon={RefreshCw} label="Maintenance" value="Manually maintained" />
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
          <Filter className="ml-1 h-4 w-4 text-muted-foreground" />
          <FilterGroup label="Marketplace" value={marketplace} options={marketplaces} onChange={setMarketplace} />
          <FilterGroup label="Policy area" value={area} options={areas} onChange={setArea} />
        </div>

        <div className="space-y-4">
          {filtered.map((c) => (
            <PolicyCard key={c.id} c={c} />
          ))}
          {filtered.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No policy changes match these filters.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-secondary/40 p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Part of the public dataset suite
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This archive sits alongside three other public resources — the{" "}
            <Link to="/rate-card" className="text-primary hover:underline">Fee Database</Link>, the{" "}
            <Link to="/fees" className="text-primary hover:underline">Fee Change Tracker</Link>, and the{" "}
            <Link to="/suspension-prevention" className="text-primary hover:underline">Seller Suspension Appeal Library</Link>.
          </p>
        </div>
      </section>
    </>
  );
}

function StatCard({
  icon: Icon, label, value,
}: { icon: typeof Layers; label: string; value: string }) {
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

function FilterGroup({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="font-medium uppercase tracking-wide">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function PolicyCard({ c }: { c: PolicyChange }) {
  const parsed = policyEvidenceSchema.safeParse(c.evidence_details);
  const evidence = parsed.success ? parsed.data : null;
  return (
    <Card className="border-border">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary" className="rounded-full">{c.marketplace}</Badge>
          <Badge variant="outline" className="rounded-full">{c.policy_area}</Badge>
          {evidence && <Badge variant="outline">{evidence.status === "verified_policy_event" ? "Evidence reviewed" : "Timing not established"}</Badge>}
          <span className="ml-auto tabular-nums text-muted-foreground">
            {c.effective_date_precision === "unknown" ? policyEffectiveDate(c) : `Effective ${policyEffectiveDate(c)}`}
          </span>
        </div>
        <h2 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
          {c.title}
        </h2>
        <p className="text-sm text-muted-foreground">{c.summary}</p>
        {c.body_markdown && (
          <p className="rounded-md border border-border bg-muted/40 p-3 text-sm text-foreground">
            {c.body_markdown}
          </p>
        )}
        <dl className="grid gap-3 border-t border-border pt-3 text-xs sm:grid-cols-3">
          {c.affected_sellers && (
            <Detail label="Affected sellers" value={c.affected_sellers} />
          )}
          {c.announcement_date && (
            <Detail label="Announced" value={c.announcement_date} />
          )}
          <Detail label="Evidence reviewed" value={evidence?.reviewed_on ?? "Review not established"} />
        </dl>
        {evidence && (
          <div className="space-y-3 border-t border-border pt-3 text-sm">
            <Detail label="Applicable scope" value={evidence.scope} />
            <Detail label="Seller impact" value={evidence.impact} />
            {evidence.conditions.length > 0 && <ul className="list-disc space-y-1 pl-5 text-muted-foreground">{evidence.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>}
            <details className="rounded-md border border-border p-3">
              <summary className="cursor-pointer font-medium text-primary">First-party evidence</summary>
              <p className="mt-3 text-xs text-muted-foreground">Review dates are evidence checks, not historical effective dates.</p>
              {evidence.references.map((reference) => (
                <div key={reference.url} className="mt-3 space-y-2">
                  <a href={reference.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{reference.title}<ExternalLink className="h-3 w-3 shrink-0" /></a>
                  <p className="text-xs text-muted-foreground">{reference.evidence_type} · {reference.heading}</p>
                  <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">{reference.quote}</blockquote>
                  <p className="text-xs text-muted-foreground">Supports: {reference.supported_fields.join(", ")}</p>
                </div>
              ))}
            </details>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs">
          <span className="text-muted-foreground">
            <span className="mr-1 rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              Source
            </span>
            {c.source_title}
          </span>
          <a
            href={c.source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            Source <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}