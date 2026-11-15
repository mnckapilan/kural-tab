import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    // Extensions require a non-headless context
    headless: false,
    // Fail fast on a locator that never matches instead of waiting out the test timeout
    actionTimeout: 10000,
    viewport: { width: 1280, height: 800 },
  },
});
