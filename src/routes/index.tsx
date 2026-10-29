import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, Database, TrendingUp, BookOpen,
  CheckCircle2, Sparkles, Lock, FileText, BarChart3, Mail, History,
} from "lucide-react";
import { useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getDatabaseStats, getFeeRecords } from "@/lib/fees.functions";
import { formatVerificationDate } from "@/lib/coverage-statistics";
import { presentFee } from "@/lib/fee-formatting";
import type { FeeRecord } from "@/lib/fees.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statsQuery = queryOptions({ queryKey: ["fee-stats"], queryFn: () => getDatabaseStats() });
const feeRecordsQuery = queryOptions({ queryKey: ["fee-records"], queryFn: () => getFeeRecords() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Independent Marketplace Transparency Research for U.S. Small Businesses" },
      { name: "description", content: "Independent research and public datasets for U.S. small business marketplace sellers: fee database, fee change feed, calculator, and policy archive." },
      { property: "og:title", content: "Independent Marketplace Transparency Research for U.S. Small Businesses" },
      { property: "og:description", content: "Independent research and public datasets for U.S. small business marketplace sellers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(statsQuery),
      context.queryClient.ensureQueryData(feeRecordsQuery),
    ]),
  component: Index,
});

const trust = [
  "Official marketplace sources",
  "Free public resource",
  "Independently maintained",
];

const marketplaces = ["Amazon", "eBay", "Walmart", "Etsy", "Shopify"];

// Representative picks resolved against the live current fee records (no fee values here).
const previewPicks: { marketplace: string; feeName: string; category: string; label: string }[] = [
  { marketplace: "Amazon", feeName: "Referral Fee", category: "Home & Kitchen", label: "Home & Kitchen referral fee" },
  { marketplace: "eBay", feeName: "Final value fee — Books & Magazines", category: "Books & Magazines", label: "Books & Magazines final value fee" },
  { marketplace: "Walmart", feeName: "Referral Fee", category: "Home, Kitchen, Decor & Garden", label: "Home, Kitchen, Decor & Garden referral fee" },
  { marketplace: "Etsy", feeName: "Transaction Fee", category: "Selling — U.S. fee basis", label: "Transaction fee" },
  { marketplace: "Shopify", feeName: "Online Card Rate", category: "Basic plan — U.S. standard online cards", label: "Basic plan online card rate" },
];

