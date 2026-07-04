import { expect, test } from "@playwright/test";

test.describe("EONET Explorer", () => {
  test("loads the event explorer shell", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /earth event explorer/i }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByLabel(/event search/i),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("article").first(),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("opens an event detail page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("article").first().getByRole("link").first().click();

    await expect(page).toHaveURL(/\/launches\/.+/);
    await expect(page.getByText(/event id/i)).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("heading", { name: /related imagery/i }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("loads EONET trend data", async ({ page }) => {
    await page.goto("/trends");

    await expect(
      page.getByRole("heading", { name: /event volume and closure rate/i }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/\d{4}/).first()).toBeVisible();
  });

  test("persists favorites and exposes the compare URL", async ({ page }) => {
    await page.goto("/");

    const favoriteButtons = page.getByRole("button", { name: "Add to favorites" });
    await favoriteButtons.first().click();

    await page.getByRole("link", { name: "Favorites" }).click();
    await page.waitForURL(/\/favorites/);
    await expect(
      page.getByRole("heading", { name: /favorite events/i }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("article").first()).toBeVisible();

    await page.reload();
    await expect(page.getByRole("article").first()).toBeVisible();

    await page.getByRole("link", { name: "Events" }).click();

    const compareButtons = page.getByRole("button", { name: "Add to compare" });
    await compareButtons.nth(0).click();
    await compareButtons.nth(1).click();

    await expect(
      page.getByRole("button", { name: "Compare selected" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Compare selected" }).click();

    await expect(page).toHaveURL(/\/compare\?left=.*&right=.*/);
    await expect(
      page.getByRole("heading", { name: /two-event comparison/i }),
    ).toBeVisible();
    await expect(page.getByText("Two events are selected and ready to compare.")).toBeVisible();
  });
});
