import { shareImageMeta } from "@/lib/share-metadata";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getChangelogEntry, type ChangelogEntry } from "@/data/changelog";
import { formatVerificationDate } from "@/lib/coverage-statistics";

export const Route = createFileRoute("/changelog/$slug")({
  loader: ({ params }): ChangelogEntry => {
    const entry = getChangelogEntry(params.slug);
    if (!entry) throw notFound();
    return entry;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          ...shareImageMeta,
          { title: `${loaderData.title} — Changelog` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: `${loaderData.title} — Changelog` },
          { property: "og:description", content: loaderData.summary },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Changelog entry not found" }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">Changelog entry not found</h1>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  ),
  errorComponent: ({ error, reset }: { error: any; reset: () => void }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
      <Button onClick={reset} className="mt-6">Try again</Button>
    </div>
  ),
  component: ChangelogDetail,
});

function ChangelogDetail() {
  const entry = Route.useLoaderData() as ChangelogEntry;
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <div className="mt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{entry.date}</span>
          <span>·</span>
          <span>Entry last revised: {formatVerificationDate(entry.updatedAt)}</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {entry.title}
        </h1>
        <p className="mt-4 text-muted-foreground">{entry.summary}</p>
      </div>

      {entry.sections ? (
        <div className="mt-10 space-y-10">
          {entry.sections.map((sec) => (
            <section key={sec.heading}>
              <h2 className="text-lg font-semibold text-foreground">{sec.heading}</h2>
              {sec.intro && <p className="mt-3 text-sm text-muted-foreground">{sec.intro}</p>}
              {sec.groups?.map((g) => <GroupList key={g.label} group={g} />)}
              {sec.collapsible && (
                <details className="mt-4 rounded-md border border-border p-4">
                  <summary className="cursor-pointer text-sm font-medium text-primary">{sec.collapsible.summary}</summary>
                  {sec.collapsible.groups.map((g) => <GroupList key={g.label} group={g} />)}
                </details>
              )}
              {sec.outro && <p className="mt-3 text-sm text-muted-foreground">{sec.outro}</p>}
            </section>
          ))}
        </div>
      ) : (
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Milestone notes</h2>
        <div className="mt-4 space-y-3">
          {entry.records.map((r) => (
            <Card key={r.name} className="border-border">
              <CardContent className="flex gap-3 p-4">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <div className="font-medium text-foreground">{r.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{r.detail}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      )}

      {entry.sources.length > 0 && (
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Related links</h2>
        <ul className="mt-4 space-y-2">
          {entry.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                {s.title}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
          ))}
        </ul>
      </section>
      )}
    </div>
  );
}
function GroupList({ group }: { group: { label: string; items: string[] } }) {
  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-foreground">{group.label}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {group.items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}
