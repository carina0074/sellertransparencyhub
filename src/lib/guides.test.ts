import { expect, test } from "bun:test";
import { illustrativeInternationalFeeMinor } from "./guides";

test("illustrative $50 total sale at 1.65% rounds to $0.83", () => {
  expect(illustrativeInternationalFeeMinor(5000, 0.0165)).toBe(83);
});