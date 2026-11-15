import { defineConfig } from "wxt";

// The manifest "version" is taken from package.json by WXT automatically.
export default defineConfig({
  srcDir: "src",
  // Copied verbatim into the build output: fonts/ and data/ (fetched at runtime).
  publicDir: "public",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Kural Tab",
    description:
      "Replace your new tab with daily Thirukkural couplets, offering timeless wisdom and reflection.",
    permissions: ["storage"],
    action: {
      default_title: "Kural Tab",
    },
  },
});
