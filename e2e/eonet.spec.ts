import { expect, test } from "@playwright/test";

test.describe("Earth Event Atlas", () => {
  test("loads the map-first explorer shell", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Earth Event Atlas").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByLabel(/event map/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("region", { name: /event timeline/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Choose what to explore")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByLabel(/event search/i)).toBeDisabled();
    await page.getByRole("button", { name: "Wildfires" }).click();
    await expect(page.getByText("Updating events")).toBeHidden({ timeout: 20_000 });
    await expect(page.getByLabel(/event search/i)).toBeEnabled({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: /select .+/i }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("link", { name: /view details/i })).toBeVisible({ timeout: 20_000 });
  });

  test("opens a source-oriented event record", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Wildfires" }).click();
    await expect(page.getByText("Updating events")).toBeHidden({ timeout: 20_000 });
    await page.getByRole("link", { name: /view details/i }).click();

    await expect(page).toHaveURL(/\/events\/.+/);
    await expect(page.getByText(/record EONET_/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /record profile/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /recent observations/i })).toBeVisible();
  });

  test("persists Saved events and opens a two-event comparison", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Wildfires" }).click();
    await expect(page.getByText("Updating events")).toBeHidden({ timeout: 20_000 });

    await page.getByRole("button", { name: /save event/i }).click();
    await page.getByRole("link", { name: /^saved/i }).click();
    await page.waitForURL(/\/favorites/);
    await expect(page.getByRole("heading", { name: /saved events/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("article").first()).toBeVisible();

    await page.reload();
    await expect(page.getByRole("article").first()).toBeVisible();

    await page.getByRole("link", { name: /^explore/i }).click();
    await page.getByRole("button", { name: "Wildfires" }).click();
    await expect(page.getByText("Updating events")).toBeHidden({ timeout: 20_000 });
    await page.getByRole("button", { name: /add to compare/i }).click();
    await page.getByRole("button", { name: /select .+/i }).nth(1).click();
    await page.getByRole("button", { name: /add to compare/i }).click();

    await page.getByRole("link", { name: /^compare/i }).click();
    await expect(page).toHaveURL(/\/compare\?left=.*&right=.*/);
    await expect(page.getByRole("heading", { name: /event comparison/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Latest observed")).toBeVisible();
  });
});
