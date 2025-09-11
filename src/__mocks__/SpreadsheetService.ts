import type { SpreadsheetService } from "../handlers/FormSubmissionHandler.js";
import type { CellValue } from "../services/SpreadsheetService.js";

/**
 * テスト用のモックサービス
 */
export class MockSpreadsheetService implements SpreadsheetService {
  /**
   * [
   *  [A1, B1, C1],
   *  [A2, B2, C2]
   * ]
   */
  public data: Array<Array<CellValue>>;
  // public backgrounds: Record<string, string>;
  // public fontStyles: Record<string, FontStyle>;

  constructor() {
    this.data = [[]];
    // this.backgrounds = {};
    // this.fontStyles = {};
  }

  getLastRow() {
    return this.data.length;
  }

  getCellValue(row: number, column: number) {
    const value = this.data.at(row - 1)?.at(column - 1);
    return value ?? "";
  }

  setCellValue(row: number, column: number, value: CellValue): void {
    if (row <= 0 || column <= 0) {
      throw new Error("rowとcolumnは1以上");
    }
    if (this.data[row - 1] === undefined) {
      // insert new row
      this.data[row - 1] = [];
    }
    // insert value at row
    // @ts-expect-error "this.data[row - 1]" はdefined
    this.data[row - 1][column - 1] = value;
  }

  setHyperlink(row: number, column: number, url: string, label?: string) {
    this.setCellValue(row, column, `=HYPERLINK("${url}", "${label || url}")`);
  }

  findCell(findText: string): { row: number; column: number }[] {
    const result: { row: number; column: number }[] = [];
    for (const [rowIdx, _row] of this.data.entries()) {
      if (_row === undefined) continue; // emptyチェック
      for (const [colIdx, cellValue] of _row.entries()) {
        if (cellValue === undefined) continue; // emptyチェック
        if (String(cellValue).includes(findText)) {
          result.push({ row: rowIdx + 1, column: colIdx + 1 });
        }
      }
    }
    return result;
  }

  // getRangeValues(
  //   row: number,
  //   column: number,
  //   numRows: number,
  //   numColumns: number,
  // ) {
  //   const values = [];
  //   for (let r = 0; r < numRows; r++) {
  //     const rowValues = [];
  //     for (let c = 0; c < numColumns; c++) {
  //       rowValues.push(this.getCellValue(row + r, column + c));
  //     }
  //     values.push(rowValues);
  //   }
  //   return values;
  // }

  // setRangeValues(row: number, column: number, values: CellValue[][]) {
  //   for (const [r, rowValues] of values.entries()) {
  //     for (const [c, v] of rowValues.entries()) {
  //       this.setCellValue(row + r, column + c, v);
  //     }
  //   }
  // }

  // getRowValues(row: number) {
  //   const values = [];
  //   for (let col = 1; col <= 20; col++) {
  //     values.push(this.getCellValue(row, col));
  //   }
  //   return values;
  // }

  // setCellBackground(row: number, column: number, color: string) {
  //   const key = `${row},${column}`;
  //   this.backgrounds[key] = color;
  // }

  // setCellFontStyle(row: number, column: number, style: FontStyle) {
  //   const key = `${row},${column}`;
  //   this.fontStyles[key] = style;
  // }

  // insertRowsAfter(_afterRow: number, numRows: number = 1) {
  //   this.lastRow += numRows;
  // }

  // clearSheet(preserveHeaders: boolean = true) {
  //   if (preserveHeaders) {
  //     const headerData: Record<string, CellValue> = {};
  //     for (const [key, value] of Object.entries(this.data)) {
  //       if (key.startsWith("1,")) {
  //         headerData[key] = value;
  //       }
  //     }
  //     this.data = headerData;
  //     this.lastRow = 1;
  //   } else {
  //     this.data = {};
  //     this.lastRow = 0;
  //   }
  //   this.backgrounds = {};
  //   this.fontStyles = {};
  // }
}
