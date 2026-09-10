import { test as setup } from "@playwright/test";
import { config } from "../config/env.config";

const authFile = "playwright/.auth/user.json";

setup("authenticate in Microsoft Account", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  await page.goto("https://login.live.com");

  await page.fill('input[type="email"]', config.email);
  await page.getByTestId("primaryButton").click();
  await page.getByRole("button", { name: "Use your password" }).click();
  await page.fill('input[type="password"]', config.password);
  await page.getByTestId("primaryButton").click();

  const staySignedInTitle = page.getByTestId("title");
  if (await staySignedInTitle.isVisible({ timeout: 5000 })) {
    await page.getByTestId("primaryButton").click();
  }

  await page.waitForURL(/.*(microsoft|live|office)\.com.*/, { timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.context().storageState({ path: authFile });
});
