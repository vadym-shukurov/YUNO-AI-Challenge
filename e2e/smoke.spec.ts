import { expect, test } from "@playwright/test";

test("dashboard loads and renders core sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Smart Alerts", exact: true }),
  ).toBeVisible();
  // `CardTitle` is not necessarily a semantic heading; assert by text instead.
  await expect(page.getByText("Transaction Explorer")).toBeVisible();

  await expect(page.getByTestId("filter-method")).toBeVisible();
  await expect(page.getByTestId("filter-processor")).toBeVisible();
  await expect(page.getByTestId("filter-outcome")).toBeVisible();
  await expect(page.getByTestId("filter-amount")).toBeVisible();
  await expect(page.getByTestId("filter-date-range")).toBeVisible();

  // Table renders and is interactable.
  await expect(page.getByTestId("table-search")).toBeVisible();
  await expect(page.getByTestId("txn-row").first()).toBeVisible();
});

