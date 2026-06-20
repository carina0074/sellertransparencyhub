import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Download, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import reportAsset from "@/assets/Marketplace-Fee-Transparency-Report-Q2-2026.pdf.asset.json";

export const Route = createFileRoute("/reports/q2-2026")({
  head: () => ({
    meta: [
      { title: "Q2 2026 Marketplace Fee Transparency Report — Seller Transparency Hub" },
      { name: "description", content: "Independent Q2 2026 analysis of marketplace fee transparency across Amazon, Walmart, eBay, and Etsy. Fee structures, policy changes, and seller cost visibility." },
      { property: "og:title", content: "Q2 2026 Marketplace Fee Transparency Report" },
      { property: "og:description", content: "Independent analysis of Q2 2026 marketplace fee transparency with disclosed methodology." },
    ],
  }),
  component: Q2_2026_ReportPage,
});

function Q2_2026_ReportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Q2 2026 Report"
        title="Marketplace Fee Transparency Report"
        description="Independent analysis of fee transparency across Amazon, Walmart Marketplace, eBay, and Etsy — April through June 2026."
      />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end print:hidden">
          <Button asChild variant="outline" size="sm">
            <a
              href={reportAsset.url}
              download
              onClick={() => {
                if (typeof window !== "undefined" && "gtag" in window) {
                  (window as any).gtag("event", "download", {
                    event_category: "report",
                    event_label: "Marketplace-Fee-Transparency-Report-Q2-2026.pdf",
                    value: 1,
                  });
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
        </div>
        {/* Meta bar */}
        <div className="mb-10 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <Calendar className="h-3.5 w-3.5" />
            June 2026
          </span>
          <span className="rounded-full border border-border px-3 py-1">Quarterly</span>
        </div>

        {/* Executive Summary */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Executive Summary</h2>
          <p className="leading-relaxed text-muted-foreground">
            Marketplace fees represent one of the most significant operational expenses faced by online sellers. Across Amazon, Walmart Marketplace, eBay, and Etsy, fee structures continue to evolve through changes to referral fees, transaction fees, fulfillment costs, advertising charges, payment processing expenses, and platform-specific service fees.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            This report provides a comparative assessment of fee transparency across major marketplaces and highlights areas where improved visibility could benefit sellers, entrepreneurs, and small businesses.
          </p>
        </section>

        {/* Key findings */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Key findings</h2>
          <ul className="space-y-3">
            {[
              "Fee structures continue to increase in complexity across all platforms.",
              "Sellers frequently struggle to calculate total selling costs.",
              "Historical fee tracking remains limited across marketplaces.",
              "Fee information is often fragmented across multiple resources.",
              "Greater transparency would support informed business decision-making.",
            ].map((item) => (
              <li key={item} className="flex gap-3 leading-relaxed text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Scope of Analysis */}
        <section className="mt-10 space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Scope of Analysis</h2>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Platforms covered</h3>
            <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
              <li>Amazon Marketplace</li>
              <li>Walmart Marketplace</li>
              <li>eBay</li>
              <li>Etsy</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Data sources</h3>
            <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
              <li>Official fee schedules</li>
              <li>Marketplace policy documentation</li>
              <li>Seller help resources</li>
              <li>Public announcements</li>
              <li>Historical fee change notices</li>
              <li>Marketplace support documentation</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Reporting period</h3>
            <p className="text-muted-foreground">April 1, 2026 – June 30, 2026</p>
          </div>
        </section>

        {/* Amazon */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Amazon Marketplace Fee Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Amazon continues to utilize a multi-layer fee structure including:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Referral fees</li>
            <li>Fulfillment fees</li>
            <li>Storage fees</li>
            <li>Additional service fees</li>
          </ul>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Observed transparency challenges</h3>
            <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
              <li>Multiple fee categories impact total seller cost.</li>
              <li>Fee updates are distributed across different documentation pages.</li>
              <li>Historical fee changes are difficult to track in a centralized location.</li>
            </ul>
          </div>
        </section>

        {/* Walmart */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Walmart Marketplace Fee Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Walmart Marketplace primarily relies on referral fees.
          </p>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Observations</h3>
            <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
              <li>Fee schedules are generally simpler than Amazon.</li>
              <li>Fee information is dispersed across multiple support resources.</li>
              <li>Category-specific differences may create uncertainty for new sellers.</li>
            </ul>
          </div>
        </section>

        {/* eBay */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">eBay Marketplace Fee Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            eBay maintains a final value fee structure with category-based variations.
          </p>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Observations</h3>
            <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
              <li>Fee calculations remain dependent on product category.</li>
              <li>Promotional and optional service fees can affect total seller costs.</li>
              <li>Historical comparison data is not always easily accessible.</li>
            </ul>
          </div>
        </section>

        {/* Comparative Analysis */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Comparative Analysis</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 font-semibold text-foreground">Platform</th>
                  <th className="py-3 pr-4 font-semibold text-foreground">Primary Fee Structure</th>
                  <th className="py-3 font-semibold text-foreground">Transparency Complexity</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium text-foreground">Amazon</td>
                  <td className="py-3 pr-4">Multi-layer fees</td>
                  <td className="py-3">High</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium text-foreground">Walmart</td>
                  <td className="py-3 pr-4">Referral fees</td>
                  <td className="py-3">Medium</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-foreground">eBay</td>
                  <td className="py-3 pr-4">Final value fees</td>
                  <td className="py-3">Medium</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            Amazon exhibits the highest fee complexity due to the number of fee components affecting total seller costs.
          </p>
        </section>

        {/* Implications for Sellers */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Implications for Sellers</h2>
          <p className="leading-relaxed text-muted-foreground">
            Transparent fee information is critical for:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Product pricing decisions</li>
            <li>Profitability analysis</li>
            <li>Marketplace selection</li>
            <li>Long-term business planning</li>
          </ul>
          <p className="leading-relaxed text-muted-foreground">
            Improved visibility into fee changes can help sellers better manage operational risk.
          </p>
        </section>

        {/* Methodology */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Methodology</h2>
          <p className="leading-relaxed text-muted-foreground">
            The Seller Transparency Hub collects and reviews publicly available marketplace documentation.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Data is categorized into:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Fee schedules</li>
            <li>Policy updates</li>
            <li>Historical fee changes</li>
            <li>Seller appeal information</li>
          </ul>
          <p className="leading-relaxed text-muted-foreground">
            All information is sourced from publicly available marketplace resources.
          </p>
        </section>

        {/* Research Archive */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Research Archive</h2>
          <ul className="space-y-3">
            <li>
              <Link
                to="/reports/q2-2026"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Q2 2026 Marketplace Fee Transparency Report
              </Link>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Q3 2026 Marketplace Fee Transparency Report
              <span className="text-xs text-muted-foreground">(Coming Soon)</span>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              2026 Annual Marketplace Transparency Review
              <span className="text-xs text-muted-foreground">(Coming Soon)</span>
            </li>
          </ul>
        </section>

        {/* About */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">About Seller Transparency Hub</h2>
          <p className="leading-relaxed text-muted-foreground">
            Seller Transparency Hub is an independent research initiative focused on marketplace transparency, fee visibility, and seller policy research.
          </p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Website:</span>{" "}
              <a href="https://sellertransparency.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                sellertransparency.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
            <p><span className="font-medium text-foreground">Published:</span> June 2026</p>
          </div>
        </section>

        {/* Footer nav */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <Button asChild variant="ghost">
            <Link to="/impact-reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Reports
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/reports/q3-2026">Next: Q3 2026 →</Link>
          </Button>
        </div>
      </article>
    </>
  );
}
