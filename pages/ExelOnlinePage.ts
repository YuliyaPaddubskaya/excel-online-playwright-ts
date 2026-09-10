import { Page, FrameLocator, Locator, expect } from "@playwright/test";

export class ExelOnlinePage {
  readonly page: Page;
  readonly excelFrame: FrameLocator;
  readonly nameBoxInput: Locator;
  readonly readoutElement: Locator;
  readonly unavailabilityToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.excelFrame = page.frameLocator('iframe[name^="WacFrame"]');
    this.nameBoxInput = this.excelFrame.locator(
      "#FormulaBar-NameBoxwrapper input",
    );
    this.readoutElement = this.excelFrame.locator(
      "#m_excelWebRenderer_ewaCtl_readoutElement1",
    );
    this.unavailabilityToast = this.excelFrame.locator('[role="alert"]');
  }

  async openNewWorkbook(): Promise<void> {
    const targetUrl = "https://excel.new";
    await this.page.goto(targetUrl, { waitUntil: "commit", timeout: 45000 });
    await this.page.waitForURL(/excel\.cloud\.microsoft\/open\/onedrive\//, {
      timeout: 45000,
      waitUntil: "load",
    });
    await this.nameBoxInput.waitFor({ state: "visible", timeout: 45000 });
    await this.waitForUnavailabilityToastsToDisappear();
  }

  private async waitForUnavailabilityToastsToDisappear(): Promise<void> {
    try {
      // Short wait to capture popping toasts
      await this.unavailabilityToast
        .first()
        .waitFor({ state: "visible", timeout: 3000 });

      // Remove all active toast containers from the frame DOM at once
      await this.unavailabilityToast.evaluateAll((elements) => {
        elements.forEach((el) => {
          const container = el.closest("div") || el;
          container.remove();
        });
      });
    } catch {
      // Ignores timeout if no toasts were rendered
    }
  }

  private async selectCellViaNameBox(cellAddress: string): Promise<void> {
    await this.nameBoxInput.click({ timeout: 500 });
    await this.nameBoxInput.clear();
    expect(await this.nameBoxInput.inputValue()).toBe("");
    await this.page.keyboard.type(cellAddress, { delay: 50 });
    expect(await this.nameBoxInput.inputValue()).toBe(cellAddress);
    await expect(this.nameBoxInput).toBeFocused();
    await this.page.keyboard.press("Enter");
    await expect(this.nameBoxInput).not.toBeFocused();
  }

  async enterFormulaIntoCellViaNameBox(
    cell: string,
    formula: string,
  ): Promise<void> {
    await this.selectCellViaNameBox(cell);
    await this.page.keyboard.type(formula, { delay: 100 });
    await this.page.keyboard.press("Control+Enter");
    await expect(this.readoutElement).toHaveAttribute(
      "aria-label",
      new RegExp(cell, "i"),
      { timeout: 20000 },
    );
  }

  async getCellValue(cell: string): Promise<string> {
    const ariaLabel = await this.readoutElement.getAttribute("aria-label");
    if (ariaLabel === null) {
      throw new Error(`Could not read value for cell ${cell}`);
    }
    const cleanValue = ariaLabel.split(".")[0].trim();
    console.log(`Cell ${cell} value: ${cleanValue}`);
    return cleanValue;
  }
}
