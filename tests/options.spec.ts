import type { BrowserContext, Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const html = (page: Page) => page.locator("html");

async function goToOptions(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/options.html#appearance`);
  await expect(page.getByTestId("appearance-preview")).toBeVisible();
}

async function openNewTab(context: BrowserContext, extensionId: string) {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/newtab.html`);
  await expect(page.getByTestId("kural-text")).toBeVisible({ timeout: 15000 });
  return page;
}

async function colourMode(page: Page, name: "Light" | "Dark" | "System") {
  await page
    .getByRole("radiogroup", { name: "Colour mode" })
    .getByRole("radio", { name })
    .click();
}

// Storage persists within a run, so put everything back to the defaults.
test.afterEach(async ({ context, extensionId }) => {
  const page = await context.newPage();
  await goToOptions(page, extensionId);
  await page.getByRole("button", { name: "Reset appearance" }).click();
  await colourMode(page, "Dark");
  await expect(html(page)).toHaveAttribute("data-theme", "dark");
});

test.describe("Kural Tab settings page", () => {
  test("new tab has a settings button that opens the options page", async ({
    context,
    extensionId,
  }) => {
    const newTab = await openNewTab(context, extensionId);
    const opened = context.waitForEvent("page");
    await newTab.getByRole("button", { name: "Settings" }).click();
    const options = await opened;
    await expect(options).toHaveURL(/options\.html/);
  });

  test("theme choice persists and the new tab follows", async ({
    context,
    extensionId,
  }) => {
    const options = await context.newPage();
    await goToOptions(options, extensionId);

    await colourMode(options, "Light");
    await expect(html(options)).toHaveAttribute("data-theme", "light");
    let newTab = await openNewTab(context, extensionId);
    await expect(html(newTab)).toHaveAttribute("data-theme", "light");
    await expect(html(newTab)).not.toHaveClass(/dark/);

    // The open new tab follows live, through storage.watch
    await colourMode(options, "Dark");
    await expect(html(newTab)).toHaveAttribute("data-theme", "dark");
    await newTab.close();

    await colourMode(options, "System");
    await options.emulateMedia({ colorScheme: "light" });
    await expect(html(options)).toHaveAttribute("data-theme", "light");
    newTab = await openNewTab(context, extensionId);
    await newTab.emulateMedia({ colorScheme: "light" });
    await expect(html(newTab)).toHaveAttribute("data-theme", "light");
    // ...and reacts live to the OS setting
    await newTab.emulateMedia({ colorScheme: "dark" });
    await expect(html(newTab)).toHaveAttribute("data-theme", "dark");

    // The new tab's toggle flips the resolved theme and stores it explicitly
    await newTab
      .getByRole("button", { name: "Toggle dark/light mode" })
      .click();
    await expect(html(newTab)).toHaveAttribute("data-theme", "light");
    await expect(
      options
        .getByRole("radiogroup", { name: "Colour mode" })
        .getByRole("radio", {
          name: "Light",
        }),
    ).toBeChecked();
  });

  test("choosing a palette sets data-palette on a new tab", async ({
    context,
    extensionId,
  }) => {
    const options = await context.newPage();
    await goToOptions(options, extensionId);
    await options
      .getByRole("radiogroup", { name: "Background palette" })
      .getByRole("radio", { name: "Palm leaf" })
      .click();
    await expect(html(options)).toHaveAttribute("data-palette", "palm-leaf");

    const newTab = await openNewTab(context, extensionId);
    await expect(html(newTab)).toHaveAttribute("data-palette", "palm-leaf");
    // A preset is pure CSS: no inline colour overrides
    await expect(html(newTab)).not.toHaveAttribute("style", /--background/);
  });

  test("custom dark background applies inline and rejects invalid hex", async ({
    context,
    extensionId,
  }) => {
    const options = await context.newPage();
    await goToOptions(options, extensionId);
    await options.getByRole("radio", { name: "Custom" }).click();
    await expect(html(options)).toHaveAttribute("data-palette", "custom");

    const darkHex = options.getByTestId("custom-bg-dark-hex");
    await darkHex.fill("#zzz");
    await expect(darkHex).toHaveAttribute("aria-invalid", "true");

    await darkHex.fill("#ABC");
    await expect(darkHex).toHaveAttribute("aria-invalid", "false");

    const newTab = await openNewTab(context, extensionId);
    await expect(html(newTab)).toHaveAttribute("data-theme", "dark");
    await expect(html(newTab)).toHaveAttribute("data-palette", "custom");
    await expect(html(newTab)).toHaveAttribute(
      "style",
      /--background: #aabbcc/,
    );
    // Light background => near-black derived text
    await expect(html(newTab)).toHaveAttribute(
      "style",
      /--foreground: #1a1a1a/,
    );
  });

  test("Tamil font selection sets data-font", async ({
    context,
    extensionId,
  }) => {
    const options = await context.newPage();
    await goToOptions(options, extensionId);
    await options
      .getByRole("radiogroup", { name: "Tamil font" })
      .getByRole("radio", { name: /Tiro Tamil/ })
      .click();
    await expect(html(options)).toHaveAttribute("data-font", "tiro");

    const newTab = await openNewTab(context, extensionId);
    await expect(html(newTab)).toHaveAttribute("data-font", "tiro");
    await expect(newTab.getByTestId("kural-text")).toHaveCSS(
      "font-family",
      /Tiro Tamil/,
    );
  });

  test("text size sets data-size and scales the couplet", async ({
    context,
    extensionId,
  }) => {
    const newTab = await openNewTab(context, extensionId);
    const text = newTab.getByTestId("kural-text");
    await expect(text).toHaveCSS("font-size", "32px");

    const options = await context.newPage();
    await goToOptions(options, extensionId);
    await options
      .getByRole("radiogroup", { name: "Text size" })
      .getByRole("radio", { name: "XL" })
      .click();
    await expect(html(options)).toHaveAttribute("data-size", "xl");
    await expect(html(newTab)).toHaveAttribute("data-size", "xl");
    await expect(text).toHaveCSS("font-size", "41.6px");
  });

  test("reset appearance restores the defaults", async ({
    context,
    extensionId,
  }) => {
    const options = await context.newPage();
    await goToOptions(options, extensionId);
    await options
      .getByRole("radiogroup", { name: "Background palette" })
      .getByRole("radio", { name: "Ink" })
      .click();
    await options
      .getByRole("radiogroup", { name: "Text size" })
      .getByRole("radio", { name: "S" })
      .click();
    await options
      .getByRole("radiogroup", { name: "Tamil font" })
      .getByRole("radio", { name: /Kavivanar/ })
      .click();
    await colourMode(options, "Light");
    await expect(html(options)).toHaveAttribute("data-palette", "ink");

    await options.getByRole("button", { name: "Reset appearance" }).click();
    await expect(html(options)).toHaveAttribute("data-palette", "slate");
    await expect(html(options)).toHaveAttribute("data-size", "m");
    await expect(html(options)).toHaveAttribute("data-font", "noto-sans");
    await expect(html(options)).toHaveAttribute("data-theme", "dark");

    const newTab = await openNewTab(context, extensionId);
    await expect(html(newTab)).toHaveAttribute("data-palette", "slate");
    await expect(html(newTab)).toHaveAttribute("data-size", "m");
  });

  test("reset propagates to other open pages", async ({
    context,
    extensionId,
  }) => {
    const options = await context.newPage();
    await goToOptions(options, extensionId);
    await options
      .getByRole("radiogroup", { name: "Background palette" })
      .getByRole("radio", { name: "Palm leaf" })
      .click();

    const otherOptions = await context.newPage();
    await goToOptions(otherOptions, extensionId);
    const newTab = await openNewTab(context, extensionId);
    await expect(html(otherOptions)).toHaveAttribute(
      "data-palette",
      "palm-leaf",
    );
    await expect(html(newTab)).toHaveAttribute("data-palette", "palm-leaf");

    await options.getByRole("button", { name: "Reset appearance" }).click();
    await expect(html(otherOptions)).toHaveAttribute("data-palette", "slate");
    await expect(html(newTab)).toHaveAttribute("data-palette", "slate");
  });
});
