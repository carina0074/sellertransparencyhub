import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ArrowLeft, Calendar, Download, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { FeedbackPrompt } from "@/components/feedback-prompt";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/reports/q2-2026")({
  head: () => ({
    meta: [
      { title: "Q2 2026 Marketplace Fee Transparency Report — Seller Transparency Hub" },
      { name: "description", content: "Historical Q2 2026 analysis of marketplace fee transparency across Amazon, Walmart, eBay, and Etsy, with source citations added in an October 2026 review." },
      { property: "og:title", content: "Q2 2026 Marketplace Fee Transparency Report" },
      { property: "og:description", content: "Historical Q2 2026 publication on fee categories and transparency across four marketplaces, with an October 2026 source review." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Q2_2026_ReportPage,
});

const SOURCES = [
  { id: "S1", label: "Amazon — Selling on Amazon pricing (selling plans, referral fees by category)", url: "https://web.archive.org/web/20260513222437/https://sell.amazon.com/pricing", captured: "May 13, 2026" },
  { id: "S2", label: "Amazon — Fulfillment by Amazon (fulfillment fees, monthly storage, aged inventory, returns processing)", url: "https://web.archive.org/web/20260515002327/https://sell.amazon.com/fulfillment-by-amazon", captured: "May 15, 2026" },
  { id: "S3", label: "Walmart Marketplace — Pricing (category referral fees, Walmart Fulfillment Services, Sponsored Search)", url: "https://web.archive.org/web/20260423034235/https://marketplace.walmart.com/pricing/", captured: "April 23, 2026" },
  { id: "S4", label: "eBay — Selling fees (insertion fees, final value fees, optional listing upgrades, advertising programs)", url: "https://web.archive.org/web/20260516140939/https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822", captured: "May 16, 2026" },
  { id: "S5", label: "Etsy — Fees & Payments Policy (listing, transaction, payment processing, Etsy Ads, Offsite Ads, currency conversion)", url: "https://web.archive.org/web/20260609230637/https://www.etsy.com/legal/fees/", captured: "June 9, 2026" },
  { id: "S6", label: "Etsy Help — How Etsy's Offsite Ads work", url: "https://web.archive.org/web/20260524185136/https://help.etsy.com/hc/en-us/articles/360000338367-How-Etsy-s-Offsite-Ads-Work", captured: "May 24, 2026" },
] as const;

function Cite({ ids }: { ids: string[] }) {
  return (
    <sup className="ml-0.5 text-xs">
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && ", "}
          <a href={`#source-${id}`} className="text-primary hover:underline">{id}</a>
        </span>
      ))}
    </sup>
  );
}

function ReviewNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border-l-2 border-primary bg-muted/50 px-4 py-2 text-sm leading-relaxed text-muted-foreground">
      <span className="font-medium text-foreground">October 2026 review note: </span>
      {children}
    </p>
  );
}

