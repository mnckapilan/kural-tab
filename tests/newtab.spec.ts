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
    const firstText = await page.getByTestId("kural-text").textContent();

    // Click randomise and wait for re-render — retry a few times if we hit
    // the same kural by chance (1/1330 probability per attempt)
    let attempts = 0;
    let newNumber = firstNumber;
    while (newNumber === firstNumber && attempts < 5) {
      await page.getByRole("button", { name: "Randomise" }).click();
      await waitForKural(page);
      newNumber = await page.getByTestId("kural-number-value").textContent();
      attempts++;
    }

    // After a few attempts we should have gotten a different kural
    expect(newNumber).not.toBe(firstNumber);

    // The couplet swaps with a short exit/enter animation; once it settles
    // only the new couplet remains in the DOM.
    await expect(page.getByTestId("kural-text")).toHaveCount(1);
    await expect(page.getByTestId("kural-text")).not.toHaveText(
      firstText ?? "",
    );
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
    await page.getByRole("button", { name: "Randomise" }).click();
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

  test("light theme is applied before first paint on reload", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await goToNewTab(page, extensionId);
    await waitForKural(page);
    await page.getByLabel("Toggle dark/light mode").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    // Record <html>'s class once the <head> has run, i.e. before React (which
    // waits on async chrome.storage) could have changed it. Without the
    // pre-paint theme script this would still be the "dark" default.
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        (window as unknown as { __initialClass: string }).__initialClass =
          document.documentElement.className;
      });
    });
    await page.reload();
    await waitForKural(page);
    const initialClass = await page.evaluate(
      () => (window as unknown as { __initialClass: string }).__initialClass,
    );
    expect(initialClass).not.toContain("dark");

    // Clean up: back to the default theme
    await page.getByLabel("Toggle dark/light mode").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
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

  test("URL hash deep-links to a kural and tracks the current one", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/newtab.html#42`);
    await waitForKural(page);
    await expect(page.getByTestId("kural-number-value")).toHaveText("42");

    // Randomising rewrites the hash to the new kural
    await page.getByRole("button", { name: "Randomise" }).click();
    await expect(page).not.toHaveURL(/#42$/);
    const shown = await page.getByTestId("kural-number-value").textContent();
    await expect(page).toHaveURL(new RegExp(`#${shown}$`));

    // Reloading keeps the same kural
    await page.reload();
    await waitForKural(page);
    await expect(page.getByTestId("kural-number-value")).toHaveText(
      shown ?? "",
    );

    // Editing the hash in place switches kural
    await page.evaluate(() => {
      window.location.hash = "#1330";
    });
    await expect(page.getByTestId("kural-number-value")).toHaveText("1330");
  });

  test("an invalid URL hash falls back to a random kural", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/newtab.html#9999`);
    await waitForKural(page);

    const num = parseInt(
      (await page.getByTestId("kural-number-value").textContent()) ?? "0",
      10,
    );
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(1330);
    await expect(page).toHaveURL(new RegExp(`#${num}$`));
  });

  test("clicking the number jumps to a typed kural", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/newtab.html#10`);
    await waitForKural(page);

    const numberButton = page.getByRole("button", { name: /^Kural \d+\./ });
    const input = page.getByTestId("kural-number-input");

    // Out-of-range input is rejected and the input stays open
    await numberButton.click();
    await input.fill("2000");
    await input.press("Enter");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("kural-number-value")).toHaveCount(0);

    // Escape cancels without changing the kural
    await input.press("Escape");
    await expect(input).toHaveCount(0);
    await expect(page.getByTestId("kural-number-value")).toHaveText("10");
    await expect(numberButton).toBeFocused();

    // A valid number navigates to it
    await numberButton.click();
    await input.fill("500");
    await input.press("Enter");
    await expect(page.getByTestId("kural-number-value")).toHaveText("500");
    await expect(page).toHaveURL(/#500$/);
    await expect(numberButton).toBeFocused();
  });
});
