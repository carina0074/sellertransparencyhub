import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen, LineChart, ShieldCheck, PackageOpen, Gavel, ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Seller Resources — Guides, Profitability, & Policy Updates" },
      { name: "description", content: "Seller guides, profitability articles, account health tutorials, inventory planning resources, and marketplace policy updates." },
      { property: "og:title", content: "Seller Resource Center" },
      { property: "og:description", content: "Practical, vendor-neutral resources for marketplace sellers." },
    ],
  }),
  component: ResourcesPage,
});

const categories = [
  { id: "guides", label: "Seller Guides", icon: BookOpen },
  { id: "profit", label: "Profitability", icon: LineChart },
  { id: "health", label: "Account Health", icon: ShieldCheck },
  { id: "inventory", label: "Inventory Planning", icon: PackageOpen },
  { id: "policy", label: "Policy Updates", icon: Gavel },
] as const;

const articles = [
  { cat: "guides", title: "The first 90 days as an Amazon FBA seller", min: 12, summary: "A checklist-driven onboarding plan from incorporation to your first profitable SKU." },
  { cat: "profit", title: "True landed cost: what your spreadsheet is missing", min: 9, summary: "Freight, tariffs, prep, and chargebacks — model them once, save them forever." },
  { cat: "profit", title: "Pricing for margin protection in inflationary cycles", min: 7, summary: "Tactics for raising prices without losing the buy box." },
  { cat: "health", title: "Reading your Account Health Rating like a CFO", min: 6, summary: "Translate ODR, late shipments, and IPI into financial KPIs your team can act on." },
  { cat: "health", title: "Writing a Plan of Action that gets accepted", min: 11, summary: "Structure, tone, and the three sections appeals teams look for first." },
  { cat: "inventory", title: "Sell-through targets by category", min: 5, summary: "Benchmarks for healthy turnover across home, apparel, beauty, and electronics." },
  { cat: "inventory", title: "Forecasting Q4 demand without overcommitting", min: 8, summary: "A lean planning model that protects cash while staying in stock." },
  { cat: "policy", title: "What the 2026 fee shifts mean for private label", min: 6, summary: "Reading between the lines of the latest Amazon and Walmart fee updates." },
  { cat: "policy", title: "INFORM Consumers Act explained for SMB sellers", min: 5, summary: "What you actually have to disclose, and how to stay compliant." },
] as const;

function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resource center"
        title="Practical resources for marketplace sellers"
        description="Vendor-neutral guides, tutorials, and policy briefings — written for operators, not influencers."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <c.icon className="h-3.5 w-3.5 text-primary" />
              {c.label}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => {
            const cat = categories.find((c) => c.id === a.cat)!;
            const Icon = cat.icon;
            return (
              <Card key={a.title} className="group border-border transition-shadow hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="gap-1 rounded-full">
                      <Icon className="h-3 w-3" /> {cat.label}
                    </Badge>
                    <span>{a.min} min read</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">{a.summary}</p>
                  <Link to="/resources" className="mt-auto inline-flex items-center text-sm font-medium text-primary">
                    Read article <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}