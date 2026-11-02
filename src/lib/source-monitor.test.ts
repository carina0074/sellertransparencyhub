import { describe, expect, test } from "bun:test";
import {
  extractMainText, isDueForManualCheck, isWeeklyCheckDue, lineDiff, robotsAllows,
  sha256Hex, shouldRaiseFailureAlert, stripFragment,
} from "./source-monitor";

describe("source monitor rules", () => {
  test("robots.txt Disallow blocks and longer Allow wins", () => {
    const txt = "User-agent: *\nDisallow: /help/\nAllow: /help/selling/fees\n";
    expect(robotsAllows(txt, "https://x.com/help/other")).toBe(false);
    expect(robotsAllows(txt, "https://x.com/help/selling/fees?id=1")).toBe(true);
    expect(robotsAllows(txt, "https://x.com/pricing")).toBe(true);
  });

  test("robots.txt group naming our bot overrides *", () => {
    const txt = "User-agent: *\nAllow: /\n\nUser-agent: SellerTransparencyHub-SourceMonitor\nDisallow: /\n";
    expect(robotsAllows(txt, "https://x.com/pricing")).toBe(false);
  });

  test("text extraction drops scripts/nav and normalizes whitespace", () => {
    const html = "<html><body><nav>Menu</nav><script>x()</script><p>Fee  is\n 6.5%</p><p>A &amp; B</p></body></html>";
    expect(extractMainText(html)).toBe("Fee is 6.5%\nA & B");
  });

  test("hash is SHA-256 hex", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  test("line diff shows removed and added lines only", () => {
    expect(lineDiff("a\nfee 6.5%\nc", "a\nfee 7%\nc")).toBe("- fee 6.5%\n+ fee 7%");
  });

  test("failure alert only at the 2nd consecutive failure", () => {
    expect(shouldRaiseFailureAlert(1)).toBe(false);
    expect(shouldRaiseFailureAlert(2)).toBe(true);
    expect(shouldRaiseFailureAlert(3)).toBe(false);
  });

  test("manual source is due when last check is more than 30 days old or never", () => {
    const today = new Date("2026-11-01T12:00:00Z");
    expect(isDueForManualCheck(null, today)).toBe(true);
    expect(isDueForManualCheck("2026-10-02", today)).toBe(false);
    expect(isDueForManualCheck("2026-10-01", today)).toBe(true);
  });

  test("weekly source not rechecked within 6 days", () => {
    const now = new Date("2026-11-08T00:00:00Z");
    expect(isWeeklyCheckDue("2026-11-03T00:00:00Z", now)).toBe(false);
    expect(isWeeklyCheckDue("2026-11-02T00:00:00Z", now)).toBe(true);
  });

  test("fragment stripped for source matching", () => {
    expect(stripFragment("https://e.com/a#x")).toBe("https://e.com/a");
  });
});
