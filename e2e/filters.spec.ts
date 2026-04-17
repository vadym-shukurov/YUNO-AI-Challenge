import { expect, test } from "@playwright/test";

async function openSelect(page: any, testId: string) {
  await expect(page.getByTestId(testId)).toBeVisible();
  await page.getByTestId(testId).click();
}

test("payment method filter updates URL (shareable state)", async ({ page }) => {
  await page.goto("/");
  await openSelect(page, "filter-method");
  await page.getByRole("listbox").getByRole("option", { name: "GoPay" }).click();
  await expect(page).toHaveURL(/method=GoPay/);
});

test("processor + outcome filters can be deep-linked via URL", async ({ page }) => {
  await page.goto("/?processor=Processor%20B&outcome=Declined&range=14d");

  // The filter controls should reflect the URL state.
  await expect(page.getByTestId("filter-processor")).toContainText("Processor B");
  await expect(page.getByTestId("filter-outcome")).toContainText("Declined");

  // Expect at least one row in the seeded dataset.
  await expect(page.getByTestId("txn-row").first()).toBeVisible();

  // Open the first row and validate the details include the selected processor + outcome.
  await page.getByTestId("txn-row").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/·\s*Processor B\s*·/)).toBeVisible();
  await expect(dialog.locator("span").filter({ hasText: "Declined" }).first()).toBeVisible();
});

test("invalid URL params fall back safely (no crash)", async ({ page }) => {
  await page.goto("/?range=bad&method=bad&processor=bad&outcome=bad&min=-1");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
});

