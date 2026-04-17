import { expect, test } from "@playwright/test";

test("anomaly alert surfaces when narrowing to recent window", async ({ page }) => {
  // Alerts are computed on the most recent 48h slice, but require a minimum volume.
  // Use the default 14d window so the recent slice has enough transactions.
  await page.goto("/?range=14d");

  // The mock generator encodes a 48h anomaly window for Processor B.
  // We don't hardcode the exact copy beyond the processor name so the UI can evolve.
  const smartAlerts = page.locator("section").filter({ hasText: "Smart Alerts" });
  await expect(smartAlerts).toBeVisible();
  await expect(smartAlerts.getByText(/Approval rate dropped/i)).toBeVisible();
  await expect(smartAlerts.locator("span", { hasText: "Processor B" }).first()).toBeVisible();
});

