import { expect, test } from "@playwright/test";

test.describe("Earth Event Explorer", () => {
  test("loads the map-first explorer shell", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(/event explorer/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByLabel(/event map/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/timeline/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByLabel(/event search/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("article").first()).toBeVisible({ timeout: 20_000 });
  });

  test("opens an event detail page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("article").first().getByRole("link", { name: /open details/i }).click();

    await expect(page).toHaveURL(/\/events\/.+/);
    await expect(page.getByText(/event id/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /observed geometries/i })).toBeVisible({
      timeout: 20_000,
    });
  });

  test("persists favorites and compare flow", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /^save$/i }).first().click();

    await page.getByRole("link", { name: "Favorites" }).click();
    await page.waitForURL(/\/favorites/);
    await expect(page.getByRole("heading", { name: /favorite events/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("article").first()).toBeVisible();

    await page.reload();
    await expect(page.getByRole("article").first()).toBeVisible();

    await page.getByRole("link", { name: "Events" }).click();

    const compareButtons = page.getByRole("button", { name: /^compare$/i });
    await compareButtons.nth(0).click();
    await compareButtons.nth(1).click();

    await expect(page.getByRole("button", { name: /compare selected/i })).toBeVisible();
    await page.getByRole("button", { name: /compare selected/i }).click();

    await expect(page).toHaveURL(/\/compare\?left=.*&right=.*/);
    await expect(page.getByRole("heading", { name: /two-event comparison/i })).toBeVisible({
      timeout: 20_000,
    });
  });
});
