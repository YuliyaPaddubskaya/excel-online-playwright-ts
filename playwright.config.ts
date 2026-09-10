import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  timeout: 90000,
  expect: {
    timeout: 10000,
  },
  use: {
    trace: "on",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    permissions: ["clipboard-read", "clipboard-write"],
    locale: "en-GB",
    extraHTTPHeaders: {
      "Accept-Language": "en-GB,en;q=0.9",
    },
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "e2e-chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