function Q2_2026_ReportPage() {
  useEffect(() => {
    trackEvent("transparency_report_viewed", { report: "q2-2026" });
  }, []);
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
            <Link to="/downloads/q2-2026-report">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Link>
          </Button>
        </div>
        {/* Meta bar */}
        <div className="mb-10 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <Calendar className="h-3.5 w-3.5" />
            Originally published: June 2026
          </span>
          <span className="rounded-full border border-border px-3 py-1">Research-integrity review: October 2026</span>
          <span className="rounded-full border border-border px-3 py-1">Quarterly</span>
        </div>

        <aside className="mb-10 space-y-2 rounded-lg border border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Editorial note</p>
          <p>
            This report was originally published for Q2 2026. Seller Transparency Hub's source-verification and data-structure practices have continued to evolve since publication. In October 2026, the material factual claims on this page were reviewed for source traceability, using archived copies of official marketplace pages captured during April–June 2026.
          </p>
          <p>
            The report remains a historical Q2 publication. Claim-level citations and clearly labeled review notes were added in October 2026; they were not part of the original report. Statements that could not be supported were qualified or removed. The downloadable PDF is the original June 2026 publication and does not include these review notes.
          </p>
        </aside>

        {/* Executive Summary */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Executive Summary</h2>
          <p className="leading-relaxed text-muted-foreground">
            Marketplace fees represent one of the most significant operational expenses faced by online sellers. Across Amazon, Walmart Marketplace, eBay, and Etsy, fee structures continue to evolve through changes to referral fees, transaction fees, fulfillment costs, advertising charges, payment processing expenses, and platform-specific service fees.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            This report provides a comparative assessment of fee transparency across major marketplaces and highlights areas where improved visibility could benefit sellers, entrepreneurs, and small businesses.
          </p>
          <ReviewNote>
            The Q2 report described the fee categories each marketplace uses. It did not document specific fee changes that took effect during April–June 2026.
          </ReviewNote>
        </section>

        {/* Key findings */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Key findings</h2>
          <p className="text-sm text-muted-foreground">These findings are the Q2 report's analysis of the fee documentation it reviewed. They are not measurements of seller behavior.</p>
          <ul className="space-y-3">
            {[
              "Each of the four platforms reviewed charges sellers through several distinct fee components.",
              "Because costs are spread across several fee components, total selling costs can be difficult to calculate.",
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
          <ReviewNote>
            Two findings were reworded. The original said fee structures "continue to increase in complexity across all platforms" and that sellers "frequently struggle" to calculate costs. The report did not measure complexity over time and did not survey sellers, so those claims could not be supported as written.
          </ReviewNote>
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
          <ReviewNote>
            This scope covers four marketplaces for Q2 2026. Seller Transparency Hub's current coverage is broader and also includes Shopify; that later coverage is not part of this report.
          </ReviewNote>
        </section>

        {/* Amazon */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Amazon Marketplace Fee Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Amazon's seller fee documentation covers many distinct fee categories.
          </p>
          <p className="leading-relaxed text-muted-foreground">Major fee categories include:</p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Referral fees, which vary by product category<Cite ids={["S1"]} /></li>
            <li>Fulfillment fees (Fulfillment by Amazon sellers)<Cite ids={["S2"]} /></li>
            <li>Monthly inventory storage fees (Fulfillment by Amazon)<Cite ids={["S2"]} /></li>
            <li>Aged inventory fees for items stored more than 181 days (Fulfillment by Amazon)<Cite ids={["S2"]} /></li>
            <li>Returns processing fees, charged on orders where Amazon provides free return shipping<Cite ids={["S2"]} /></li>
            <li>Optional advertising costs<Cite ids={["S1"]} /></li>
            <li>Additional optional service fees<Cite ids={["S1", "S2"]} /></li>
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
          <ReviewNote>
            The original listed "long-term storage fees." Amazon's Q2 2026 documentation called this charge "aged inventory." Storage, aged-inventory and returns-processing fees apply only in certain cases, so they are labeled with their conditions. The original opening line, calling Amazon "one of the most comprehensive marketplace ecosystems in the world," was an unsupported superlative and has been replaced.
          </ReviewNote>
        </section>

        {/* Walmart */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Walmart Marketplace Fee Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Walmart Marketplace is an alternative channel for sellers seeking additional distribution.
          </p>
          <p className="leading-relaxed text-muted-foreground">Major fee categories include:</p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Referral fees, which vary by category and product type<Cite ids={["S3"]} /></li>
            <li>Optional fulfillment services (Walmart Fulfillment Services)<Cite ids={["S3"]} /></li>
            <li>Optional advertising expenses (e.g., Sponsored Search)<Cite ids={["S3"]} /></li>
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
          <ReviewNote>
            The original said Walmart Marketplace "continues to expand." The report contained no evidence for that, so it was removed. "Generally less complex than Amazon" is the report's own comparison of the documented fee categories, not a measured result.
          </ReviewNote>
        </section>

        {/* eBay */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">eBay Marketplace Fee Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            eBay supports a diverse range of sellers, from individuals to businesses.
          </p>
          <p className="leading-relaxed text-muted-foreground">Major fee categories include:</p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Final value fees, which vary by category<Cite ids={["S4"]} /></li>
            <li>Listing-related (insertion) fees<Cite ids={["S4"]} /></li>
            <li>Fees for optional listing upgrades<Cite ids={["S4"]} /></li>
            <li>Optional advertising programs<Cite ids={["S4"]} /></li>
          </ul>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Observations</h3>
            <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
              <li>Fee calculations vary by category.</li>
              <li>Promotional options may increase total selling costs.</li>
              <li>Historical fee comparisons are not always easily accessible.</li>
            </ul>
          </div>
          <ReviewNote>
            The original called eBay "one of the largest online marketplaces." The report cited no size data, so that phrase was removed. The fee categories reflect eBay's U.S. selling-fees page as captured in May 2026.
          </ReviewNote>
        </section>

        {/* Etsy */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Etsy Marketplace Fee Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Etsy serves a distinct segment of digital commerce focused on handmade, vintage, and craft-supply goods sold by artisans, creators, independent designers, and vintage sellers.
          </p>
          <p className="leading-relaxed text-muted-foreground">Major fee categories include:</p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Listing fees ($0.20 USD per listing on Etsy.com)<Cite ids={["S5"]} /></li>
            <li>Transaction fees (6.5% of the displayed price plus shipping and gift wrapping)<Cite ids={["S5"]} /></li>
            <li>Payment processing fees, which vary by the country of the seller's bank account<Cite ids={["S5"]} /></li>
            <li>Offsite Ads fees, charged only on attributed orders: 15% as standard, or 12% for shops that meet the program's conditions<Cite ids={["S5", "S6"]} /></li>
            <li>Optional Etsy Ads, with a daily budget set by the seller<Cite ids={["S5"]} /></li>
            <li>Currency conversion fees (2.5%) when the listing currency differs from the payment-account currency<Cite ids={["S5"]} /></li>
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
            For sellers operating very small businesses, fee increases may have a larger relative impact on profitability. The inclusion of Etsy broadens marketplace transparency research beyond large-scale general retail platforms to include independent creators and small businesses.
          </p>
          <ReviewNote>
            The original said Etsy's seller community is "heavily composed" of small-scale businesses, and referred to the "growing importance" of independent creators. The report contained no seller-size or trend data, so both claims were qualified. The original listed fee categories without amounts. The amounts above come from Etsy's U.S. fee policy as captured in June 2026 and were added during the review. Payment processing rates are not shown because they vary by country.
          </ReviewNote>
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
                  <td className="py-3 pr-4">Referral fees; optional fulfillment and advertising</td>
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
            The complexity ratings are the Q2 report's qualitative judgments, based on how many fee components each marketplace documents. They are not a scored index. In this assessment, Amazon exhibits the highest fee complexity due to the number of fee components affecting total seller costs. Etsy shows medium-high complexity as total costs are distributed across multiple fee categories.
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
            Marketplace transparency benefits not only individual sellers but also the broader digital commerce ecosystem. Many small businesses use online marketplaces to reach customers in the United States and internationally.
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
          <ReviewNote>
            The original said small businesses "increasingly" rely on online marketplaces. The report presented no trend data, so the sentence now describes current use without a trend.
          </ReviewNote>
        </section>

        {/* Methodology */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Methodology</h2>
          <p className="leading-relaxed text-muted-foreground">
            Seller Transparency Hub collects and reviews publicly available marketplace information.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Data categories include:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Fee schedules</li>
            <li>Policy updates</li>
            <li>Historical fee changes</li>
            <li>Seller documentation</li>
            <li>Marketplace announcements</li>
          </ul>
          <p className="leading-relaxed text-muted-foreground">
            All findings are based on publicly available information available during the reporting period.
          </p>
          <ReviewNote>
            The Q2 review was a manual review of public documentation. It did not use automated or continuous monitoring, and it did not keep a claim-level source log. The citations on this page were added in October 2026 using archived copies of official pages captured during the reporting period. They show what those pages said in Q2 2026, but they are not necessarily the exact pages the original authors consulted.
          </ReviewNote>
        </section>

        {/* Future Research Roadmap */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Future Research Roadmap</h2>
          <p className="leading-relaxed text-muted-foreground">
            Future reports will include:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Quarterly transparency reporting</li>
            <li>Historical fee benchmarking</li>
            <li>Expanded Etsy coverage</li>
            <li>Policy change monitoring</li>
            <li>Marketplace transparency indicators</li>
            <li>Seller-impact trend analysis</li>
            <li>Longitudinal marketplace research</li>
          </ul>
          <p className="leading-relaxed text-muted-foreground">
            The long-term objective is to create a publicly accessible repository documenting marketplace fee developments and transparency trends across major e-commerce ecosystems.
          </p>
          <ReviewNote>
            This roadmap reflects plans as of June 2026. "Policy change monitoring" describes a planned research activity, not an automated monitoring system.
          </ReviewNote>
        </section>

        {/* Limitations */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Limitations (added October 2026)</h2>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Coverage is not exhaustive. The report describes major fee categories, not every fee, surcharge, or program.</li>
            <li>Fees vary by category, plan, fulfillment method, program participation, and seller location. Unless noted, the information reflects U.S. marketplace documentation.</li>
            <li>Marketplace documentation changes over time. Fee names and amounts shown here may differ from current pages.</li>
            <li>Citations rely on archived copies of pages from the reporting period. A current fee page does not establish what applied in Q2 2026.</li>
            <li>This report does not include dataset counts. Seller Transparency Hub's current fee database reflects later work and is not a measure of what was tracked in Q2 2026.</li>
          </ul>
        </section>

        {/* Sources */}
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Sources (added October 2026)</h2>
          <p className="text-sm text-muted-foreground">These are Internet Archive copies of official marketplace pages, captured during the Q2 2026 reporting period.</p>
          <ol className="space-y-2 text-sm text-muted-foreground">
            {SOURCES.map((s) => (
              <li key={s.id} id={`source-${s.id}`} className="scroll-mt-24">
                <span className="font-medium text-foreground">[{s.id}]</span>{" "}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{s.label}</a>{" "}
                <span>(archived {s.captured})</span>
              </li>
            ))}
          </ol>
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
            <li>
              <Link
                to="/reports/q3-2026"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Q3 2026 Marketplace Fee Transparency Report
              </Link>
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
            <p><span className="font-medium text-foreground">Originally published:</span> June 2026</p>
            <p><span className="font-medium text-foreground">Research-integrity review:</span> October 2026</p>
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

        <div className="mt-8">
          <FeedbackPrompt resourceType="transparency_report" resourcePath="/reports/q2-2026" />
        </div>
      </article>
    </>
  );
}
