import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArchiveCopyLink } from "@/components/archive-copy-link";
import { archiveLinksQuery } from "@/lib/archive-links";
import { formatVerificationDate } from "@/lib/coverage-statistics";
import { trackEvent } from "@/lib/analytics";
import { guideRecordsQuery, guideTitle, guideSeoTitle, guideDescription, guideSlug, internationalFeeEvidence, guideShortAnswer, illustrativeInternationalFeeMinor } from "@/lib/guides";

export const Route = createFileRoute("/guides/ebay-international-fee-us-address")({
  loader: async ({ context }) => {
    const [records] = await Promise.all([
      context.queryClient.ensureQueryData(guideRecordsQuery),
      context.queryClient.ensureQueryData(archiveLinksQuery),
    ]);
    return internationalFeeEvidence(records);
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: guideSeoTitle },
      { name: "description", content: guideDescription },
      { property: "og:title", content: guideSeoTitle },
      { property: "og:description", content: guideDescription },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: `https://sellertransparency.com/guides/${guideSlug}` },
    ],
    links: [{ rel: "canonical", href: `https://sellertransparency.com/guides/${guideSlug}` }],
    scripts: loaderData ? [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: guideTitle, acceptedAnswer: { "@type": "Answer", text: guideShortAnswer(loaderData.rate) } }],
    }) }] : [],
  }),
  errorComponent: () => <p role="alert" className="p-12 text-center text-destructive">Couldn't load guide evidence. Please try again.</p>,
  notFoundComponent: () => <p className="p-12 text-center">Guide not found.</p>,
  component: InternationalFeeGuide,
});

function InternationalFeeGuide() {
  const { data: records } = useSuspenseQuery(guideRecordsQuery);
  const evidence = internationalFeeEvidence(records);
  useEffect(() => { trackEvent("guide_viewed", { guide_slug: guideSlug }); }, []);
  if (!evidence) return <p className="p-12 text-center">International fee record unavailable.</p>;
  const { record, reference, details, rate } = evidence;
  const lastChecked = formatVerificationDate(record.last_verified);
  const exampleFee = (illustrativeInternationalFeeMinor(5000, record.value) / 100).toFixed(2);
  return <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
    <Link to="/guides" className="text-sm text-primary hover:underline">← Guides</Link>
    <p className="mt-6 text-xs font-medium text-muted-foreground">eBay · US</p>
    <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{guideTitle}</h1>
    <div className="mt-10 space-y-10 text-base leading-relaxed text-foreground">
      <section className="border-y border-border bg-muted/30 py-6">
        <h2 className="text-xl font-semibold">Short answer</h2>
        <p className="mt-3">eBay charges US-registered sellers a {rate} international fee in two situations: when the delivery address is outside the US, <strong>or</strong> when the buyer's eBay account is registered outside the US. The second case applies even if you ship to a US address. That is why sellers who have turned off international shipping can still see this fee.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">eBay's exact wording</h2>
        <p className="mt-4 text-sm font-medium">{reference?.heading ?? "Source heading not recorded"}</p>
        <blockquote className="mt-3 border-l-2 border-primary pl-5">{reference?.quote ?? "Supporting quote not recorded."}</blockquote>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <a href={reference?.url ?? record.source_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{record.source_title} ↗</a>
          <ArchiveCopyLink url={reference?.url ?? record.source_url} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Last checked: {lastChecked}</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">What this means in practice</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5">
          <li>The fee is {rate} of the total amount of the sale, not just the item price. {details?.basis ?? "Total-sale basis not recorded."}.</li>
          <li>It is deducted automatically from your sales.</li>
          <li>Turning off international shipping controls where you ship to. It does not change where a buyer's account is registered.</li>
          <li>eBay's wording says the fee applies “if you're not using eBay International Shipping to ship your item.”</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Example</h2>
        <p className="mt-3 text-xs font-medium text-muted-foreground">Illustrative calculation — not eBay's example</p>
        <p className="mt-3">A sale with a total amount of $50.00 to a buyer whose eBay account is registered outside the US, shipped to a US address: {rate} × $50.00 = ${exampleFee} international fee, in addition to the other selling fees.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Related</h2>
        <ul className="mt-4 space-y-3 text-sm text-primary">
          <li><Link to="/rate-card" search={{ record: record.id }} className="hover:underline">See the full International fee record in the Fee Database →</Link></li>
          <li><Link to="/calculator" className="hover:underline">Calculator →</Link></li>
          <li><Link to="/methodology" className="hover:underline">How we verify fees →</Link></li>
        </ul>
      </section>
      <p className="border-t border-border pt-6 text-xs text-muted-foreground">Last checked: {lastChecked}. Fees and rules change; confirm on <a href={record.source_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">eBay's page</a> before relying on this.</p>
    </div>
  </article>;
}