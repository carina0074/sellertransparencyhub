import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import reportAsset from "@/assets/Marketplace-Fee-Transparency-Report-Q2-2026.pdf.asset.json";

export const Route = createFileRoute("/downloads/q2-2026-report")({
  head: () => ({
    meta: [
      { title: "Download — Q2 2026 Marketplace Fee Transparency Report" },
      { name: "description", content: "Download the Q2 2026 Marketplace Fee Transparency Report PDF." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DownloadRedirect,
});

function DownloadRedirect() {
  useEffect(() => {
    window.location.replace(reportAsset.url);
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-xl font-semibold text-foreground">Starting your download…</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        If nothing happens,{" "}
        <a href={reportAsset.url} className="text-primary hover:underline" download>
          click here to download the PDF
        </a>
        .
      </p>
    </div>
  );
}