import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmailCapture } from "@/components/email-capture";

export const Route = createFileRoute("/reports/annual-2026")({
  head: () => ({
    meta: [
      { title: "Annual Marketplace Transparency Review 2026 — Coming Soon" },
      { name: "description", content: "The 2026 Annual Marketplace Transparency Review is currently being compiled. A comprehensive year-in-review of fee changes across all major marketplaces." },
      { property: "og:title", content: "Annual Marketplace Transparency Review 2026 — Coming Soon" },
      { property: "og:description", content: "Comprehensive year-in-review of 2026 marketplace fee changes. Coming soon." },
    ],
  }),
  component: Annual_2026_ComingSoonPage,
});

function Annual_2026_ComingSoonPage() {
  return (
    <>
      <PageHeader
        eyebrow="2026 Annual Review"
        title="Annual Marketplace Transparency Review"
        description="Coming Soon"
      />
      <section className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6 lg:px-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-muted">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Report in Progress
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            The 2026 Annual Marketplace Transparency Review is currently being compiled.
            This comprehensive report will analyze the full year of fee changes across Amazon, Walmart, Shopify, eBay, Etsy, and other major marketplaces —
            with trend analysis, year-over-year comparisons, and forward-looking projections for 2027.
          </p>
          <p className="text-sm text-muted-foreground">
            Expected publish date: <span className="font-medium text-foreground">January 2027</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/40 p-6 sm:p-8">
          <EmailCapture
            topic="policy_updates"
            title="Get notified when the annual review publishes"
            description="Be the first to receive the 2026 Annual Review. One email — no spam."
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button asChild variant="ghost">
            <Link to="/reports/q3-2026">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Q3 2026
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/impact-reports">All Reports →</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
