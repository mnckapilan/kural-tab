import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: 1,
  reporter: "list",
  use: {
    // Extensions require a non-headless context
    headless: false,
    viewport: { width: 1280, height: 800 },
  },
});
