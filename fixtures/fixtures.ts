import { test as base } from "@playwright/test";
import { ExelOnlinePage } from "../pages/ExelOnlinePage";

type CustomFixtures = {
  excelOnlinePage: ExelOnlinePage;
};

export const test = base.extend<CustomFixtures>({
  excelOnlinePage: async ({ page }, use) => {
    await use(new ExelOnlinePage(page));
  },
});

export { expect } from "@playwright/test";
