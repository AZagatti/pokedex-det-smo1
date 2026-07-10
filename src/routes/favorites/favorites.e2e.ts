import { expect, test } from "@playwright/test";

test.describe("Favorites", () => {
  test("can favorite a pokemon from the list and see it on the favorites page", async ({
    page,
  }) => {
    await page.goto("/");
    const firstCard = page.locator('a[href*="/pokemon/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 20_000 });

    const favButton = firstCard.getByRole("button", {
      name: /add .* to favorites/iu,
    });
    await favButton.click();

    await page.getByRole("link", { name: /favorites/iu }).click();
    await expect(page).toHaveURL(/\/favorites/u);
    await expect(page.locator('a[href*="/pokemon/"]').first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
