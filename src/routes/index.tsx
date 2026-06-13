import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, Database, TrendingUp, Shield, BookOpen,
  CheckCircle2, Sparkles, Lock, FileText, BarChart3, History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Independent Marketplace Transparency Research for U.S. Small Businesses" },
      { name: "description", content: "Independent research and public datasets for U.S. small business marketplace sellers: fee database, fee change tracker, suspension appeal library, and policy archive." },
      { property: "og:title", content: "Independent Marketplace Transparency Research for U.S. Small Businesses" },
      { property: "og:description", content: "Independent research and public datasets for U.S. small business marketplace sellers." },
    ],
  }),
  component: Index,
});

const trust = [
  "Built by UX experts",
  "Data-driven insights",
  "Seller-first mission",
  "Free public resources",
];

const datasets = [
  {
    icon: Database,
    title: "Marketplace Fee Database",
    desc: "Searchable rate cards across Amazon, Walmart, and Shopify. Referral, fulfillment, storage, and ad fees — all sourced from official documentation.",
    to: "/rate-card",
    cta: "Browse fee database",
  },
  {
    icon: TrendingUp,
    title: "Fee Change Tracker",
    desc: "Historical and upcoming fee changes with impact levels, affected categories, and direct links to official announcements.",
    to: "/fees",
    cta: "Track fee changes",
  },
  {
    icon: Shield,
    title: "Seller Suspension Appeal Database",
    desc: "Appeal templates, policy references, and successful reinstatement strategies for common suspension types.",
    to: "/suspension-prevention",
    cta: "Explore appeals",
  },
  {
    icon: BookOpen,
    title: "Marketplace Policy Archive",
    desc: "Continuously archived policy updates from official sources. Track what changed, when it took effect, and who it impacts.",
    to: "/policy-changes",
    cta: "Browse policy archive",
  },
];

const stats = [
  { value: "200+", label: "Fee records archived" },
  { value: "127", label: "Fee changes tracked" },
  { value: "150+", label: "Policy records archived" },
  { value: "25", label: "Official sources monitored" },
];

import { changelog } from "@/data/changelog";

function Index() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-primary-soft)_0%,transparent_70%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Built for U.S. small business sellers
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Independent marketplace transparency research for U.S. small businesses.
            </h1>
            <p className="mt-5 text-pretty text-lg text-muted-foreground">
              Tracking marketplace fees, policy changes, seller compliance requirements, and platform transparency across major e-commerce ecosystems.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/rate-card">
                  Browse fee database <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/policy-changes">Explore datasets</Link>
              </Button>
            </div>
            <ul className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {trust.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
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
      </section>

      {/* Datasets */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Four public datasets, continuously maintained.
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
            { icon: FileText, title: "Sourced from official policy", desc: "Every record is traceable to a primary source — no speculation, no recycled blog content." },
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

      {/* Subscribe */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-primary" />
            Newsletter
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Join Marketplace Transparency Updates
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Monthly digest of new fee changes, policy updates, and dataset releases. No spam, unsubscribe anytime.
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
            A running log of dataset additions and platform updates.
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
                  View Changes <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

