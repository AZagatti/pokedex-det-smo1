import { expect, test } from "@playwright/test";

test.describe("Berries", () => {
  test("lists berries and shows detail page", async ({ page }) => {
    await page.goto("/berries");
    await expect(
      page.getByRole("heading", { name: /berries/iu, level: 1 })
    ).toBeVisible({
      timeout: 15_000,
    });
    const firstBerry = page.locator('a[href*="/berries/"]').first();
    await expect(firstBerry).toBeVisible({ timeout: 15_000 });
    await firstBerry.click();
    await expect(page).toHaveURL(/\/berries\/.+/u);
  });
});

test.describe("404", () => {
  test("shows a not found page for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBeLessThan(500);
    await expect(page.getByText(/not found|404/iu).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
