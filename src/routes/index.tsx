import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, Calculator, ShieldCheck, ShieldAlert, BarChart3,
  CheckCircle2, Sparkles, Lock, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Seller Transparency Hub — Marketplace Profit & Account Health Tools" },
      { name: "description", content: "Free profit calculator, account health checker, and suspension prevention tools for Amazon, Walmart, and Shopify sellers." },
      { property: "og:title", content: "Seller Transparency Hub" },
      { property: "og:description", content: "Understand marketplace economics before they cost you money." },
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

const products = [
  {
    icon: Calculator,
    title: "Marketplace Profit Calculator",
    desc: "Model referral, fulfillment, and storage fees across Amazon, Walmart, and Shopify. See net margin before you list.",
    to: "/calculator",
    cta: "Calculate my profit",
  },
  {
    icon: ShieldCheck,
    title: "Account Health Checker",
    desc: "Score your seller account on a 0-100 scale using ODR, late shipments, cancellations, and IPI. Get actionable steps.",
    to: "/health-check",
    cta: "Check my health",
  },
  {
    icon: ShieldAlert,
    title: "Suspension Prevention Center",
    desc: "Playbooks and templates for inauthentic claims, IP complaints, review manipulation, and verification issues.",
    to: "/suspension-prevention",
    cta: "Open the playbooks",
  },
  {
    icon: BarChart3,
    title: "Fee Transparency Dashboard",
    desc: "Track marketplace fee changes as they happen — with estimated seller impact and affected categories.",
    to: "/fees",
    cta: "View fee changes",
  },
];

const stats = [
  { value: "$1.2M+", label: "Seller margin recovered" },
  { value: "12,400", label: "Calculations run" },
  { value: "4 marketplaces", label: "Modeled in detail" },
  { value: "98%", label: "Free public tools" },
];

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
              Transparency for e-commerce sellers
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Understand your marketplace economics before they cost you money.
            </h1>
            <p className="mt-5 text-pretty text-lg text-muted-foreground">
              Transparency tools for e-commerce sellers. Calculate fees, estimate profitability,
              monitor account health, and reduce operational risks — all in one place.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/calculator">
                  Calculate my profit <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/health-check">Explore tools</Link>
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

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Four tools, one transparent workflow.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built for FBA sellers, Walmart marketplace operators, Shopify merchants,
            and the entrepreneurs scaling them.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {products.map((p) => (
            <Card key={p.title} className="group border-border transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">{p.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-auto pt-2">
                  <Link
                    to={p.to}
                    className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-foreground"
                  >
                    {p.cta} <ArrowRight className="ml-1 h-4 w-4" />
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
            { icon: Lock, title: "Independent by design", desc: "We don't sell leads to marketplaces. Our recommendations exist to protect your margin." },
            { icon: FileText, title: "Built on real policy data", desc: "Every fee model and prevention checklist is grounded in published marketplace policy." },
            { icon: BarChart3, title: "Decision-ready outputs", desc: "Numbers and recommendations you can take to a meeting — not dashboards that need decoding." },
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
            Stop guessing. Start pricing with confidence.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base opacity-80">
            Run a profitability check on your next SKU in under 60 seconds. No signup required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link to="/calculator">Open the calculator</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-background hover:bg-background/10 hover:text-background">
              <Link to="/about">Read our mission</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
