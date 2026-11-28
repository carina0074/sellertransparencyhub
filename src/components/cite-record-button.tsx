import { useState } from "react";
import { Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { citationYear, longDate, recordCitation, type DatasetKey } from "@/lib/citation";
import { latestDataChangeQuery } from "@/lib/dataset-version";

export function CiteRecordButton({ dataset, id, title, lastChecked }: { dataset: DatasetKey; id: string; title: string; lastChecked: string | null }) {
  const [copied, setCopied] = useState(false);
  const { data: latest } = useQuery(latestDataChangeQuery);
  const copy = async () => {
    const text = recordCitation(dataset, { id, title, year: citationYear(latest ?? null), lastChecked, retrieved: longDate(new Date().toISOString()) });
    try { await navigator.clipboard.writeText(text); } catch { window.prompt("Copy this citation:", text); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" onClick={copy} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline" aria-live="polite">
      <Quote className="h-3 w-3" aria-hidden />{copied ? "Citation copied" : "Cite this record"}
    </button>
  );
}
