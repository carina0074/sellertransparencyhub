import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import reportMd from "@/content/q3-2026-report.md?raw";

export const Route = createFileRoute("/reports/q3-2026")({
  head: () => ({
    meta: [
      { title: "Q3 2026 Marketplace Fee Transparency Report | Seller Transparency Hub" },
      { name: "description", content: "Q3 2026 (July–September) analysis of marketplace fees and seller policies across Amazon, Walmart, eBay, and Etsy." },
      { property: "og:title", content: "Q3 2026 Marketplace Fee Transparency Report" },
      { property: "og:description", content: "Quarterly tracking of fee and policy changes across Amazon, Walmart, eBay, and Etsy for July–September 2026." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Q3Report,
});

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i} className="text-foreground">{p.slice(2, -2)}</strong> : p,
  );
}

function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || line === "---") { i++; continue; }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      out.push(
        <div key={k++} className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>{head.map((c, j) => <th key={j} className="px-4 py-2 text-left font-semibold text-foreground">{c}</th>)}</tr></thead>
            <tbody>{body.map((r, ri) => <tr key={ri} className="border-t border-border">{r.map((c, j) => <td key={j} className="px-4 py-2 text-muted-foreground">{inline(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) { items.push(lines[i].trim().slice(2)); i++; }
      out.push(<ul key={k++} className="list-disc space-y-1 pl-6 text-muted-foreground">{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ul>);
      continue;
    }
    if (line.startsWith("### ")) out.push(<h3 key={k++} className="pt-2 text-lg font-semibold text-foreground">{inline(line.slice(4))}</h3>);
    else if (line.startsWith("## ")) out.push(<h3 key={k++} className="pt-2 text-xl font-semibold text-foreground">{inline(line.slice(3))}</h3>);
    else if (line.startsWith("# ")) out.push(<h2 key={k++} className="border-t border-border pt-8 text-2xl font-semibold tracking-tight text-foreground">{inline(line.slice(2))}</h2>);
    else out.push(<p key={k++} className="leading-relaxed text-muted-foreground">{inline(line)}</p>);
    i++;
  }
  return out;
}

// Drop the title/period/brand lines already shown in the page header.
const body = reportMd.split("\n").slice(7).join("\n");

function Q3Report() {
  return (
    <>
      <PageHeader eyebrow="Q3 2026 Report" title="Marketplace Fee Transparency Report" description="Seller Transparency Hub — Amazon, Walmart Marketplace, eBay, and Etsy" />
      <article className="mx-auto max-w-3xl space-y-5 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" /> Reporting Period: July 1 – September 30, 2026
        </div>
        {renderMarkdown(body)}
        <div className="flex flex-wrap gap-4 border-t border-border pt-8">
          <Button asChild variant="ghost">
            <Link to="/reports/q2-2026"><ArrowLeft className="mr-2 h-4 w-4" />Previous: Q2 2026</Link>
          </Button>
          <Button asChild variant="outline"><Link to="/reports/annual-2026">Annual Review 2026 →</Link></Button>
        </div>
      </article>
    </>
  );
}
