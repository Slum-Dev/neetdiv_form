import { describe, expect, it, vi } from "vitest";
import { MockSpreadsheetService } from "../__mocks__/SpreadsheetService.js";
import { SpreadsheetServiceImpl as SpreadsheetService } from "./SpreadsheetService.js";

// Google Sheetsのモックオブジェクト
const createMockSheet = () => ({
  // getLastRow: vi.fn(),
  // getLastColumn: vi.fn(),
  getRange: vi.fn(),
  // deleteRows: vi.fn(),
  // clear: vi.fn(),
  // insertRowsAfter: vi.fn(),
});

const createMockRange = (value = "") => ({
  getValue: vi.fn(() => value),
  setValue: vi.fn(),
  // setFormula: vi.fn(),
  // getValues: vi.fn(() => [[value]]),
  // setValues: vi.fn(),
  // setBackground: vi.fn(),
  // setFontWeight: vi.fn(),
  // setFontStyle: vi.fn(),
  // setFontColor: vi.fn(),
});

type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

describe("SpreadsheetService", () => {
  describe("getCellValue", () => {
    it("指定セルの値を取得", () => {
      const mockSheet = createMockSheet();
      const service = new SpreadsheetService(mockSheet as unknown as Sheet);

      const mockRange = createMockRange("test value");
      mockSheet.getRange.mockReturnValue(mockRange);

      const result = service.getCellValue(5, 3);

      expect(result).toBe("test value");
      expect(mockSheet.getRange).toHaveBeenCalledWith(5, 3);
      expect(mockRange.getValue).toHaveBeenCalled();
    });
  });

  describe("setCellValue", () => {
    it("指定セルに値を設定", () => {
      const mockSheet = createMockSheet();
      const service = new SpreadsheetService(mockSheet as unknown as Sheet);

      const mockRange = createMockRange();
      mockSheet.getRange.mockReturnValue(mockRange);

      service.setCellValue(5, 3, "new value");

      expect(mockSheet.getRange).toHaveBeenCalledWith(5, 3);
      expect(mockRange.setValue).toHaveBeenCalledWith("new value");
    });
  });

  describe("setHyperlink", () => {
    it("ハイパーリンクを設定（ラベルあり）", () => {
      const mockSheet = createMockSheet();
      const service = new SpreadsheetService(mockSheet as unknown as Sheet);

      const mockRange = createMockRange();
      mockSheet.getRange.mockReturnValue(mockRange);

      service.setHyperlink(5, 3, "https://example.com", "Example");

      expect(mockSheet.getRange).toHaveBeenCalledWith(5, 3);
      expect(mockRange.setValue).toHaveBeenCalledWith(
        '=HYPERLINK("https://example.com", "Example")',
      );
    });

    it("ハイパーリンクを設定（ラベルなし）", () => {
      const mockSheet = createMockSheet();
      const service = new SpreadsheetService(mockSheet as unknown as Sheet);

      const mockRange = createMockRange();
      mockSheet.getRange.mockReturnValue(mockRange);

      service.setHyperlink(5, 3, "https://example.com");

      expect(mockRange.setValue).toHaveBeenCalledWith(
        '=HYPERLINK("https://example.com", "https://example.com")',
      );
    });
  });

  // describe("getRangeValues", () => {
  //   it("範囲の値を2次元配列で取得", () => {
  //     const mockSheet = createMockSheet();
  //     const service = new SpreadsheetService(mockSheet as unknown as Sheet);

  //     const mockValues = [
  //       ["A1", "B1", "C1"],
  //       ["A2", "B2", "C2"],
  //     ];
  //     const mockRange = {
  //       getValues: vi.fn(() => mockValues),
  //     };
  //     mockSheet.getRange.mockReturnValue(mockRange);

  //     const result = service.getRangeValues(1, 1, 2, 3);

  //     expect(result).toEqual(mockValues);
  //     expect(mockSheet.getRange).toHaveBeenCalledWith(1, 1, 2, 3);
  //   });
  // });

  // describe("setRangeValues", () => {
  //   it("範囲に値を一括設定", () => {
  //     const mockSheet = createMockSheet();
  //     const service = new SpreadsheetService(mockSheet as unknown as Sheet);

  //     const mockRange = {
  //       setValues: vi.fn(),
  //     };
  //     mockSheet.getRange.mockReturnValue(mockRange);

  //     const values = [
  //       ["A1", "B1"],
  //       ["A2", "B2"],
  //     ];

  //     service.setRangeValues(1, 1, values);

  //     expect(mockSheet.getRange).toHaveBeenCalledWith(1, 1, 2, 2);
  //     expect(mockRange.setValues).toHaveBeenCalledWith(values);
  //   });

  //   it("空配列の場合は何もしない", () => {
  //     const mockSheet = createMockSheet();
  //     const service = new SpreadsheetService(mockSheet as unknown as Sheet);

  //     service.setRangeValues(1, 1, []);
  //     expect(mockSheet.getRange).not.toHaveBeenCalled();
  //   });
  // });

  // describe("getRowValues", () => {
  //   it("行全体の値を取得", () => {
  //     const mockSheet = createMockSheet();
  //     const service = new SpreadsheetService(mockSheet as unknown as Sheet);

  //     mockSheet.getLastColumn.mockReturnValue(5);
  //     const mockRange = {
  //       getValues: vi.fn(() => [["A", "B", "C", "D", "E"]]),
  //     };
  //     mockSheet.getRange.mockReturnValue(mockRange);

  //     const result = service.getRowValues(3);

  //     expect(result).toEqual(["A", "B", "C", "D", "E"]);
  //     expect(mockSheet.getRange).toHaveBeenCalledWith(3, 1, 1, 5);
  //   });
  // });

  // describe("setCellBackground", () => {
  //   it("セルの背景色を設定", () => {
  //     const mockSheet = createMockSheet();
  //     const service = new SpreadsheetService(mockSheet as unknown as Sheet);

  //     const mockRange = {
  //       setBackground: vi.fn(),
  //     };
  //     mockSheet.getRange.mockReturnValue(mockRange);

  //     service.setCellBackground(5, 3, "#FF0000");

  //     expect(mockSheet.getRange).toHaveBeenCalledWith(5, 3);
  //     expect(mockRange.setBackground).toHaveBeenCalledWith("#FF0000");
  //   });
  // });

  // describe("setCellFontStyle", () => {
  //   it("フォントスタイルを全て設定", () => {
  //     const mockSheet = createMockSheet();
  //     const service = new SpreadsheetService(mockSheet as unknown as Sheet);

  //     const mockRange = {
  //       setFontWeight: vi.fn(),
  //       setFontStyle: vi.fn(),
  //       setFontColor: vi.fn(),
  //     };
  //     mockSheet.getRange.mockReturnValue(mockRange);

  //     service.setCellFontStyle(5, 3, {
  //       bold: true,
  //       italic: false,
  //       color: "#0000FF",
  //     });

  //     expect(mockRange.setFontWeight).toHaveBeenCalledWith("bold");
  //     expect(mockRange.setFontStyle).toHaveBeenCalledWith("normal");
  //     expect(mockRange.setFontColor).toHaveBeenCalledWith("#0000FF");
  //   });

  //   it("部分的なスタイル設定", () => {
  //     const mockSheet = createMockSheet();
  //     const service = new SpreadsheetService(mockSheet as unknown as Sheet);

  //     const mockRange = {
  //       setFontWeight: vi.fn(),
  //       setFontStyle: vi.fn(),
  //       setFontColor: vi.fn(),
  //     };
  //     mockSheet.getRange.mockReturnValue(mockRange);

  //     service.setCellFontStyle(5, 3, { bold: true });

  //     expect(mockRange.setFontWeight).toHaveBeenCalledWith("bold");
  //     expect(mockRange.setFontStyle).not.toHaveBeenCalled();
  //     expect(mockRange.setFontColor).not.toHaveBeenCalled();
  //   });
  // });

  // describe("insertRowsAfter", () => {
  //   it("指定行の後に行を挿入", () => {
  //     const mockSheet = createMockSheet();
  //     const service = new SpreadsheetService(mockSheet as unknown as Sheet);

  //     service.insertRowsAfter(5, 3);
  //     expect(mockSheet.insertRowsAfter).toHaveBeenCalledWith(5, 3);
  //   });

  //   it("デフォルトで1行挿入", () => {
  //     const mockSheet = createMockSheet();
  //     const service = new SpreadsheetService(mockSheet as unknown as Sheet);

  //     service.insertRowsAfter(5);
  //     expect(mockSheet.insertRowsAfter).toHaveBeenCalledWith(5, 1);
  //   });
  // });

  // describe("clearSheet", () => {
  //   it("ヘッダー行を保持してクリア", () => {
  //     const mockSheet = createMockSheet();
  //     const service = new SpreadsheetService(mockSheet as unknown as Sheet);

  //     mockSheet.getLastRow.mockReturnValue(10);

  //     service.clearSheet(true);

  //     expect(mockSheet.deleteRows).toHaveBeenCalledWith(2, 9);
  //     expect(mockSheet.clear).not.toHaveBeenCalled();
  //   });

  //   it("1行しかない場合は何もしない", () => {
  //     const mockSheet = createMockSheet();
  //     const service = new SpreadsheetService(mockSheet as unknown as Sheet);

  //     mockSheet.getLastRow.mockReturnValue(1);

  //     service.clearSheet(true);

  //     expect(mockSheet.deleteRows).not.toHaveBeenCalled();
  //     expect(mockSheet.clear).not.toHaveBeenCalled();
  //   });

  //   it("全てクリア", () => {
  //     const mockSheet = createMockSheet();
  //     const service = new SpreadsheetService(mockSheet as unknown as Sheet);

  //     service.clearSheet(false);

  //     expect(mockSheet.clear).toHaveBeenCalled();
  //     expect(mockSheet.deleteRows).not.toHaveBeenCalled();
  //   });
  // });
});

