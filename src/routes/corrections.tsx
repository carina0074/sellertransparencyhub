import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { shareImageMeta } from "@/lib/share-metadata";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { sortedCorrections } from "@/lib/corrections";
import { longDate, SITE_URL } from "@/lib/citation";

const TITLE = "Corrections — Seller Transparency Hub";
const DESC = "Data corrections and rejected claims, with what was wrong or unsupported, what changed, and the source used.";

export const Route = createFileRoute("/corrections")({
  head: () => ({
    meta: [
      ...shareImageMeta,
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/corrections` }],
  }),
  component: CorrectionsPage,
});

function CorrectionsPage() {
  const entries = sortedCorrections();
  return (
    <div>
      <PageHeader eyebrow="Research" title="Corrections" description="Data corrections and rejected claims, newest first." />
      <section className="mx-auto max-w-3xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          To report an error, email <a href="mailto:research@sellertransparency.com" className="text-primary hover:underline">research@sellertransparency.com</a>. See the <Link to="/methodology" className="text-primary hover:underline">Methodology</Link> for how corrections are handled.
        </p>
        <ol className="space-y-4">
          {entries.map((e) => (
            <li key={`${e.date}-${e.subject}`}>
              <Card className="border-border">
                <CardContent className="space-y-3 p-5 text-sm">
                  <p className="text-xs tabular-nums text-muted-foreground"><time dateTime={e.date}>{longDate(e.date)}</time></p>
                  <h2 className="text-base font-semibold text-foreground">
                    {e.recordHref ? <a href={e.recordHref} className="hover:underline">{e.subject}</a> : e.subject}
                  </h2>
                  <dl className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
                    <dt className="text-muted-foreground">What was wrong</dt><dd className="text-foreground">{e.problem}</dd>
                    <dt className="text-muted-foreground">What changed</dt><dd className="text-foreground">{e.change}</dd>
                    <dt className="text-muted-foreground">Source used</dt>
                    <dd><a href={e.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{e.source.title} <ExternalLink className="h-3 w-3" /></a></dd>
                  </dl>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
