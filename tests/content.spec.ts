import type { BrowserContext, Page } from "@playwright/test";
import { test, expect } from "./fixtures";

// Each test runs in a fresh browser profile, so no cleanup of storage is needed.

async function goToContentSettings(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/options.html#content`);
  await expect(
    page.getByRole("checkbox", { name: /^Show Virtue/ }),
  ).toBeVisible();
}

async function openNewTab(
  context: BrowserContext,
  extensionId: string,
  hash = "",
) {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/newtab.html${hash}`);
  await expect(page.getByTestId("kural-number-value")).toBeVisible({
    timeout: 15000,
  });
  return page;
}

async function hideLove(page: Page) {
  await page.getByRole("button", { name: /^Hide Love/ }).click();
  await expect(
    page.getByRole("checkbox", { name: /^Show Love/ }),
  ).not.toBeChecked();
}

const kuralNumber = async (page: Page) =>
  Number(await page.getByTestId("kural-number-value").textContent());

test.describe("Content settings", () => {
  test("display switches show and hide parts of the kural live", async ({
    context,
    extensionId,
  }) => {
    const settings = await context.newPage();
    await goToContentSettings(settings, extensionId);
    const newTab = await openNewTab(context, extensionId);

    const cases = [
      { label: "Show English translation", testId: "kural-translation" },
      { label: "Show Tamil meaning", testId: "kural-meaning" },
      { label: "Show section and chapter", testId: "kural-metadata" },
    ];

    for (const { label, testId } of cases) {
      await expect(newTab.getByTestId(testId)).toBeVisible();
      await settings.bringToFront();
      await settings.getByRole("switch", { name: label }).click();
      await expect(newTab.getByTestId(testId)).toHaveCount(0);
      // The couplet stays
      await expect(newTab.getByTestId("kural-text")).toBeVisible();

      await settings.getByRole("switch", { name: label }).click();
      await expect(newTab.getByTestId(testId)).toBeVisible();
    }

    // Persisted: a reloaded new tab applies the setting too
    await settings.getByRole("switch", { name: "Show Tamil meaning" }).click();
    await newTab.reload();
    await expect(newTab.getByTestId("kural-text")).toBeVisible();
    await expect(newTab.getByTestId("kural-meaning")).toHaveCount(0);
    await expect(newTab.getByTestId("kural-translation")).toBeVisible();
  });

  test("hiding the Love section keeps it out of Randomise", async ({
    context,
    extensionId,
  }) => {
    const settings = await context.newPage();
    await goToContentSettings(settings, extensionId);
    await hideLove(settings);
    await expect(
      settings.getByRole("button", { name: /^Hide Love/ }),
    ).toBeDisabled();
    await expect(settings.getByRole("status")).toContainText(
      "Showing 1,080 of 1,330 kurals",
    );

    const newTab = await openNewTab(context, extensionId);
    expect(await kuralNumber(newTab)).toBeLessThanOrEqual(1080);

    const randomise = newTab.getByRole("button", { name: "Randomise" });
    for (let i = 0; i < 40; i++) {
      await randomise.click();
      expect(await kuralNumber(newTab)).toBeLessThanOrEqual(1080);
    }
    await expect(newTab.getByTestId("kural-hidden-notice")).toHaveCount(0);
  });

  test("a hidden kural opened by URL shows a notice with a way out", async ({
    context,
    extensionId,
  }) => {
    const settings = await context.newPage();
    await goToContentSettings(settings, extensionId);
    await hideLove(settings);

    const newTab = await openNewTab(context, extensionId, "#1100");
    const notice = newTab.getByTestId("kural-hidden-notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("This kural is hidden by your settings");
    await expect(newTab.getByTestId("kural-number-value")).toHaveText("1100");
    await expect(newTab.getByTestId("kural-text")).toHaveCount(0);
    expect(new URL(newTab.url()).hash).toBe("#1100");
    await expect(
      notice.getByRole("button", { name: "Open settings" }),
    ).toBeVisible();

    await notice.getByRole("button", { name: "Randomise" }).click();
    await expect(newTab.getByTestId("kural-text")).toBeVisible();
    await expect(notice).toHaveCount(0);
    expect(await kuralNumber(newTab)).toBeLessThanOrEqual(1080);
  });

  test("jumping to a hidden kural by number shows the notice", async ({
    context,
    extensionId,
  }) => {
    const settings = await context.newPage();
    await goToContentSettings(settings, extensionId);
    await hideLove(settings);

    const newTab = await openNewTab(context, extensionId);
    await newTab.getByTestId("kural-number-value").click();
    await newTab.getByTestId("kural-number-input").fill("1200");
    await newTab.getByTestId("kural-number-input").press("Enter");
    await expect(newTab.getByTestId("kural-hidden-notice")).toBeVisible();
    await expect(newTab.getByTestId("kural-number-value")).toHaveText("1200");
  });

  test("hidden favourites are listed with a Hidden label", async ({
    context,
    extensionId,
  }) => {
    const newTab = await openNewTab(context, extensionId, "#1100");
    await newTab.getByRole("button", { name: "Add to favourites" }).click();

    const settings = await context.newPage();
    await goToContentSettings(settings, extensionId);
    await hideLove(settings);

    await newTab.bringToFront();
    await expect(newTab.getByTestId("kural-hidden-notice")).toBeVisible();
    await newTab.getByRole("button", { name: "See Favourites" }).click();
    const item = newTab.getByTestId("favourites-item");
    await expect(item).toHaveCount(1);
    await expect(item).toContainText("Hidden");

    // Navigating to it still works (and shows the notice)
    await newTab.getByRole("button", { name: "Randomise" }).first().click();
    await expect(newTab.getByTestId("kural-hidden-notice")).toHaveCount(0);
    await newTab.getByRole("button", { name: "See Favourites" }).click();
    await item.getByRole("button").first().click();
    await expect(newTab.getByTestId("kural-hidden-notice")).toBeVisible();
    await expect(newTab.getByTestId("kural-number-value")).toHaveText("1100");
  });

  test("hiding every chapter is blocked", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await goToContentSettings(page, extensionId);

    await page.getByRole("checkbox", { name: /^Show Virtue/ }).click();
    await page.getByRole("checkbox", { name: /^Show Wealth/ }).click();
    const love = page.getByRole("checkbox", { name: /^Show Love/ });
    await love.click();

    await expect(page.getByRole("status")).toContainText(
      "At least one chapter must stay visible",
    );
    await expect(love).toBeChecked();
    await expect(page.getByRole("status")).toContainText(
      "Showing 250 of 1,330 kurals",
    );

    // A successful change clears the message
    await page.getByRole("button", { name: "Show all" }).click();
    await expect(page.getByRole("status")).not.toContainText(
      "At least one chapter",
    );
    await expect(page.getByRole("button", { name: "Show all" })).toBeDisabled();
  });

  test("hiding the current kural's chapter switches an open tab to the notice", async ({
    context,
    extensionId,
  }) => {
    const newTab = await openNewTab(context, extensionId, "#1");
    await expect(newTab.getByTestId("kural-text")).toBeVisible();

    const settings = await context.newPage();
    await goToContentSettings(settings, extensionId);
    await settings.getByRole("checkbox", { name: /^Show Virtue/ }).click();

    await newTab.bringToFront();
    await expect(newTab.getByTestId("kural-hidden-notice")).toBeVisible();
    await expect(newTab.getByTestId("kural-text")).toHaveCount(0);

    await settings.bringToFront();
    await settings.getByRole("button", { name: "Show all" }).click();
    await newTab.bringToFront();
    await expect(newTab.getByTestId("kural-text")).toBeVisible();
    await expect(newTab.getByTestId("kural-hidden-notice")).toHaveCount(0);
  });
});
