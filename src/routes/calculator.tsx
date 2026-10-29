import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid,
  PieChart, Pie,
} from "recharts";
import { Calculator, TrendingUp, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  calculateFees, MARKETPLACES, CATEGORIES, SIZE_TIERS, fmtUSD, fmtPct,
  type FeeInputs, type Marketplace, type SizeTier,
} from "@/lib/marketplace-fees";
import { FeedbackPrompt } from "@/components/feedback-prompt";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Amazon FBA Fee Calculator & Seller Profit Calculator" },
      { name: "description", content: "Model selected U.S. marketplace selling costs with current referral tiers, while unsupported fulfillment, storage and other charges are explicitly excluded." },
      { property: "og:title", content: "Marketplace Profit Calculator" },
      { property: "og:description", content: "Selected marketplace selling-cost estimates with pricing tiers and explicit excluded-cost limitations, not an all-in profitability assessment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const [inputs, setInputs] = useState<FeeInputs>({
    price: 29.99, cost: 8.5, shipping: 2.5,
    marketplace: "amazon", category: "home",
    weightLb: 1.2, sizeTier: "small_standard", storageMonths: 2,
  });

  const result = useMemo(() => calculateFees(inputs), [inputs]);

  const startedRef = useRef(false);
  const completedRef = useRef(new Set<string>());
  const unsupportedRef = useRef(new Set<string>());

  useEffect(() => {
    if (!startedRef.current) return;
    const key = `${inputs.marketplace}|${inputs.category}`;
    if (!completedRef.current.has(key)) {
      completedRef.current.add(key);
      trackEvent("calculator_completed", { marketplace: inputs.marketplace, category: inputs.category });
    }
    if (result.unsupported.length > 0 && !unsupportedRef.current.has(key)) {
      unsupportedRef.current.add(key);
      trackEvent("calculator_unsupported_combination", { marketplace: inputs.marketplace, category: inputs.category });
    }
  }, [inputs.marketplace, inputs.category, result.unsupported]);

  const feeData = [
    { name: "Referral", value: result.referralFee },
    ...(result.closingFee > 0 ? [{ name: "Books closing fee", value: result.closingFee }] : []),
    { name: "Fulfillment", value: result.fulfillmentFee },
    { name: "Storage", value: result.storageFee },
    { name: "Returns", value: result.returnCost },
  ];

  const profitData = [
    { name: "Cost", value: inputs.cost },
    { name: "Shipping", value: inputs.marketplace === "shopify" || inputs.marketplace === "etsy" ? 0 : inputs.shipping },
    { name: "Total fees", value: result.totalFees },
    { name: "Net profit", value: Math.max(0, result.netProfit) },
  ];

  const PIE_COLORS = ["#2563eb", "#60a5fa", "#94a3b8", "#cbd5e1", "#64748b"];

  const [hasCalculated, setHasCalculated] = useState(false);

  const set = <K extends keyof FeeInputs>(k: K, v: FeeInputs[K]) => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("calculator_started");
      setHasCalculated(true);
    }
    setInputs((s) => ({ ...s, [k]: v }));
  };

  return (
    <>
      <PageHeader
        eyebrow="Tool"
        title="Marketplace Profit Calculator"
        description="Model selected selling costs for Amazon, Walmart, Shopify, and Etsy, with unsupported fulfillment, storage and other charges explicitly excluded."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <Card className="border-border">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Calculator className="h-4 w-4 text-primary" /> Product inputs
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Product price ($)">
                  <Input type="number" min={0} step="0.01" value={inputs.price}
                    onChange={(e) => set("price", +e.target.value || 0)} />
                </Field>
                <Field label="Product cost ($)">
                  <Input type="number" min={0} step="0.01" value={inputs.cost}
                    onChange={(e) => set("cost", +e.target.value || 0)} />
                </Field>
                <Field label="Shipping cost ($)">
                  <Input type="number" min={0} step="0.01" value={inputs.shipping}
                    onChange={(e) => set("shipping", +e.target.value || 0)} />
                </Field>
                <Field label="Weight (lb)">
                  <Input type="number" min={0} step="0.1" value={inputs.weightLb}
                    onChange={(e) => set("weightLb", +e.target.value || 0)} />
                </Field>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">Percentages apply to entered item price only. Buyer-paid shipping, gift wrapping and applicable tax-inclusive processing bases are not separately modeled; shipping cost is a seller expense.</p>
              <Field label="Marketplace">
                <Select value={inputs.marketplace}
                  onValueChange={(v) => set("marketplace", v as Marketplace)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MARKETPLACES.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Product category">
                <Select value={inputs.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Size tier">
                  <Select value={inputs.sizeTier}
                    onValueChange={(v) => set("sizeTier", v as SizeTier)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SIZE_TIERS.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Storage (months)">
                  <Input type="number" min={0} step="1" value={inputs.storageMonths}
                    onChange={(e) => set("storageMonths", +e.target.value || 0)} />
                </Field>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label={result.unsupported.length ? "Modeled surplus before excluded costs" : "Net profit"} value={fmtUSD(result.netProfit)} accent="primary" />
              <Stat label={result.unsupported.length ? "Modeled margin before excluded costs" : "Profit margin"} value={fmtPct(result.margin)} />
              <Stat label={result.unsupported.length ? "Included modeled costs" : "Total fees"} value={fmtUSD(result.totalFees)} />
            </div>

            {result.unsupported.length > 0 ? <p className="border-l-2 border-warning bg-warning/15 p-4 text-sm font-medium text-warning-foreground">Profitability cannot be assessed: material costs are excluded.</p> : <RecommendationBanner level={result.recommendation} margin={result.margin} />}

            {hasCalculated && (
              <FeedbackPrompt
                question="Was this estimate useful?"
                resourceType="calculator_estimate"
                resourcePath="/calculator"
              />
            )}

            {result.unsupported.length > 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/15 p-4 text-warning-foreground">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Not estimated</p>
                  <ul className="mt-1 list-inside list-disc text-sm opacity-90">
                    {result.unsupported.map((u) => (
                      <li key={u}>{u}</li>
                    ))}
                  </ul>
                  <p className="mt-1 text-sm opacity-90">
                    These are excluded from the totals above rather than estimated from another marketplace.
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-foreground">Fee breakdown</h3>
                  <div className="mt-4 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={feeData} dataKey="value" nameKey="name"
                          innerRadius={50} outerRadius={90} paddingAngle={2}>
                          {feeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmtUSD(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm">
                    {feeData.map((d, i) => (
                      <li key={d.name} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PIE_COLORS[i] }} />
                          {d.name}
                        </span>
                        <span className="font-medium text-foreground">{fmtUSD(d.value)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-foreground">Where your revenue goes</h3>
                  <div className="mt-4 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={profitData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false}
                          tickFormatter={(v) => `$${v}`} />
                        <Tooltip formatter={(v: number) => fmtUSD(v)} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {profitData.map((d, i) => (
                            <Cell key={i} fill={d.name === "Net profit" ? "#16a34a" : "#2563eb"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Card className="mt-8 border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Info className="h-4 w-4 text-primary" /> Assumptions &amp; limitations
            </div>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
              <li>Estimates depend on the selected marketplace and category and on the verified fee rules available for that combination.</li>
              <li>Amazon Apparel, Beauty and Grocery and Walmart Apparel use whole-price tiers. Consumer Electronics is 8%; Amazon Electronics Accessories uses 15% on the first $100 and 8% on the excess. Amazon applies a $0.30 referral minimum where applicable; Books and Grocery have no such minimum. Selling price is used as the referral-fee basis here; buyer-paid shipping, gift wrapping and applicable taxes are not entered separately.</li>
              <li>Shopify results use the <strong className="text-foreground">U.S. Basic Shopify Payments standard online card rate (2.9% + $0.30)</strong>. Premium cards, international uplifts and third-party provider fees are not modeled. Subscription-plan costs are <strong className="text-foreground">not included</strong>.</li>
              <li>Etsy results use the <strong className="text-foreground">US payment-processing rate (3% + $0.25)</strong>; rates vary by country. Etsy Offsite Ads fees (12% or 15%, conditional) are <strong className="text-foreground">not included</strong>. The $0.20 listing fee is charged per sale here, though it actually covers a 4-month listing period.</li>
              <li>Amazon Books includes the separate $1.80 closing fee per item sold; it is not merged into the referral percentage.</li>
              <li>Amazon FBA fulfillment and storage are <strong className="text-foreground">not estimated</strong>: the current schedules need dimensions, shipping weight, price/program eligibility, season, inventory age and surcharge information that these inputs cannot establish.</li>
              <li>Walmart referral estimates cover Consumer Electronics, Home &amp; Kitchen (excluding Furniture) and Apparel tiers. WFS fulfillment and storage are <strong className="text-foreground">not estimated</strong>: calculated shipping weight includes packaging and may use dimensional weight, and eligibility, surcharges and storage season/age cannot be established here.</li>
              <li><strong className="text-foreground">eBay is not currently supported</strong> by this calculator. See the <Link to="/rate-card" className="text-primary underline underline-offset-2">Marketplace Fee Database</Link> for verified eBay fees.</li>
              <li>Return-cost figures are rough modeling assumptions, not verified marketplace fee data. Components marked “Not estimated” are excluded, so displayed totals and profit are incomplete rather than all-in costs.</li>
              <li>Results are estimates. Always confirm current applicable fees in the official marketplace sources linked in the <Link to="/rate-card" className="text-primary underline underline-offset-2">Fee Database</Link>.</li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Current-fee reconciliation reviewed October 29, 2026. Per-fee current-value reviews and effective-date evidence are shown separately in the Fee Database.
            </p>
          </CardContent>
        </Card>

        <FeedbackPrompt resourceType="calculator" resourcePath="/calculator" />
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "primary" }) {
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`mt-1 text-2xl font-semibold tracking-tight ${accent === "primary" ? "text-primary" : "text-foreground"}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationBanner({
  level, margin,
}: { level: "healthy" | "moderate" | "warning"; margin: number }) {
  const conf = {
    healthy: {
      icon: CheckCircle2,
      title: "Healthy margin",
      desc: `At ${fmtPct(margin)} net margin, this SKU has room to absorb returns, advertising, and seasonal fee shifts.`,
      cls: "border-success/30 bg-success/10 text-success",
    },
    moderate: {
      icon: TrendingUp,
      title: "Moderate risk",
      desc: `At ${fmtPct(margin)}, watch ad spend and return rate. A 2-3% fee change could push this product unprofitable.`,
      cls: "border-warning/40 bg-warning/15 text-warning-foreground",
    },
    warning: {
      icon: AlertTriangle,
      title: "Low margin warning",
      desc: `At ${fmtPct(margin)}, this listing is at high risk of losing money once advertising, refunds, and storage overages are included.`,
      cls: "border-destructive/30 bg-destructive/10 text-destructive",
    },
  }[level];
  const Icon = conf.icon;
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${conf.cls}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">{conf.title}</p>
        <p className="mt-1 text-sm opacity-90">{conf.desc}</p>
      </div>
    </div>
  );
}