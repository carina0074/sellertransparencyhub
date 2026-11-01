import { shareImageMeta } from "@/lib/share-metadata";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import reportAsset from "@/assets/Marketplace-Fee-Transparency-Report-Q2-2026.pdf.asset.json";

export const Route = createFileRoute("/downloads/q2-2026-report")({
  head: () => ({
    meta: [
      ...shareImageMeta,
      { title: "Download — Q2 2026 Marketplace Fee Transparency Report" },
      { name: "description", content: "Download the Q2 2026 Marketplace Fee Transparency Report PDF." },
      { property: "og:title", content: "Download — Q2 2026 Marketplace Fee Transparency Report" },
      { property: "og:description", content: "Download the Q2 2026 Marketplace Fee Transparency Report PDF." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-xl font-semibold text-foreground">Download — Q2 2026 Marketplace Fee Transparency Report</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This PDF is the original June 2026 publication, preserved unchanged. Some statements in it were later corrected or qualified. See the review notes on the report page.
      </p>
      <div className="mt-6 flex flex-col items-center gap-4">
        <Button asChild>
          <a href={reportAsset.url} download>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </a>
        </Button>
        <Link to="/reports/q2-2026" className="text-sm text-primary hover:underline">See the review notes on the report page.</Link>
      </div>
    </div>
  );
}