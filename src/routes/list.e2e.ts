import { expect, test } from "@playwright/test";

test.describe("Pokédex list page", () => {
  test("loads and shows pokemon cards with search", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href*="/pokemon/"]').first()).toBeVisible({
      timeout: 20_000,
    });

    const search = page.getByLabel("Search Pokémon by name");
    await search.fill("bulba");
    await expect(page.getByText(/bulbasaur/iu).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("navigates to a detail page and back", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator('a[href*="/pokemon/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 20_000 });
    await firstCard.click();
    await expect(page).toHaveURL(/\/pokemon\//u);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: /back to pokédex/iu }).click();
    await expect(page).toHaveURL(/\/pokedex-det-smo1\/?$/u);
  });

  test("toggles theme", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", {
      name: /switch to (?<mode>dark|light) theme/iu,
    });
    const before = await page.locator("html").getAttribute("data-theme");
    await toggle.click();
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-theme",
      before ?? ""
    );
  });
});
