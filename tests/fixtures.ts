import { test as base, chromium, BrowserContext } from "@playwright/test";
import path from "path";

const EXTENSION_PATH = path.join(__dirname, "../dist");

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // Override the default context to launch with the extension loaded
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });
    await use(context);
    await context.close();
  },

  // Derive the extension ID from the service worker URL
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent("serviceworker");
    }
    const extensionId = background.url().split("/")[2];
    await use(extensionId);
  },
});

export const expect = test.expect;
