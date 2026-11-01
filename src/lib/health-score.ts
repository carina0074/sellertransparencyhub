export type HealthInputs = {
  odr: number; lateShip: number; cancellation: number;
  complaints: number; ipi: number; returnRate: number;
};
function clamp(n: number) { return Math.max(0, Math.min(100, n)); }
export function scoreFromInputs(i: HealthInputs) {
  const odrScore = clamp(100 - i.odr * 100);
  const lateScore = clamp(100 - i.lateShip * 25);
  const cancelScore = clamp(100 - i.cancellation * 40);
  const complaintsScore = clamp(100 - i.complaints * 2);
  const ipiScore = clamp((i.ipi / 800) * 100);
  const returnScore = clamp(100 - (i.returnRate - 0.05) * 200);
  const score = odrScore * 0.25 + lateScore * 0.2 + cancelScore * 0.15 + complaintsScore * 0.1 + ipiScore * 0.15 + returnScore * 0.15;
  const level: "high" | "attention" | "healthy" = score < 55 ? "high" : score < 78 ? "attention" : "healthy";
  const recs: { title: string; desc: string }[] = [];
  if (i.odr >= 1) recs.push({ title: "Drive Order Defect Rate below 1%", desc: "Audit recent A-to-z claims and negative reviews. Tighten QC on the top 3 SKUs producing defects." });
  if (lateScore < 70) recs.push({ title: "Improve shipping consistency", desc: "Switch your top SKUs to a same-day cut-off carrier pickup. Late shipment rate is a leading suspension driver." });
  if (cancelScore < 70) recs.push({ title: "Reduce seller-initiated cancellations", desc: "Sync inventory hourly. Most cancellations come from overselling stale stock." });
  if (ipiScore < 60) recs.push({ title: "Raise IPI above 500", desc: "Remove aged inventory, fix stranded listings, and improve sell-through on slow SKUs." });
  if (returnScore < 70) recs.push({ title: "Address return root causes", desc: "Tag returns by reason. Updating listing accuracy alone often reduces returns 15-25%." });
  if (recs.length === 0) recs.push({ title: "Maintain your edge", desc: "Set a weekly review of ODR, late shipment, and IPI. Document SOPs so health stays consistent at scale." });
  return { score: Math.round(score), level, recs };
}