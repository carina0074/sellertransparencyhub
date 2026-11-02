import { shareImageMeta } from "@/lib/share-metadata";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/reports/")({
  head: () => ({
    meta: [
      ...shareImageMeta,
      { title: "Marketplace Fee Reports | Seller Transparency Hub" },
      { name: "description", content: "All Seller Transparency Hub marketplace fee transparency reports, newest first." },
      { property: "og:title", content: "Marketplace Fee Reports" },
      { property: "og:description", content: "All Seller Transparency Hub marketplace fee transparency reports, newest first." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsIndex,
});

const reports = [
  { to: "/reports/q3-2026", title: "Q3 2026 Marketplace Fee Transparency Report", period: "July–September 2026", scope: "Amazon, Walmart Marketplace, eBay, Etsy and Shopify" },
  { to: "/reports/q2-2026", title: "Q2 2026 Marketplace Fee Transparency Report", period: "April–June 2026", scope: "Amazon, Walmart Marketplace, eBay and Etsy", published: "Published June 2026" },
] as const;

function ReportsIndex() {
  return (
    <>
      <PageHeader eyebrow="Research" title="Reports" description="All published reports, newest first." />
      <section className="mx-auto max-w-4xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
        {reports.map((r) => (
          <Card key={r.to} className="border-border">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">{r.period}</div>
              <h2 className="mt-1 text-lg font-semibold text-foreground">{r.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{r.scope}</p>
              {"published" in r && <p className="mt-1 text-sm text-muted-foreground">{r.published}</p>}
              <Link to={r.to} className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:text-foreground">
                Read report <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
