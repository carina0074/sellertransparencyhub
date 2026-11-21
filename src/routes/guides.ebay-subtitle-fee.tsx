import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { GuideEvidence } from "@/components/guide-evidence";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { guideRecordsQuery } from "@/lib/guides";
import { archiveLinksQuery } from "@/lib/archive-links";
import { subtitleGuide, subtitleEvidence, subtitleShortAnswer, subtitleIllustration, guideHead } from "@/lib/extra-guides";
import { tierAmount } from "@/lib/fee-formatting";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/guides/ebay-subtitle-fee")({
  loader: async ({ context }) => {
    const [records] = await Promise.all([context.queryClient.ensureQueryData(guideRecordsQuery), context.queryClient.ensureQueryData(archiveLinksQuery)]);
    return subtitleEvidence(records);
  },
  head: ({ loaderData }) => guideHead(subtitleGuide, loaderData ? subtitleShortAnswer : null),
  errorComponent: () => <p role="alert" className="p-12 text-center text-destructive">Couldn't load guide evidence. Please try again.</p>,
  notFoundComponent: () => <p className="p-12 text-center">Guide not found.</p>,
  component: SubtitleGuide,
});

function SubtitleGuide() {
  const { data: records } = useSuspenseQuery(guideRecordsQuery);
  const evidence = subtitleEvidence(records);
  useEffect(() => { trackEvent("guide_viewed", { guide_slug: subtitleGuide.slug }); }, []);
  if (!evidence) return <p className="p-12 text-center">Subtitle record evidence unavailable.</p>;
  const { record, details } = evidence;
  const example = subtitleIllustration(details, 4000, 3);
  const money = (minor: number) => `$${(minor / 100).toFixed(2)}`;
  return <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
    <Link to="/guides" className="text-sm text-primary hover:underline">← Guides</Link>
    <p className="mt-6 text-xs font-medium text-muted-foreground">eBay · US</p>
    <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{subtitleGuide.title}</h1>
    <div className="mt-10 space-y-10 text-base leading-relaxed text-foreground">
      <section className="border-y border-border bg-muted/30 py-6">
        <h2 className="text-xl font-semibold">Short answer</h2>
        <p className="mt-3">{subtitleShortAnswer}</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">The fee table</h2>
        <p className="mt-3 text-sm text-muted-foreground">{details.scope}. An item priced exactly $150 falls in the “up to $150” band.</p>
        <div className="mt-4">
          <Table>
            <TableHeader><TableRow><TableHead className="whitespace-normal">Listing format and price</TableHead><TableHead className="text-right">Subtitle fee</TableHead></TableRow></TableHeader>
            <TableBody>{details.tiers.map(tier => <TableRow key={tier.label}>
              <TableCell className="whitespace-normal">{tier.label}</TableCell>
              <TableCell className="text-right tabular-nums whitespace-normal">{tierAmount(tier, details.unit)}</TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </div>
      </section>
      <GuideEvidence references={details.references} checked={details.reviewed_on} />
      <section>
        <h2 className="text-xl font-semibold">What this means in practice</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5">
          <li>It's charged when the listing goes live, even if the item never sells, and isn't refunded.</li>
          <li>On a fixed-price listing up to $150, it's {example ? money(example.monthlyMinor) : "an amount not currently available"} every month the listing stays live.</li>
          <li>Some third-party sites list different amounts; these values are from eBay's page as of the check date.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Example</h2>
        <p className="mt-3 text-xs font-medium text-muted-foreground">Illustrative calculation — not eBay's example</p>
        {example ? <p className="mt-3">A $40 fixed-price Good 'Til Cancelled listing with a subtitle that stays live for 3 months: 3 × {money(example.monthlyMinor)} = {money(example.totalMinor)} in subtitle fees, whether or not it sells.</p> : <p className="mt-3">Illustrative amount unavailable from the current record.</p>}
      </section>
      <section>
        <h2 className="text-xl font-semibold">Related</h2>
        <ul className="mt-4 space-y-3 text-sm text-primary">
          <li><Link to="/rate-card" search={{ record: record.id }} className="hover:underline">See the full Subtitle record in the Fee Database →</Link></li>
          <li><Link to="/calculator" className="hover:underline">Calculator →</Link></li>
          <li><Link to="/methodology" className="hover:underline">How we verify fees →</Link></li>
        </ul>
      </section>
    </div>
  </article>;
}