function FeePreview({ records }: { records: FeeRecord[] }) {
  const rows = previewPicks
    .map((p) => {
      const record = records.find(
        (r) =>
          r.marketplace === p.marketplace &&
          r.fee_name === p.feeName &&
          r.category === p.category &&
          r.verification_status === "verified_current_value",
      );
      return record ? { record, label: p.label } : null;
    })
    .filter((r): r is { record: FeeRecord; label: string } => Boolean(r));
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Marketplace Fee Comparison</h2>
          <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Source-linked records
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Representative current fees — examples from the current fee database, not comparable total selling costs.
        </p>
        <ul className="mt-3 divide-y divide-border">
          {rows.map(({ record: r, label }) => (
            <li key={r.id} className="flex items-start justify-between gap-4 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">{r.marketplace}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
              <div className="max-w-[55%] text-right text-sm font-semibold tabular-nums text-foreground">
                {presentFee(r).value}
              </div>
            </li>
          ))}
        </ul>
        <Link
          to="/rate-card"
          className="mt-4 inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-foreground"
        >
          View fee database <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

const datasets = [
  {
    icon: Database,
    title: "Marketplace Fee Database",
    desc: "Searchable rate cards across Amazon, Walmart, eBay, Shopify, and Etsy. Referral, fulfillment, storage, and ad fees — all sourced from official documentation.",
    to: "/rate-card",
    cta: "Browse fee database",
  },
  {
    icon: TrendingUp,
    title: "Fee Change Feed",
    desc: "Recorded marketplace fee-change events with available source and effective-date information.",
    to: "/fees",
    cta: "Track fee changes",
  },
  {
    icon: BookOpen,
    title: "Marketplace Policy Archive",
    desc: "A manually maintained record of marketplace policy updates with source, date, and scope information where available.",
    to: "/policy-changes",
    cta: "Browse policy archive",
  },
];

import { changelog } from "@/data/changelog";

function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("email_subscribers").insert({ email: trimmed });
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        toast.success("You're already subscribed — thanks!");
        setSubmitted(true);
        setEmail("");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      return;
    }
    toast.success("Subscribed! We'll keep you posted.");
    setSubmitted(true);
    setEmail("");
  }

  if (submitted) {
    return (
      <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 rounded-xl border border-green-200 bg-green-50 px-6 py-4 text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium">You're subscribed! Check your inbox for confirmation.</span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
      <Input
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11"
        aria-label="Email address"
      />
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}

function Index() {
  const { data: coverage } = useSuspenseQuery(statsQuery);
  const { data: feeRecords } = useSuspenseQuery(feeRecordsQuery);
  const stats = [
    { value: coverage.activeRecords, label: "Current fee records" },
    { value: coverage.historicalChanges, label: "Historical fee-change events" },
    { value: coverage.marketplaces, label: "Marketplaces tracked" },
    { value: coverage.categories, label: "Category labels" },
  ];
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-primary-soft)_0%,transparent_70%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Independent research for U.S. marketplace sellers
              </span>
              <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Understand what it really costs to sell online.
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
                Independent marketplace fee and policy research helping U.S. small businesses understand selling costs across major e-commerce platforms.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Marketplace coverage">
                {marketplaces.map((m) => (
                  <li
                    key={m}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {m}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/rate-card">
                    Explore fee database <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/calculator">Calculate selling costs</Link>
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {trust.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:justify-self-end lg:w-full lg:max-w-md">
              <FeePreview records={feeRecords} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-2 text-center sm:text-left">
              <div className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="pb-6 text-center text-xs text-muted-foreground">Latest fee verification: {formatVerificationDate(coverage.lastUpdated)}</p>
      </section>

      {/* Datasets */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Public research tools and datasets.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tangible data assets you can search, filter, and reference — not gated reports or vague summaries.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {datasets.map((d) => (
            <Card key={d.title} className="group border-border transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                    <d.icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">{d.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{d.desc}</p>
                <div className="mt-auto pt-2">
                  <Link
                    to={d.to}
                    className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-foreground"
                  >
                    {d.cta} <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Value pillars */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[
            { icon: Lock, title: "Independent by design", desc: "We don't sell leads to marketplaces. Our datasets exist to protect your margin and your account." },
            { icon: FileText, title: "Documented source links", desc: "Fee and policy records include source links and date information where available." },
            { icon: BarChart3, title: "Decision-ready outputs", desc: "Data you can act on immediately. Filter by marketplace, category, date, or impact level." },
          ].map((p) => (
            <div key={p.title}>
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-background text-primary ring-1 ring-border">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-foreground px-8 py-12 text-center text-background sm:px-12">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Stop guessing. Start working with real data.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base opacity-80">
            Search the fee database or browse the latest policy changes — no signup required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link to="/rate-card">Open fee database</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-background hover:bg-background/10 hover:text-background">
              <Link to="/about">Read our mission</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-primary">
            <Mail className="h-3.5 w-3.5" />
            Newsletter
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Join Marketplace Transparency Updates
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Occasional updates when new research, reports, or dataset updates are published. No spam, unsubscribe anytime.
          </p>
          <SubscribeForm />
        </div>
      </section>

      {/* Version history */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
              <History className="h-5 w-5" />
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Version history
            </h2>
          </div>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Selected milestones documenting the development of Seller Transparency Hub. Dates and descriptions are limited to events supported by available project records.
          </p>
          <ol className="mt-10 space-y-8 border-l border-border pl-6">
            {changelog.map((v) => (
              <li key={v.slug} className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                <div className="text-sm font-medium text-muted-foreground">{v.date}</div>
                <div className="mt-1 text-foreground font-medium">{v.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{v.summary}</p>
                <Link
                  to="/changelog/$slug"
                  params={{ slug: v.slug }}
                  className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:text-foreground"
                >
                  Read milestone summary <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

