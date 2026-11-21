import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { GuideEvidence } from "@/components/guide-evidence";
import { guidePoliciesQuery, promotedGuide, promotedEvidence, promotedShortAnswer, guideHead } from "@/lib/extra-guides";
import { archiveLinksQuery } from "@/lib/archive-links";
import { formatVerificationDate } from "@/lib/coverage-statistics";
import { historicalEffectiveDate } from "@/lib/historical-fee-formatting";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/guides/ebay-promoted-listings-general-ad-fee")({
  loader: async ({ context }) => {
    const [records] = await Promise.all([context.queryClient.ensureQueryData(guidePoliciesQuery), context.queryClient.ensureQueryData(archiveLinksQuery)]);
    return promotedEvidence(records);
  },
  head: ({ loaderData }) => guideHead(promotedGuide, loaderData ? promotedShortAnswer(loaderData.record) : null),
  errorComponent: () => <p role="alert" className="p-12 text-center text-destructive">Couldn't load guide evidence. Please try again.</p>,
  notFoundComponent: () => <p className="p-12 text-center">Guide not found.</p>,
  component: PromotedListingsGuide,
});

function PromotedListingsGuide() {
  const { data: records } = useSuspenseQuery(guidePoliciesQuery);
  const evidence = promotedEvidence(records);
  useEffect(() => { trackEvent("guide_viewed", { guide_slug: promotedGuide.slug }); }, []);
  if (!evidence) return <p className="p-12 text-center">Promoted Listings policy evidence unavailable.</p>;
  const { record, details } = evidence;
  const date = historicalEffectiveDate(record);
  return <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
    <Link to="/guides" className="text-sm text-primary hover:underline">← Guides</Link>
    <p className="mt-6 text-xs font-medium text-muted-foreground">eBay · US</p>
    <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{promotedGuide.title}</h1>
    <div className="mt-10 space-y-10 text-base leading-relaxed text-foreground">
      <section className="border-y border-border bg-muted/30 py-6">
        <h2 className="text-xl font-semibold">Short answer</h2>
        <p className="mt-3">{promotedShortAnswer(record)}</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Before and after</h2>
        <p className="mt-4">Before {date}, general-campaign ad fees used Direct and Halo attribution, based on the buyer's own click. From {date}, any buyer's click in the most recent 30 days can qualify the sale.</p>
        <p className="mt-3 text-sm text-muted-foreground">Announced: {record.announcement_date ? formatVerificationDate(record.announcement_date) : "Not recorded"} · Effective: {date}</p>
      </section>
      <GuideEvidence references={details.references} checked={details.reviewed_on} />
      <section>
        <h2 className="text-xl font-semibold">What this means in practice</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5">
          <li>The fee uses the ad rate in effect at the time of the sale.</li>
          <li>The item must be promoted at both the click and the sale.</li>
          <li>Priority campaigns are charged per click and aren't affected by this rule.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Related</h2>
        <ul className="mt-4 space-y-3 text-sm text-primary">
          <li><Link to="/policy-changes" search={{ record: record.id }} className="hover:underline">See the full Promoted Listings General event in the Policy Archive →</Link></li>
          <li><Link to="/methodology" className="hover:underline">How we verify policy changes →</Link></li>
        </ul>
      </section>
    </div>
  </article>;
}