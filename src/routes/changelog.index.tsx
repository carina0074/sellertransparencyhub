import { createFileRoute, Link } from "@tanstack/react-router";
import { changelog } from "@/data/changelog";
import { PageHeader } from "@/components/layout/PageHeader";
import { shareImageMeta } from "@/lib/share-metadata";

export const Route = createFileRoute("/changelog/")({
  head: () => ({ meta: [
    { title: "Changelog — Seller Transparency Hub" },
    { name: "description", content: "Recorded Seller Transparency Hub research and publication milestones, newest first." },
    { property: "og:title", content: "Changelog — Seller Transparency Hub" },
    { property: "og:description", content: "Recorded research and publication milestones, newest first." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    ...shareImageMeta,
  ] }),
  component: ChangelogIndex,
});
function ChangelogIndex() {
  return <>
    <PageHeader eyebrow="Version history" title="Changelog" />
    <section className="mx-auto max-w-3xl divide-y divide-border px-4 py-12 sm:px-6">
      {changelog.map(entry => <article key={entry.slug} className="space-y-2 py-6">
        <p className="text-sm text-muted-foreground">{entry.date}</p>
        <h2 className="text-xl font-semibold text-foreground"><Link to="/changelog/$slug" params={{ slug: entry.slug }} className="hover:text-primary">{entry.title}</Link></h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{entry.summary}</p>
      </article>)}
    </section>
  </>;
}