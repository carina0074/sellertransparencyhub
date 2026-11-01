import { expect, test } from "bun:test";
import { scoreFromInputs, type HealthInputs } from "./health-score";
const sample: HealthInputs = { odr: 0.6, lateShip: 3.2, cancellation: 1.8, complaints: 4, ipi: 540, returnRate: 0.08 };
test("sample ODR 0.6% does not recommend reducing it below 1%", () => {
  expect(scoreFromInputs(sample).recs.some(r => r.title.includes("Order Defect"))).toBe(false);
  expect(scoreFromInputs({ ...sample, odr: 1 }).recs.some(r => r.title.includes("Order Defect"))).toBe(true);
});
test("existing six-component weighting produces sample score 52, high level", () => {
  expect(scoreFromInputs(sample).score).toBe(52);
  expect(scoreFromInputs(sample).level).toBe("high");
});
test("risk levels use unrounded raw thresholds 55 and 78", () => {
  const i: HealthInputs = { odr: 0, lateShip: 0, cancellation: 0, complaints: 0, ipi: 800, returnRate: 0.05 };
  expect(scoreFromInputs(i).level).toBe("healthy");
  expect(scoreFromInputs({ ...i, odr: 1, lateShip: 2 }).level).toBe("attention");
  expect(scoreFromInputs({ ...i, odr: 1, lateShip: 4, cancellation: 1 }).level).toBe("high");
});