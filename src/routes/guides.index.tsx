import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { guideRecordsQuery, guideTitle, internationalFeeEvidence } from "@/lib/guides";
import { formatVerificationDate } from "@/lib/coverage-statistics";
import { guidePoliciesQuery, subtitleGuide, subtitleEvidence, promotedGuide, promotedEvidence } from "@/lib/extra-guides";

export const Route = createFileRoute("/guides/")({
  head: () => ({
    meta: [
      { title: "Seller Fee Guides — Seller Transparency Hub" },
      { name: "description", content: "Seller questions answered with source-linked marketplace fee records." },
      { property: "og:title", content: "Seller Fee Guides — Seller Transparency Hub" },
      { property: "og:description", content: "Seller questions answered with source-linked marketplace fee records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "https://sellertransparency.com/guides" },
    ],
    links: [{ rel: "canonical", href: "https://sellertransparency.com/guides" }],
  }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(guideRecordsQuery), context.queryClient.ensureQueryData(guidePoliciesQuery)]),
  errorComponent: () => <p role="alert" className="p-12 text-center text-destructive">Couldn't load guide evidence. Please try again.</p>,
  notFoundComponent: () => <p className="p-12 text-center">Guide not found.</p>,
  component: GuidesIndex,
});

function GuidesIndex() {
  const { data: records } = useSuspenseQuery(guideRecordsQuery);
  const evidence = internationalFeeEvidence(records);
  const { data: policies } = useSuspenseQuery(guidePoliciesQuery);
  const subtitle = subtitleEvidence(records);
  const promoted = promotedEvidence(policies);
  return <>
    <PageHeader eyebrow="Research" title="Guides" />
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="border-y border-border py-6">
        <p className="text-xs text-muted-foreground">eBay · US</p>
        <h2 className="mt-2 text-xl font-semibold leading-relaxed"><Link to="/guides/ebay-international-fee-us-address" className="text-primary hover:underline">{guideTitle}</Link></h2>
        <p className="mt-3 text-sm text-muted-foreground">When eBay's international fee applies to a sale shipped to a US address.</p>
        <p className="mt-3 text-xs text-muted-foreground">Last checked: {formatVerificationDate(evidence?.record.last_verified ?? null)}</p>
      </article>
      <article className="border-b border-border py-6">
        <p className="text-xs text-muted-foreground">eBay · US</p>
        <h2 className="mt-2 text-xl font-semibold leading-relaxed"><Link to="/guides/ebay-subtitle-fee" className="text-primary hover:underline">{subtitleGuide.title}</Link></h2>
        <p className="mt-3 text-sm text-muted-foreground">Subtitle fees by listing format and price, and monthly Good 'Til Cancelled renewals.</p>
        <p className="mt-3 text-xs text-muted-foreground">Last checked: {formatVerificationDate(subtitle?.details.reviewed_on ?? null)}</p>
      </article>
      <article className="border-b border-border py-6">
        <p className="text-xs text-muted-foreground">eBay · US</p>
        <h2 className="mt-2 text-xl font-semibold leading-relaxed"><Link to="/guides/ebay-promoted-listings-general-ad-fee" className="text-primary hover:underline">{promotedGuide.title}</Link></h2>
        <p className="mt-3 text-sm text-muted-foreground">The “any buyer clicked” rule for Promoted Listings General ad fees.</p>
        <p className="mt-3 text-xs text-muted-foreground">Last checked: {formatVerificationDate(promoted?.details.reviewed_on ?? null)}</p>
      </article>
    </section>
  </>;
}