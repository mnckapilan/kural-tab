import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

// Helper: navigate to the extension new tab page
async function goToNewTab(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/newtab.html`);
}

// Helper: wait for the kural to finish loading (skeleton → content)
async function waitForKural(page: Page) {
  await expect(page.getByTestId("kural-text")).toBeVisible({ timeout: 15000 });
}

test.describe("Kural Tab new tab page", () => {
  test("displays a kural with all expected sections", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await goToNewTab(page, extensionId);
    await waitForKural(page);

    // Kural number
    await expect(page.getByTestId("kural-number")).toBeVisible();

    // Tamil text (two lines)
    const lines = page.getByTestId("kural-text").locator("> div");
    await expect(lines).toHaveCount(2);

    // Translation
    await expect(page.getByTestId("kural-translation")).toBeVisible();

    // Tamil meaning
    await expect(page.getByTestId("kural-meaning")).toBeVisible();

    // Metadata (section / chapter)
    await expect(page.getByTestId("kural-metadata")).toBeVisible();
  });

  test("kural number is between 1 and 1330", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await goToNewTab(page, extensionId);
    await waitForKural(page);

    const numberText = await page
      .getByTestId("kural-number-value")
      .textContent();
    const num = parseInt(numberText ?? "0", 10);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(1330);
  });

  test("randomise button loads a new kural", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await goToNewTab(page, extensionId);
    await waitForKural(page);

    const firstNumber = await page
      .getByTestId("kural-number-value")
      .textContent();

    // Click randomise and wait for re-render — retry a few times if we hit
    // the same kural by chance (1/1330 probability per attempt)
    let attempts = 0;
    let newNumber = firstNumber;
    while (newNumber === firstNumber && attempts < 5) {
      await page.getByRole("button", { name: "Randomize kural" }).click();
      await waitForKural(page);
      newNumber = await page.getByTestId("kural-number-value").textContent();
      attempts++;
    }

    // After a few attempts we should have gotten a different kural
    expect(newNumber).not.toBe(firstNumber);
  });

  test("star button toggles favourite state", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await goToNewTab(page, extensionId);
    await waitForKural(page);

    const starBtn = page.getByRole("button", {
      name: /^(Add to|Remove from) favourites$/,
    });

    // Initially not starred
    await expect(starBtn).toHaveAttribute("aria-pressed", "false");

    // Star it
    await starBtn.click();
    await expect(starBtn).toHaveAttribute("aria-pressed", "true");

    // Unstar it
    await starBtn.click();
    await expect(starBtn).toHaveAttribute("aria-pressed", "false");
  });

  test("favourites panel opens and shows starred kural", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await goToNewTab(page, extensionId);
    await waitForKural(page);

    const favouritesBtn = page.getByRole("button", {
      name: /^(See|Hide) Favourites$/,
    });

    // Button is disabled when no favourites
    await expect(favouritesBtn).toBeDisabled();

    // Favourite the current kural
    await page
      .getByRole("button", { name: /^(Add to|Remove from) favourites$/ })
      .click();

    // Button should now be enabled
    await expect(favouritesBtn).toBeEnabled();

    // Open the panel
    await favouritesBtn.click();
    await expect(page.getByTestId("favourites-list")).toBeVisible();

    // Should show at least one item
    const items = page.getByTestId("favourites-item");
    await expect(items).toHaveCount(1);

    // Clean up: remove the favourite
    await page.getByRole("button", { name: "Remove", exact: true }).click();
    await expect(items).toHaveCount(0);
  });

  test("selecting a kural from favourites panel displays it", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await goToNewTab(page, extensionId);
    await waitForKural(page);

    const currentNumber = await page
      .getByTestId("kural-number-value")
      .textContent();

    // Star current kural, then randomise to get a different one
    await page
      .getByRole("button", { name: /^(Add to|Remove from) favourites$/ })
      .click();
    await page.getByRole("button", { name: "Randomize kural" }).click();
    await waitForKural(page);

    // Open favourites and click the starred kural
    await page.getByRole("button", { name: /^(See|Hide) Favourites$/ }).click();
    await expect(page.getByTestId("favourites-list")).toBeVisible();
    await page
      .getByTestId("favourites-item")
      .getByRole("button")
      .first()
      .click();
    await waitForKural(page);

    // Should have navigated back to the originally starred kural
    const shownNumber = await page
      .getByTestId("kural-number-value")
      .textContent();
    expect(shownNumber).toBe(currentNumber);

    // Clean up
    await page
      .getByRole("button", { name: /^(Add to|Remove from) favourites$/ })
      .click();
  });

  test("theme toggle switches between dark and light mode", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await goToNewTab(page, extensionId);
    await waitForKural(page);

    const html = page.locator("html");
    const toggle = page.getByLabel("Toggle dark/light mode");

    // Default is dark mode
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Toggle to light
    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "light");

    // Toggle back to dark
    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("metadata link points to correct chapter", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await goToNewTab(page, extensionId);
    await waitForKural(page);

    const metadataLink = page.getByTestId("kural-metadata").getByRole("link");
    await expect(metadataLink).toBeVisible();

    const href = await metadataLink.getAttribute("href");
    expect(href).toMatch(/thirukkuralchapters\/\d+/);
  });
});
