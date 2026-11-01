import { shareImageMeta } from "@/lib/share-metadata";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scoreFromInputs, type HealthInputs as Inputs } from "@/lib/health-score";

export const Route = createFileRoute("/health-check")({
  head: () => ({
    meta: [
      ...shareImageMeta,
      { title: "Account Health Checker — Educational Self-Assessment" },
      { name: "description", content: "An educational self-assessment that gives a rough heuristic score from common seller performance metrics. Not an official marketplace score." },
      { property: "og:title", content: "Account Health Checker" },
      { property: "og:description", content: "Educational heuristic self-assessment for marketplace sellers. Not an official marketplace score." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HealthCheckPage,
});

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
        description="An educational self-assessment that gives a rough 0-100 heuristic score from common seller performance metrics. It is not an official marketplace score, not marketplace policy, and not a guarantee or prediction of account standing or enforcement."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <Card className="border-border">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Activity className="h-4 w-4 text-primary" /> Performance metrics
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Num target="Amazon: under 1% (60-day window)" label="Order Defect Rate (%)" v={inputs.odr} step={0.1} onChange={(v) => set("odr", v)} />
                <Num target="Amazon: under 4% (10- and 30-day windows; seller-fulfilled)" label="Late Shipment Rate (%)" v={inputs.lateShip} step={0.1} onChange={(v) => set("lateShip", v)} />
                <Num target="Amazon: under 2.5% (7-day window; seller-fulfilled)" label="Cancellation Rate (%)" v={inputs.cancellation} step={0.1} onChange={(v) => set("cancellation", v)} />
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
                Sample data shown. This educational score uses only the six metrics above. It does not account for product category, account tenure or marketplace, and it is not an official marketplace score.
              </div>
            </CardContent>
          </Card>
        </div>
        <details className="mt-8 space-y-4 border-t border-border pt-6 text-sm text-muted-foreground">
          <summary className="cursor-pointer font-semibold text-primary">How this score works</summary>
          <p className="mt-4">This is the site’s educational formula, not a marketplace formula. ODR, late shipment and cancellation use the entered percentage number (0.6 means 0.6%). Return rate uses a fraction (0.08 means 8%).</p>
          <ul className="mt-3 list-inside list-disc space-y-2">
            <li>Order defects: 100 minus ODR × 100; weight 25%.</li>
            <li>Late shipments: 100 minus late shipment rate × 25; weight 20%.</li>
            <li>Cancellations: 100 minus cancellation rate × 40; weight 15%.</li>
            <li>Complaints: 100 minus complaint count × 2; weight 10%.</li>
            <li>Inventory performance: IPI divided by 800, multiplied by 100; weight 15%.</li>
            <li>Returns: 100 minus (return-rate fraction minus 0.05) × 200; weight 15%.</li>
          </ul>
          <p className="mt-3">Each component is limited to 0–100, then multiplied by its weight and added. The displayed total is rounded. Before rounding, below 55 is “High risk”; 55 to below 78 is “Needs attention”; 78 or above is “Healthy”. These are site-defined labels, not official risk thresholds or predictions.</p>
          <p className="mt-3">Recommendation triggers are separate: late-shipment component below 70, cancellation component below 70, IPI component below 60 and return component below 70. ODR advice to get below 1% appears only at 1% or above. The bar colors use separate display rules, not official targets.</p>
        </details>
      </section>
    </>
  );
}

function Num({ label, v, onChange, step = 1, target }: { label: string; v: number; onChange: (n: number) => void; step?: number; target?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input type="number" value={v} step={step}
        onChange={(e) => onChange(+e.target.value || 0)} />
      {target ? <a href="https://sellercentral.amazon.com/seller-forums/discussions/t/8a41416f-e1ad-4221-9675-7145d5cc5e28" target="_blank" rel="noreferrer" className="block text-xs text-primary hover:underline">{target}</a> : <p className="text-xs text-muted-foreground">No official target published for this exact metric in the reviewed sources.</p>}
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