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
            Amazon maintains one of the most comprehensive marketplace ecosystems in the world.
          </p>
          <p className="leading-relaxed text-muted-foreground">Major fee categories include:</p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Referral fees</li>
            <li>Fulfillment fees</li>
            <li>Monthly storage fees</li>
            <li>Long-term storage fees</li>
            <li>Returns processing fees</li>
            <li>Advertising costs</li>
            <li>Additional service fees</li>
          </ul>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Observed transparency challenges</h3>
            <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
              <li>Numerous fee categories affect total selling costs.</li>
              <li>Sellers must often consult multiple documentation sources.</li>
              <li>Historical fee changes are not consolidated into a centralized repository.</li>
              <li>New sellers may underestimate total operating costs.</li>
            </ul>
          </div>
        </section>

        {/* Walmart */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Walmart Marketplace Fee Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Walmart Marketplace continues to expand as an important alternative marketplace for sellers seeking additional distribution channels.
          </p>
          <p className="leading-relaxed text-muted-foreground">Major fee categories include:</p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Referral fees</li>
            <li>Optional fulfillment-related services</li>
            <li>Advertising expenses</li>
          </ul>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Observations</h3>
            <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
              <li>Fee schedules are generally less complex than Amazon.</li>
              <li>Category-specific fee structures may create confusion.</li>
              <li>Information is dispersed across multiple seller resources.</li>
            </ul>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            Greater fee transparency may assist sellers evaluating whether to diversify beyond a single marketplace platform.
          </p>
        </section>

        {/* eBay */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">eBay Marketplace Fee Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            eBay remains one of the largest online marketplaces and supports a diverse range of businesses.
          </p>
          <p className="leading-relaxed text-muted-foreground">Major fee categories include:</p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Final value fees</li>
            <li>Listing-related fees</li>
            <li>Optional promotional fees</li>
            <li>Advertising services</li>
          </ul>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Observations</h3>
            <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
              <li>Fee calculations vary by category.</li>
              <li>Promotional options may increase total selling costs.</li>
              <li>Historical fee comparisons are not always easily accessible.</li>
            </ul>
          </div>
        </section>

        {/* Etsy */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Etsy Marketplace Fee Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Etsy serves a unique segment of the digital commerce economy by supporting artisans, creators, independent designers, vintage sellers, and micro-businesses. Unlike larger general retail marketplaces, Etsy's seller community is heavily composed of entrepreneurs operating small-scale businesses.
          </p>
          <p className="leading-relaxed text-muted-foreground">Major fee categories include:</p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Listing fees</li>
            <li>Transaction fees</li>
            <li>Payment processing fees</li>
            <li>Offsite advertising fees</li>
            <li>Etsy Ads expenses</li>
            <li>Currency conversion fees</li>
          </ul>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Observations</h3>
            <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
              <li>Total costs are distributed across multiple fee categories.</li>
              <li>Advertising-related fees can create uncertainty regarding final transaction costs.</li>
              <li>Historical fee changes may be difficult for sellers to track over time.</li>
              <li>New sellers often face challenges estimating total marketplace costs before launching products.</li>
            </ul>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            Because many Etsy sellers operate micro-businesses, fee increases may have a disproportionate impact on profitability. The inclusion of Etsy broadens marketplace transparency research beyond large-scale retail platforms and reflects the growing importance of independent creators and small businesses within the digital economy.
          </p>
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
                  <td className="py-3 pr-4">Referral, fulfillment, storage, service fees</td>
                  <td className="py-3">High</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium text-foreground">Walmart</td>
                  <td className="py-3 pr-4">Referral fees</td>
                  <td className="py-3">Medium</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium text-foreground">eBay</td>
                  <td className="py-3 pr-4">Final value fees and optional services</td>
                  <td className="py-3">Medium</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-foreground">Etsy</td>
                  <td className="py-3 pr-4">Listing, transaction, advertising, payment processing fees</td>
                  <td className="py-3">Medium-High</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            Amazon exhibits the highest fee complexity due to the number of fee components affecting total seller costs. Etsy shows medium-high complexity as total costs are distributed across multiple fee categories.
          </p>
        </section>

        {/* Implications for Sellers */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Implications for Sellers</h2>
          <p className="leading-relaxed text-muted-foreground">
            Transparent fee information is essential for:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Pricing decisions</li>
            <li>Profitability analysis</li>
            <li>Marketplace selection</li>
            <li>Risk management</li>
            <li>Long-term planning</li>
          </ul>
          <p className="leading-relaxed text-muted-foreground">
            Improved visibility into marketplace fees can help sellers better understand operating costs and make more informed business decisions.
          </p>
        </section>

        {/* Public Interest Significance */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Public Interest Significance</h2>
          <p className="leading-relaxed text-muted-foreground">
            Marketplace transparency benefits not only individual sellers but also the broader digital commerce ecosystem. Small businesses increasingly rely on online marketplaces to reach customers throughout the United States and internationally.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Improved access to fee information contributes to:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Greater market transparency</li>
            <li>Better-informed business decisions</li>
            <li>Increased accessibility of marketplace information</li>
            <li>Reduced information asymmetry</li>
            <li>Enhanced support for entrepreneurship and small business growth</li>
          </ul>
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
