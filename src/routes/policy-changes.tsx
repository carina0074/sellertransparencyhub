import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ExternalLink, ShieldAlert, Calendar, Layers, Building2, Filter } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPolicyChanges, type PolicyChange } from "@/lib/fees.functions";

const policyChangesQuery = queryOptions({
  queryKey: ["policy-changes"],
  queryFn: () => getPolicyChanges(),
});

export const Route = createFileRoute("/policy-changes")({
  head: () => ({
      meta: [
        { title: "Marketplace Policy Archive — Suspension, Listing & Returns Rules" },
      { name: "description", content: "Public archive of marketplace policy changes across Amazon, Walmart, and Shopify. Effective dates, affected sellers, impact level, and source links." },
      { property: "og:title", content: "Marketplace Policy Archive" },
      { property: "og:description", content: "Continuously updated record of marketplace policy updates — every entry sourced and dated." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(policyChangesQuery),
  errorComponent: ({ error }) => (
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

  const highImpact = changes.filter((c) => c.impact_level === "high").length;

  return (
    <>
      <PageHeader
        eyebrow="Public dataset"
        title="Marketplace Policy Archive"
        description="A continuously maintained record of marketplace policy updates — suspension rules, listing requirements, returns, verification, and performance thresholds. Every entry links to the original source."
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
          <StatCard icon={Layers} label="Policy updates tracked" value={changes.length.toString()} />
          <StatCard icon={ShieldAlert} label="High-impact changes" value={highImpact.toString()} />
          <StatCard icon={Building2} label="Marketplaces covered" value={(marketplaces.length - 1).toString()} />
          <StatCard icon={Calendar} label="Most recent" value={changes[0]?.effective_date ?? "—"} />
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
            This archive sits alongside three other continuously maintained datasets — the{" "}
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

function impactTone(level: PolicyChange["impact_level"]) {
  if (level === "high") return "bg-destructive/10 text-destructive border-destructive/30";
  if (level === "medium") return "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400";
  return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400";
}

function PolicyCard({ c }: { c: PolicyChange }) {
  return (
    <Card className="border-border">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary" className="rounded-full">{c.marketplace}</Badge>
          <Badge variant="outline" className="rounded-full">{c.policy_area}</Badge>
          <span className={`rounded-full border px-2 py-0.5 font-medium ${impactTone(c.impact_level)}`}>
            {c.impact_level} impact
          </span>
          <span className="ml-auto tabular-nums text-muted-foreground">
            Effective {c.effective_date}
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
          <Detail label="Last verified" value={c.last_verified} />
        </dl>
        <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
          <span className="text-muted-foreground">
            <span className="mr-1 rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              Official
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