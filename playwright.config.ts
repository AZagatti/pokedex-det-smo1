import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: { command: "npm run build && npm run preview", port: 4173 },
  use: {
    baseURL: "http://localhost:4173/pokedex-det-smo1",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  testMatch: "**/*.e2e.{ts,js}",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
});
