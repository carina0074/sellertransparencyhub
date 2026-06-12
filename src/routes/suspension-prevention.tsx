import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ShieldAlert, Search, CheckCircle2, AlertTriangle, Clock, FileText,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { EmailCapture } from "@/components/email-capture";
import {
  APPEALS_LIBRARY, APPEAL_CATEGORIES, appealStats,
  type AppealCase, type AppealCategory, type AppealOutcome,
} from "@/lib/appeals-library";

export const Route = createFileRoute("/suspension-prevention")({
  head: () => ({
    meta: [
      { title: "Amazon Suspension Appeal Library — 50+ real cases & playbooks" },
      { name: "description", content: "A searchable library of real seller suspension cases across IP complaints, inauthentic claims, review manipulation, related accounts, late shipments, and verification." },
      { property: "og:title", content: "Suspension Appeal Library" },
      { property: "og:description", content: "50+ anonymized seller appeals with root cause, corrective actions, and outcomes." },
    ],
  }),
  component: SuspensionPage,
});

function SuspensionPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [outcome, setOutcome] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stats = useMemo(() => appealStats(), []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return APPEALS_LIBRARY.filter((c) => {
      if (cat !== "all" && c.category !== cat) return false;
      if (outcome !== "all" && c.outcome !== outcome) return false;
      if (!needle) return true;
      return [c.title, c.summary, c.rootCause, c.marketplace, ...c.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [q, cat, outcome]);

  const selected = useMemo(
    () => APPEALS_LIBRARY.find((c) => c.id === selectedId) ?? filtered[0] ?? null,
    [selectedId, filtered]
  );

  return (
    <>
      <PageHeader
        eyebrow="Knowledge base"
        title="Suspension Appeal Library"
        description="50+ anonymized real seller suspension cases — root cause, corrective actions, documents submitted, and outcome. Search by category, marketplace, or tag to find a case that mirrors yours."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Cases in library" value={stats.total.toString()} icon={FileText} />
          <StatCard label="Reinstated outcomes" value={`${Math.round(stats.reinstateRate * 100)}%`} icon={CheckCircle2} />
          <StatCard label="Average days to resolve" value={`${stats.avgDays} days`} icon={Clock} />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_200px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cases by tag, title, root cause…"
              className="pl-9"
            />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {APPEAL_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={outcome} onValueChange={setOutcome}>
            <SelectTrigger><SelectValue placeholder="Outcome" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All outcomes</SelectItem>
              <SelectItem value="reinstated">Reinstated</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-2 lg:max-h-[680px] lg:overflow-y-auto lg:pr-2">
            {filtered.length === 0 ? (
              <p className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                No cases match your filters.
              </p>
            ) : (
              filtered.map((c) => {
                const isActive = selected?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`block w-full rounded-md border px-4 py-3 text-left transition-colors ${
                      isActive
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="rounded-full">{c.marketplace}</Badge>
                      <span>{c.category}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-foreground line-clamp-2">{c.title}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <OutcomeBadge outcome={c.outcome} />
                      <span className="text-muted-foreground">{c.timeToResolveDays}d to resolve</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div>{selected ? <CaseDetail c={selected} /> : null}</div>
        </div>

        <div className="mt-12">
          <EmailCapture
            topic="suspension_alerts"
            title="Get suspension & policy alerts"
            description="We email when a new enforcement pattern shows up on Amazon, Walmart, or Shopify — so you can update SOPs before it hits your account."
          />
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof FileText }) {
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

function OutcomeBadge({ outcome }: { outcome: AppealOutcome }) {
  const map: Record<AppealOutcome, { cls: string; label: string }> = {
    reinstated: { cls: "bg-success/10 text-success", label: "Reinstated" },
    partial: { cls: "bg-warning/15 text-warning-foreground", label: "Partial" },
    denied: { cls: "bg-destructive/10 text-destructive", label: "Denied" },
    pending: { cls: "bg-muted text-muted-foreground", label: "Pending" },
  };
  const { cls, label } = map[outcome];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

function CaseDetail({ c }: { c: AppealCase }) {
  return (
    <Card className="border-border">
      <CardContent className="space-y-6 p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="rounded-full">{c.marketplace}</Badge>
            <Badge variant="outline" className="rounded-full">{c.category}</Badge>
            <OutcomeBadge outcome={c.outcome} />
            <span>· {c.timeToResolveDays} days to resolve</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">{c.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{c.summary}</p>
        </div>

        <Section icon={AlertTriangle} title="Root cause">
          <p className="text-sm text-foreground">{c.rootCause}</p>
        </Section>

        <div className="grid gap-6 md:grid-cols-2">
          <Section icon={ShieldAlert} title="Corrective actions">
            <BulletList items={c.correctiveActions} />
          </Section>
          <Section icon={CheckCircle2} title="Preventive actions">
            <BulletList items={c.preventiveActions} />
          </Section>
        </div>

        <Section icon={FileText} title="Documents submitted">
          <div className="flex flex-wrap gap-2">
            {c.documents.map((d) => (
              <span key={d} className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs text-foreground">
                {d}
              </span>
            ))}
          </div>
        </Section>

        {c.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-4 text-xs">
            {c.tags.map((t) => (
              <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">#{t}</span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof FileText; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          {i}
        </li>
      ))}
    </ul>
  );
}

// avoid unused-import warning for AppealCategory in case future use
export type _Cat = AppealCategory;