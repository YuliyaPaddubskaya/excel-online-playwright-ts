import { test, expect } from "../fixtures/fixtures";
import { getFormattedToday } from "../utils/dateUtils";

test("A2 cell should evaluate TODAY() function to current date", async ({
  excelOnlinePage,
}) => {
  await excelOnlinePage.openNewWorkbook();
  await excelOnlinePage.enterFormulaIntoCellViaNameBox("A2", "=TODAY()");
  const validFormat = getFormattedToday();
  const cellValue = await excelOnlinePage.getCellValue("A2");
  expect(cellValue).toBe(validFormat);
});
