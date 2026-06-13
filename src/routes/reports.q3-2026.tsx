import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Bell, Mail } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmailCapture } from "@/components/email-capture";

export const Route = createFileRoute("/reports/q3-2026")({
  head: () => ({
    meta: [
      { title: "Q3 2026 Marketplace Fee Transparency Report — Coming Soon" },
      { name: "description", content: "The Q3 2026 Marketplace Fee Transparency Report is currently being compiled. Sign up to be notified when it publishes." },
      { property: "og:title", content: "Q3 2026 Marketplace Fee Transparency Report — Coming Soon" },
      { property: "og:description", content: "Independent analysis of Q3 2026 marketplace fee changes. Coming soon." },
    ],
  }),
  component: Q3_2026_ComingSoonPage,
});

function Q3_2026_ComingSoonPage() {
  return (
    <>
      <PageHeader
        eyebrow="Q3 2026 Report"
        title="Marketplace Fee Transparency Report"
        description="Coming Soon"
      />
      <section className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6 lg:px-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-muted">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Report in Progress
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            The Q3 2026 Marketplace Fee Transparency Report is currently being compiled.
            Our team is analyzing fee changes from Amazon, Walmart, Shopify, eBay, and other major marketplaces for the July–September period.
          </p>
          <p className="text-sm text-muted-foreground">
            Expected publish date: <span className="font-medium text-foreground">October 2026</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/40 p-6 sm:p-8">
          <EmailCapture
            topic="policy_updates"
            title="Get notified when this report publishes"
            description="Be the first to receive the Q3 2026 analysis. One email — no spam."
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button asChild variant="ghost">
            <Link to="/reports/q2-2026">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Q2 2026
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/reports/annual-2026">Annual Report →</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
