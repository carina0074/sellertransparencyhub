import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/health-check")({
  head: () => ({
    meta: [
      { title: "Seller Account Health Checker — Suspension Risk Assessment" },
      { name: "description", content: "Score your seller account on a 0-100 scale. Get an Amazon, Walmart, and Shopify suspension risk assessment with actionable recommendations." },
      { property: "og:title", content: "Account Health Checker" },
      { property: "og:description", content: "Suspension risk scoring and recommendations for marketplace sellers." },
    ],
  }),
  component: HealthCheckPage,
});

type Inputs = {
  odr: number; lateShip: number; cancellation: number;
  complaints: number; ipi: number; returnRate: number;
};

function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

function scoreFromInputs(i: Inputs) {
  const odrScore = clamp(100 - i.odr * 100, 0, 100);
  const lateScore = clamp(100 - i.lateShip * 25, 0, 100);
  const cancelScore = clamp(100 - i.cancellation * 40, 0, 100);
  const complaintsScore = clamp(100 - i.complaints * 2, 0, 100);
  const ipiScore = clamp((i.ipi / 800) * 100, 0, 100);
  const returnScore = clamp(100 - (i.returnRate - 0.05) * 200, 0, 100);
  const score =
    odrScore * 0.25 + lateScore * 0.2 + cancelScore * 0.15 +
    complaintsScore * 0.1 + ipiScore * 0.15 + returnScore * 0.15;
  let level: "healthy" | "attention" | "high" = "healthy";
  if (score < 55) level = "high";
  else if (score < 78) level = "attention";
  const recs: { title: string; desc: string }[] = [];
  if (odrScore < 70) recs.push({ title: "Drive Order Defect Rate below 1%", desc: "Audit recent A-to-z claims and negative reviews. Tighten QC on the top 3 SKUs producing defects." });
  if (lateScore < 70) recs.push({ title: "Improve shipping consistency", desc: "Switch your top SKUs to a same-day cut-off carrier pickup. Late shipment rate is a leading suspension driver." });
  if (cancelScore < 70) recs.push({ title: "Reduce seller-initiated cancellations", desc: "Sync inventory hourly. Most cancellations come from overselling stale stock." });
  if (ipiScore < 60) recs.push({ title: "Raise IPI above 500", desc: "Remove aged inventory, fix stranded listings, and improve sell-through on slow SKUs." });
  if (returnScore < 70) recs.push({ title: "Address return root causes", desc: "Tag returns by reason. Updating listing accuracy alone often reduces returns 15-25%." });
  if (recs.length === 0) recs.push({ title: "Maintain your edge", desc: "Set a weekly review of ODR, late shipment, and IPI. Document SOPs so health stays consistent at scale." });
  return { score: Math.round(score), level, recs };
}

function HealthCheckPage() {
  const [inputs, setInputs] = useState<Inputs>({
    odr: 0.6, lateShip: 3.2, cancellation: 1.8, complaints: 4, ipi: 540, returnRate: 0.08,
  });
  const { score, level, recs } = useMemo(() => scoreFromInputs(inputs), [inputs]);
  const set = <K extends keyof Inputs>(k: K, v: number) =>
    setInputs((s) => ({ ...s, [k]: v }));

  const levelStyles = {
    healthy: { label: "Healthy", color: "var(--color-success)", desc: "Low suspension risk. Keep current operations and monitor weekly." },
    attention: { label: "Needs attention", color: "var(--color-warning)", desc: "Moderate suspension risk. Address the items below within 30 days." },
    high: { label: "High risk", color: "var(--color-destructive)", desc: "High suspension risk. Triage the top recommendations this week." },
  }[level];

  return (
    <>
      <PageHeader
        eyebrow="Tool"
        title="Account Health Checker"
        description="Score your seller account on a 0-100 scale using the same metrics marketplaces watch. Built on Amazon, Walmart, and Shopify policy."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <Card className="border-border">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Activity className="h-4 w-4 text-primary" /> Performance metrics
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Num label="Order Defect Rate (%)" v={inputs.odr} step={0.1} onChange={(v) => set("odr", v)} />
                <Num label="Late Shipment Rate (%)" v={inputs.lateShip} step={0.1} onChange={(v) => set("lateShip", v)} />
                <Num label="Cancellation Rate (%)" v={inputs.cancellation} step={0.1} onChange={(v) => set("cancellation", v)} />
                <Num label="Customer Complaints (90d)" v={inputs.complaints} step={1} onChange={(v) => set("complaints", v)} />
                <Num label="Inventory Performance Index" v={inputs.ipi} step={10} onChange={(v) => set("ipi", v)} />
                <Num label="Return Rate (e.g. 0.08)" v={inputs.returnRate} step={0.01} onChange={(v) => set("returnRate", v)} />
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-4">
                <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
                <ul className="mt-3 space-y-3">
                  {recs.map((r) => (
                    <li key={r.title} className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.title}</p>
                        <p className="text-sm text-muted-foreground">{r.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" /> Seller health score
              </div>
              <div className="relative mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270}
                    data={[{ name: "score", value: score, fill: levelStyles.color }]}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={12} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-semibold tracking-tight text-foreground">{score}</div>
                  <div className="text-xs text-muted-foreground">out of 100</div>
                </div>
              </div>
              <div className="mt-2 rounded-md p-3 text-center text-sm font-medium"
                style={{ background: `color-mix(in oklab, ${levelStyles.color} 14%, transparent)`, color: levelStyles.color }}>
                {levelStyles.label}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{levelStyles.desc}</p>
              <div className="mt-6 space-y-3">
                <MeterRow label="Order Defect Rate" max={2} value={inputs.odr} suffix="%" reverse />
                <MeterRow label="Late Shipment Rate" max={10} value={inputs.lateShip} suffix="%" reverse />
                <MeterRow label="IPI" max={800} value={inputs.ipi} />
              </div>
              <div className="mt-5 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning-foreground">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Sample data shown. Final risk assessment depends on your category, tenure, and marketplace.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

function Num({ label, v, onChange, step = 1 }: { label: string; v: number; onChange: (n: number) => void; step?: number }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input type="number" value={v} step={step}
        onChange={(e) => onChange(+e.target.value || 0)} />
    </div>
  );
}

function MeterRow({ label, max, value, suffix, reverse }: { label: string; max: number; value: number; suffix?: string; reverse?: boolean }) {
  const pct = Math.min(100, (value / max) * 100);
  const good = reverse ? pct < 40 : pct > 60;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}{suffix ?? ""}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: good ? "var(--color-success)" : pct > 75 ? "var(--color-destructive)" : "var(--color-warning)",
          }} />
      </div>
    </div>
  );
}