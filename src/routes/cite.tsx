import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { shareImageMeta } from "@/lib/share-metadata";
import { PageHeader } from "@/components/layout/PageHeader";
import { DatasetDownloadButton } from "@/components/dataset-download-button";
import { latestDataChangeQuery } from "@/lib/dataset-version";
import {
  DATASETS, DATA_LICENSE_NAME, DATA_LICENSE_URL, PUBLISHER, SITE_URL,
  citationYear, datasetBibtex, datasetCitation, longDate, versionLabel, type DatasetKey,
} from "@/lib/citation";

const TITLE = "Cite & download — Seller Transparency Hub";
const DESC = "Suggested citations, BibTeX and CSV downloads for the Marketplace Fee Database, Seller Fee Change Feed and Policy Archive, with the CC BY 4.0 data license.";

export const Route = createFileRoute("/cite")({
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
    links: [{ rel: "canonical", href: `${SITE_URL}/cite` }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(latestDataChangeQuery),
  component: CitePage,
});

const ORDER: DatasetKey[] = ["fee_database", "fee_change_feed", "policy_archive"];

function CitePage() {
  const { data: latest } = useSuspenseQuery(latestDataChangeQuery);
  const version = versionLabel(latest);
  const year = citationYear(latest);
  const [today, setToday] = useState<{ long: string; iso: string } | null>(null);
  useEffect(() => { const iso = new Date().toISOString().slice(0, 10); setToday({ long: longDate(iso), iso }); }, []);
  const retrieved = today?.long ?? "[date]";

  return (
    <div>
      <PageHeader eyebrow="Research" title="Cite & download" description="How to credit this research, and CSV copies of each public dataset." />
      <section className="mx-auto max-w-3xl space-y-10 px-4 py-12 text-sm leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
        <div className="rounded-md border border-border bg-muted/40 p-4">
          <p className="font-medium text-foreground">Dataset version: {version}</p>
          <p className="mt-1">The version label is the date of the latest recorded change to any public record{latest ? ` (${longDate(latest)}, UTC)` : ""}.</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Cite a whole dataset</h2>
          {ORDER.map((key) => (
            <div key={key} className="space-y-3 rounded-md border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold text-foreground">{DATASETS[key].title}</h3>
                <DatasetDownloadButton dataset={key} />
              </div>
              <p className="text-foreground">{datasetCitation(key, { year, version, retrieved })}</p>
              <details>
                <summary className="cursor-pointer font-medium text-primary">BibTeX</summary>
                <pre className="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs text-foreground">{datasetBibtex(key, { year, version, retrievedIso: today?.iso ?? "[date]" })}</pre>
              </details>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Cite a single record</h2>
          <p>Each record in the <Link to="/rate-card" className="text-primary hover:underline">Fee Database</Link>, <Link to="/fees" className="text-primary hover:underline">Fee Change Feed</Link> and <Link to="/policy-changes" className="text-primary hover:underline">Policy Archive</Link> has a "Cite this record" link. It copies a citation with the record's permanent link and the date it was last checked against its source.</p>
          <p className="rounded-md border border-border p-4 text-foreground">{PUBLISHER}. ({year}). [Record title] [Data set record]. In {DATASETS.fee_database.title}. Last checked [date]. Retrieved {retrieved}, from {SITE_URL}/rate-card?record=[record ID]</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">CSV files</h2>
          <p>Each CSV contains the same fields as the public API, including source quotes in the evidence fields. Use of the data is covered by the CC BY 4.0 license below.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">License</h2>
          <p>Data license: the data is licensed under the <a href={DATA_LICENSE_URL} target="_blank" rel="noreferrer" className="text-primary hover:underline">{DATA_LICENSE_NAME}</a>. You may share and adapt it for any purpose, including commercially, if you give appropriate credit, link to the license, and indicate if changes were made.</p>
          <p>Quoted excerpts from marketplace documentation remain the property of their respective owners and are included for verification purposes only. Marketplace names are trademarks of their respective owners.</p>
          <p>See also the <Link to="/methodology" className="text-primary hover:underline">Methodology</Link>.</p>
        </section>
      </section>
    </div>
  );
}
