import { test, expect } from "./fixtures";

// Helper: navigate to the extension new tab page
async function goToNewTab(page: any, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/index.html`);
}

// Helper: wait for the kural to finish loading (skeleton → content)
async function waitForKural(page: any) {
  await expect(page.locator(".quote-text")).toBeVisible({ timeout: 15000 });
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
    await expect(page.locator(".quote-number")).toBeVisible();

    // Tamil text (two lines)
    const lines = page.locator(".quote-text > div");
    await expect(lines).toHaveCount(2);

    // Translation
    await expect(page.locator(".quote-explanation")).toBeVisible();

    // Tamil meaning
    await expect(page.locator(".quote-mv")).toBeVisible();

    // Metadata (section / chapter)
    await expect(page.locator(".quote-metadata")).toBeVisible();
  });

  test("kural number is between 1 and 1330", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await goToNewTab(page, extensionId);
    await waitForKural(page);

    const numberText = await page
      .locator(".quote-number span")
      .first()
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
      .locator(".quote-number span")
      .first()
      .textContent();

    // Click randomise and wait for re-render — retry a few times if we hit
    // the same kural by chance (1/1330 probability per attempt)
    let attempts = 0;
    let newNumber = firstNumber;
    while (newNumber === firstNumber && attempts < 5) {
      await page.click(".refresh-button");
      await waitForKural(page);
      newNumber = await page
        .locator(".quote-number span")
        .first()
        .textContent();
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

    const starBtn = page.locator(".star-button");

    // Initially not starred
    await expect(starBtn).not.toHaveClass(/is-starred/);
    await expect(starBtn).toHaveAttribute("aria-pressed", "false");

    // Star it
    await starBtn.click();
    await expect(starBtn).toHaveClass(/is-starred/);
    await expect(starBtn).toHaveAttribute("aria-pressed", "true");

    // Unstar it
    await starBtn.click();
    await expect(starBtn).not.toHaveClass(/is-starred/);
    await expect(starBtn).toHaveAttribute("aria-pressed", "false");
  });

  test("favourites panel opens and shows starred kural", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await goToNewTab(page, extensionId);
    await waitForKural(page);

    const favouritesBtn = page.locator(".favourites-toggle");

    // Button is disabled when no favourites
    await expect(favouritesBtn).toBeDisabled();

    // Favourite the current kural
    await page.locator(".star-button").click();

    // Button should now be enabled
    await expect(favouritesBtn).toBeEnabled();

    // Open the panel
    await favouritesBtn.click();
    await expect(page.locator(".favourites-list")).toBeVisible();

    // Should show at least one item
    const items = page.locator(".favourites-item");
    await expect(items).toHaveCount(1);

    // Clean up: remove the favourite
    await page.locator(".favourites-remove").click();
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
      .locator(".quote-number span")
      .first()
      .textContent();

    // Star current kural, then randomise to get a different one
    await page.locator(".star-button").click();
    await page.click(".refresh-button");
    await waitForKural(page);

    // Open favourites and click the starred kural
    await page.locator(".favourites-toggle").click();
    await expect(page.locator(".favourites-list")).toBeVisible();
    await page.locator(".favourites-select").first().click();
    await waitForKural(page);

    // Should have navigated back to the originally starred kural
    const shownNumber = await page
      .locator(".quote-number span")
      .first()
      .textContent();
    expect(shownNumber).toBe(currentNumber);

    // Clean up
    await page.locator(".star-button").click();
  });

  test("theme toggle switches between dark and light mode", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await goToNewTab(page, extensionId);
    await waitForKural(page);

    // Default is dark mode
    await expect(page.locator("body")).toHaveClass(/dark-mode/);

    // Toggle to light
    await page.locator("#mode-switch").evaluate((el: HTMLInputElement) => {
      el.click();
    });
    await expect(page.locator("body")).toHaveClass(/light-mode/);

    // Toggle back to dark
    await page.locator("#mode-switch").evaluate((el: HTMLInputElement) => {
      el.click();
    });
    await expect(page.locator("body")).toHaveClass(/dark-mode/);
  });

  test("metadata link points to correct chapter", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await goToNewTab(page, extensionId);
    await waitForKural(page);

    const metadataLink = page.locator(".metadata-tree");
    await expect(metadataLink).toBeVisible();

    const href = await metadataLink.getAttribute("href");
    expect(href).toMatch(/thirukkuralchapters\/\d+/);
  });
});
