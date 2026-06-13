import { expect, test } from "@playwright/test";

test.describe("SpaceX Explorer", () => {
  test("loads launches and fetches more results", async ({ page }) => {
    const loadedYear = new Date().getFullYear() - 3;

    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Mission Future Prime", level: 2 }),
    ).toBeVisible({ timeout: 20_000 });

    const list = page.getByRole("main").getByRole("list");
    await list.hover();
    await page.mouse.wheel(0, 5000);

    await expect(page.getByText("Loading more launches...")).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByRole("heading", {
        name: `Mission ${loadedYear} Alpha`,
        level: 2,
      }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("opens a launch detail page", async ({ page }) => {
    await page.goto("/launches/launch-2027-future");

    await page
      .getByRole("heading", { name: /mission future prime/i, level: 1 })
      .waitFor();
    await expect(page.getByText(/mission notes/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /rocket/i, level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /launchpad/i, level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /mission gallery/i })).toBeVisible();
  });

  test("loads Launch Library trend data", async ({ page }) => {
    await page.goto("/trends");

    await expect(
      page.getByRole("heading", { name: /launch volume and success rate/i }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("2022").first()).toBeVisible();
    await expect(page.getByText("3 launches").first()).toBeVisible();
  });

  test("persists favorites and exposes the compare URL", async ({ page }) => {
    await page.goto("/");

    const favoriteButtons = page.getByRole("button", { name: "Add to favorites" });
    await favoriteButtons.first().click();

    await page.getByRole("link", { name: "Favorites" }).click();
    await page.waitForURL(/\/favorites/);
    await expect(
      page.getByRole("heading", { name: /favorite launches/i }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("article").first()).toBeVisible();

    await page.reload();
    await expect(page.getByRole("article").first()).toBeVisible();

    await page.getByRole("link", { name: "Launches" }).click();

    const compareButtons = page.getByRole("button", { name: "Add to compare" });
    await compareButtons.nth(0).click();
    await compareButtons.nth(1).click();

    await expect(
      page.getByRole("button", { name: "Compare selected" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Compare selected" }).click();

    await expect(page).toHaveURL(/\/compare\?left=.*&right=.*/);
    await expect(
      page.getByRole("heading", { name: /two-launch comparison/i }),
    ).toBeVisible();
    await expect(page.getByText("Two launches are selected and ready to compare.")).toBeVisible();
  });
});
