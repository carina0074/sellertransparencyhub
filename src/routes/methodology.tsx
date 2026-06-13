import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Database, ClipboardList, FileText, Archive } from "lucide-react";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — Seller Transparency Hub" },
      { name: "description", content: "How marketplace fee data is sourced, verified, and categorized across major e-commerce platforms." },
      { property: "og:title", content: "Methodology — Seller Transparency Hub" },
      { property: "og:description", content: "Documented sourcing and verification methodology behind every published fee record." },
    ],
  }),
  component: MethodologyPage,
});

const sources = [
  { icon: ClipboardList, label: "Public marketplace fee schedules" },
  { icon: FileText, label: "Platform policy announcements" },
  { icon: Archive, label: "Historical fee records" },
  { icon: Database, label: "Seller Transparency Hub database" },
];

function MethodologyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Research methodology"
        title="Methodology"
        description="How fee data is sourced, verified, and categorized across major e-commerce marketplaces."
      />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Data was collected from:</h2>
            <ul className="space-y-3">
              {sources.map((s) => (
                <li key={s.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-4 w-4" />
                  </span>
                  {s.label}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <h2 className="text-base font-semibold text-foreground">Scope</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The report focuses on publicly available fee and policy information across major e-commerce marketplaces, including Amazon, Walmart Marketplace, and eBay. All data is sourced from official marketplace documentation and public policy announcements.
            </p>
          </CardContent>
        </Card>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          Methodology last reviewed June 2026. Corrections welcome — every record links back to its original public source.
        </p>
      </section>
    </>
  );
}