describe("MockSpreadsheetService", () => {
  it("値の設定と取得", () => {
    const mockService = new MockSpreadsheetService();
    mockService.setCellValue(5, 3, "test value");
    expect(mockService.getCellValue(5, 3)).toBe("test value");
  });

  it("存在しないセルは空文字を返す", () => {
    const mockService = new MockSpreadsheetService();
    expect(mockService.getCellValue(10, 10)).toBe("");
  });

  it("最終行を更新", () => {
    const mockService = new MockSpreadsheetService();
    expect(mockService.getLastRow()).toBe(1);

    mockService.setCellValue(10, 1, "value");
    expect(mockService.getLastRow()).toBe(10);

    mockService.setCellValue(5, 1, "value");
    expect(mockService.getLastRow()).toBe(10);
  });

  it("ハイパーリンクの設定", () => {
    const mockService = new MockSpreadsheetService();
    mockService.setHyperlink(5, 3, "https://example.com", "Example");
    expect(mockService.getCellValue(5, 3)).toBe(
      '=HYPERLINK("https://example.com", "Example")',
    );
  });

  // it("範囲値の設定と取得", () => {
  //   const mockService = new MockSpreadsheetService();
  //   const values = [
  //     ["A1", "B1"],
  //     ["A2", "B2"],
  //   ];

  //   mockService.setRangeValues(1, 1, values);

  //   expect(mockService.getCellValue(1, 1)).toBe("A1");
  //   expect(mockService.getCellValue(1, 2)).toBe("B1");
  //   expect(mockService.getCellValue(2, 1)).toBe("A2");
  //   expect(mockService.getCellValue(2, 2)).toBe("B2");

  //   const retrieved = mockService.getRangeValues(1, 1, 2, 2);
  //   expect(retrieved).toEqual(values);
  // });

  // it("行値の取得", () => {
  //   const mockService = new MockSpreadsheetService();
  //   mockService.setCellValue(3, 1, "A");
  //   mockService.setCellValue(3, 2, "B");
  //   mockService.setCellValue(3, 3, "C");

  //   const rowValues = mockService.getRowValues(3);
  //   expect(rowValues[0]).toBe("A");
  //   expect(rowValues[1]).toBe("B");
  //   expect(rowValues[2]).toBe("C");
  // });

  // it("背景色の設定", () => {
  //   const mockService = new MockSpreadsheetService();
  //   mockService.setCellBackground(5, 3, "#FF0000");
  //   expect(mockService.backgrounds["5,3"]).toBe("#FF0000");
  // });

  // it("フォントスタイルの設定", () => {
  //   const mockService = new MockSpreadsheetService();
  //   const style = { bold: true, color: "#0000FF" };
  //   mockService.setCellFontStyle(5, 3, style);
  //   expect(mockService.fontStyles["5,3"]).toEqual(style);
  // });

  // it("行の挿入", () => {
  //   const mockService = new MockSpreadsheetService();
  //   expect(mockService.getLastRow()).toBe(1);
  //   mockService.insertRowsAfter(5, 3);
  //   expect(mockService.getLastRow()).toBe(4);
  // });

  // it("シートのクリア（ヘッダー保持）", () => {
  //   const mockService = new MockSpreadsheetService();
  //   mockService.setCellValue(1, 1, "Header1");
  //   mockService.setCellValue(1, 2, "Header2");
  //   mockService.setCellValue(2, 1, "Data1");
  //   mockService.setCellValue(3, 1, "Data2");

  //   mockService.clearSheet(true);

  //   expect(mockService.getCellValue(1, 1)).toBe("Header1");
  //   expect(mockService.getCellValue(1, 2)).toBe("Header2");
  //   expect(mockService.getCellValue(2, 1)).toBe("");
  //   expect(mockService.getLastRow()).toBe(1);
  // });

  // it("シートの完全クリア", () => {
  //   const mockService = new MockSpreadsheetService();
  //   mockService.setCellValue(1, 1, "Header");
  //   mockService.setCellValue(2, 1, "Data");
  //   mockService.setHyperlink(3, 1, "https://example.com");

  //   mockService.clearSheet(false);

  //   expect(mockService.getCellValue(1, 1)).toBe("");
  //   expect(mockService.getCellValue(2, 1)).toBe("");
  //   expect(mockService.formulas).toEqual({});
  //   expect(mockService.getLastRow()).toBe(0);
  // });
});
