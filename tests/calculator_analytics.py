"""Browser regression checks; run with python3 tests/calculator_analytics.py."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        await context.route("**/*", lambda route: route.abort() if any(
            host in route.request.url for host in ["google-analytics.com", "analytics.google.com", "/g/collect", "/collect?"]
        ) else route.continue_())
        page = await context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        await page.goto("http://localhost:8080/calculator", wait_until="networkidle")
        initial = await page.evaluate("() => (window.dataLayer || []).map(x => Array.from(x)).filter(x => x[0] === 'event' && String(x[1]).startsWith('calculator_'))")
        assert initial == [], initial
        await page.evaluate("() => { window.auditEvents = []; window.gtag = (...args) => window.auditEvents.push(args); }")

        async def events():
            await page.wait_for_timeout(250)
            return await page.evaluate("() => window.auditEvents")

        async def select(index, label):
            await page.get_by_role("combobox").nth(index).click()
            await page.get_by_role("option", name=label, exact=True).click()

        await page.get_by_role("spinbutton").nth(0).fill("50")
        observed = await events()
        assert [event[1] for event in observed] == ["calculator_started", "calculator_result_viewed"], observed
        assert observed[0][2] is None
        assert observed[1][2] == {"marketplace": "amazon", "category": "home", "support_status": "modeled_with_exclusions"}
        # Original formula output for this price and otherwise default inputs.
        assert await page.get_by_text("$30.30", exact=True).count() == 1
        await page.get_by_role("spinbutton").nth(1).fill("9")
        assert len(await events()) == 2
        await select(0, "Walmart Marketplace")
        assert (await events())[-1][2]["support_status"] == "modeled_with_exclusions"
        await select(1, "Toys & Games")
        assert (await events())[-1][2] == {"marketplace": "walmart", "category": "toys", "support_status": "partially_supported"}
        await select(1, "Home & Kitchen")
        await select(0, "Amazon FBA")
        assert len(await events()) == 4
        await select(0, "Etsy")
        assert (await events())[-1][2]["support_status"] == "modeled_with_exclusions"
        await select(0, "Shopify")
        observed = await events()
        assert observed[-1][2]["support_status"] == "modeled_with_exclusions"
        assert sum(event[1] == "calculator_started" for event in observed) == 1
        for event in observed[1:]:
            assert event[1] == "calculator_result_viewed"
            assert sorted(event[2]) == ["category", "marketplace", "support_status"]
        assert errors == [], errors
        screenshots = Path("/tmp/browser/calculator-analytics")
        screenshots.mkdir(parents=True, exist_ok=True)
        await page.screenshot(path=str(screenshots / "verified.png"))
        print("PASS: initial silence, first interaction, pair deduplication, all marketplace statuses, payload privacy, unchanged Amazon output; no page errors.")
        print("Observed calculator event names:", [event[1] for event in observed])
        await browser.close()


asyncio.run(main())