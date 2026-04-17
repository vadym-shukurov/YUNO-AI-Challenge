import { expect, test } from "@playwright/test";

test("chaos: page stays usable under artificial latency", async ({ page }) => {
  // Slow down all JS/CSS to simulate a degraded network.
  await page.route("**/*.{js,css}", async (route) => {
    await new Promise((r) => setTimeout(r, 250));
    await route.continue();
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
});

test("chaos: invalid params + slow network should not crash", async ({ page }) => {
  await page.route("**/*", async (route) => {
    await new Promise((r) => setTimeout(r, 100));
    await route.continue();
  });

  await page.goto("/?range=bad&method=bad&processor=bad&outcome=bad&min=-1&max=-5");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
});

