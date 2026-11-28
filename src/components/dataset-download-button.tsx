import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_COLUMNS, DATASETS, toCsv, type DatasetKey } from "@/lib/citation";
import { trackEvent } from "@/lib/analytics";

export function DatasetDownloadButton({ dataset, label = "Download CSV" }: { dataset: DatasetKey; label?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const download = async () => {
    setState("loading");
    try {
      const res = await fetch(DATASETS[dataset].api);
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { data: Record<string, unknown>[] };
      const blob = new Blob([toCsv(API_COLUMNS[dataset], json.data)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${DATASETS[dataset].file}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      trackEvent("dataset_downloaded", { dataset });
      setState("idle");
    } catch {
      setState("error");
    }
  };
  return (
    <span className="inline-flex items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={download} disabled={state === "loading"}>
        <Download className="h-4 w-4" aria-hidden />{state === "loading" ? "Preparing…" : label}
      </Button>
      {state === "error" && <span className="text-xs text-destructive">Download failed. Try again.</span>}
    </span>
  );
}
