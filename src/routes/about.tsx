import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Eye, HeartHandshake, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Seller Transparency Hub — Mission for E-commerce Sellers" },
      { name: "description", content: "Empowering small businesses through transparency, education, and operational resilience across Amazon, Walmart, and Shopify." },
      { property: "og:title", content: "About Seller Transparency Hub" },
      { property: "og:description", content: "Why marketplace transparency matters for small and medium businesses." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our mission"
        title="Empowering small businesses through transparency."
        description="Marketplaces are powerful, but their complexity quietly costs sellers margin and stability. We exist to close that gap."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Why seller transparency matters</h2>
            <p className="mt-3 text-muted-foreground">
              Small and medium businesses generate the majority of marketplace listings — but they
              shoulder the most operational risk. A fee restructure, a policy update, or an
              unexpected verification request can wipe out months of margin.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">The problem with hidden marketplace complexity</h2>
            <p className="mt-3 text-muted-foreground">
              Fees compound across categories, weight tiers, storage windows, and return reasons.
              Account health is governed by metrics that change without warning. The information
              exists, but it's scattered across dozens of help pages — and almost never aggregated
              in a way operators can act on.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Helping sellers make better decisions</h2>
            <p className="mt-3 text-muted-foreground">
              Seller Transparency Hub takes the public information that already exists and turns it
              into decision-ready tools. Free profit modeling, account health scoring, suspension
              playbooks, and a fee change feed — all built for operators, not influencers.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {[
            { icon: Eye, title: "Transparency by default", desc: "We publish how every number is calculated. No black boxes." },
            { icon: Compass, title: "Operator-led design", desc: "Built by people who have shipped, listed, and appealed." },
            { icon: ShieldCheck, title: "Independent voice", desc: "We are not affiliated with any marketplace. Our incentive is your durability." },
            { icon: HeartHandshake, title: "Free public resources", desc: "Our most valuable tools are free, forever. Pro features fund the mission." },
          ].map((v) => (
            <Card key={v.title} className="border-border">
              <CardContent className="p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-secondary/40 p-8 text-center">
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">Try the tools that started it all.</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Free, no signup. Run a profitability check on a product or assess your account health in under two minutes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild><Link to="/calculator">Open the calculator</Link></Button>
            <Button asChild variant="outline"><Link to="/health-check">Check account health</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}