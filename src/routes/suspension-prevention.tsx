import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldAlert, FileBadge2, Copyright, MessageSquareWarning, Truck, UserCheck, Download, ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/suspension-prevention")({
  head: () => ({
    meta: [
      { title: "Amazon Suspension Help & Seller Prevention Playbooks" },
      { name: "description", content: "Prevention playbooks, checklists, and templates for inauthentic claims, IP complaints, review manipulation, late shipments, and verification issues." },
      { property: "og:title", content: "Suspension Prevention Center" },
      { property: "og:description", content: "Playbooks, templates, and escalation guidance to keep your seller account safe." },
    ],
  }),
  component: SuspensionPage,
});

const categories = [
  {
    id: "inauthentic", icon: FileBadge2, title: "Inauthentic claims",
    risk: "Buyers or marketplaces challenge product authenticity, often after a single complaint.",
    checklist: [
      "Keep dated invoices from authorized distributors (last 365 days)",
      "Match invoice quantities to inbound shipments",
      "Maintain a supplier authorization letter for branded items",
      "Photograph batch numbers and serials before shipping",
    ],
    docs: ["Distributor invoices", "Authorization letter", "Inbound shipment IDs"],
    escalation: "If suspended, submit a Plan of Action within 72 hours referencing the specific ASIN, root cause, corrective actions, and preventive measures.",
  },
  {
    id: "ip", icon: Copyright, title: "Intellectual property complaints",
    risk: "Trademark, copyright, or patent infringement claims from rights owners can disable listings instantly.",
    checklist: [
      "Run a USPTO + EUIPO search before listing private-label",
      "Avoid using brand names in titles unless authorized",
      "Verify image licensing — no scraped or stock-violating photos",
      "Keep a rights-owner contact log to resolve disputes quickly",
    ],
    docs: ["Brand authorization", "Image license receipts", "Rights-owner correspondence"],
    escalation: "Contact the rights owner directly to request retraction. Most marketplaces accept retractions submitted by the complainant.",
  },
  {
    id: "reviews", icon: MessageSquareWarning, title: "Review manipulation",
    risk: "Even unsolicited fake reviews from third parties can trigger enforcement against your account.",
    checklist: [
      "Never offer discounts in exchange for reviews",
      "Monitor for review bombing on competitor listings",
      "Report suspicious 5-star spikes proactively",
      "Keep all post-purchase communication marketplace-compliant",
    ],
    docs: ["Email template archive", "Listing change log"],
    escalation: "Submit a Plan of Action documenting your review policy, all marketing channels, and the staff with listing access.",
  },
  {
    id: "late", icon: Truck, title: "Late shipment violations",
    risk: "Late shipment rate above 4% on Amazon — or comparable thresholds elsewhere — triggers performance review.",
    checklist: [
      "Set carrier pickup before published cut-off",
      "Confirm shipments inside marketplace SLA (not after)",
      "Use buy shipping services to inherit on-time protection",
      "Audit handling-time settings monthly",
    ],
    docs: ["Carrier scan reports", "Order export with timestamps"],
    escalation: "Provide a remediation plan with carrier change, staffing fix, and a 30-day on-time forecast.",
  },
  {
    id: "verification", icon: UserCheck, title: "Account verification issues",
    risk: "Address, identity, or bank verification failures freeze disbursements and pause selling privileges.",
    checklist: [
      "Keep business documents under the same legal name everywhere",
      "Submit utility bills less than 90 days old",
      "Match bank account country with the marketplace region",
      "Update beneficial-owner records after any equity change",
    ],
    docs: ["Articles of incorporation", "Utility bill", "Bank statement", "Government ID"],
    escalation: "Open a verification case with all documents in a single PDF; partial submissions reset the queue.",
  },
] as const;

function SuspensionPage() {
  const [active, setActive] = useState<string>(categories[0].id);
  const cat = categories.find((c) => c.id === active)!;
  const Icon = cat.icon;

  return (
    <>
      <PageHeader
        eyebrow="Resource hub"
        title="Suspension Prevention Center"
        description="Risk explanations, prevention checklists, recommended documentation, and escalation guidance — written from real seller appeals."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <nav aria-label="Risk categories" className="space-y-1">
            {categories.map((c) => {
              const isActive = c.id === active;
              const CIcon = c.icon;
              return (
                <button key={c.id} onClick={() => setActive(c.id)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? "border-primary bg-primary-soft text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                  <span className="flex items-center gap-2">
                    <CIcon className="h-4 w-4" />
                    {c.title}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </button>
              );
            })}
          </nav>

          <div className="space-y-6">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{cat.title}</h2>
                    <p className="text-sm text-muted-foreground">{cat.risk}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-foreground">Prevention checklist</h3>
                  <ul className="mt-3 space-y-2">
                    {cat.checklist.map((i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {i}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-foreground">Recommended documentation</h3>
                  <ul className="mt-3 space-y-2">
                    {cat.docs.map((d) => (
                      <li key={d} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                        <span className="text-foreground">{d}</span>
                        <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs">
                          <Download className="h-3.5 w-3.5" /> Template
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldAlert className="h-4 w-4 text-primary" /> Escalation guidance
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{cat.escalation}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}