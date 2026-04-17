import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Automated accessibility regression using axe-core (same engine as Lighthouse a11y audits).
 * This runs under Playwright’s bundled Chromium and avoids Lighthouse’s macOS Rosetta guard
 * when Node is x64 on an arm64 host.
 */
test("home dashboard has no serious or critical axe violations", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const blocking = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect.soft(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});
