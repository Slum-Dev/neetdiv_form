/**
 * テスト用のモックサービス
 */
type FontStyle = {
  bold?: boolean;
  italic?: boolean;
  color?: string;
};

export class MockSpreadsheetService {
  public data: Record<string, any>;
  public lastRow: number;
  public formulas: Record<string, string>;
  public backgrounds: Record<string, string>;
  public fontStyles: Record<string, FontStyle>;

  constructor() {
    this.data = {};
    this.lastRow = 1;
    this.formulas = {};
    this.backgrounds = {};
    this.fontStyles = {};
  }

  getLastRow() {
    return this.lastRow;
  }

  getCellValue(row: number, column: number) {
    const key = `${row},${column}`;
    return this.data[key] || "";
  }

  setCellValue(row: number, column: number, value: any): void {
    const key = `${row},${column}`;
    this.data[key] = value;
    this.lastRow = Math.max(this.lastRow, row);
  }

  setHyperlink(
    row: number,
    column: number,
    url: string,
    label: string | null = null,
  ) {
    const key = `${row},${column}`;
    this.formulas[key] = `=HYPERLINK("${url}", "${label || url}")`;
  }

  getRangeValues(
    row: number,
    column: number,
    numRows: number,
    numColumns: number,
  ) {
    const values = [];
    for (let r = 0; r < numRows; r++) {
      const rowValues = [];
      for (let c = 0; c < numColumns; c++) {
        rowValues.push(this.getCellValue(row + r, column + c));
      }
      values.push(rowValues);
    }
    return values;
  }

  setRangeValues(row: number, column: number, values: any[][]) {
    for (const [r, rowValues] of values.entries()) {
      for (const [c, v] of rowValues.entries()) {
        this.setCellValue(row + r, column + c, v);
      }
    }
  }

  getRowValues(row: number) {
    const values = [];
    for (let col = 1; col <= 20; col++) {
      values.push(this.getCellValue(row, col));
    }
    return values;
  }

  setCellBackground(row: number, column: number, color: string) {
    const key = `${row},${column}`;
    this.backgrounds[key] = color;
  }

  setCellFontStyle(row: number, column: number, style: FontStyle) {
    const key = `${row},${column}`;
    this.fontStyles[key] = style;
  }

  insertRowsAfter(_afterRow: number, numRows: number = 1) {
    this.lastRow += numRows;
  }

  clearSheet(preserveHeaders: boolean = true) {
    if (preserveHeaders) {
      const headerData: Record<string, any> = {};
      for (const key in this.data) {
        if (key.startsWith("1,")) {
          headerData[key] = this.data[key];
        }
      }
      this.data = headerData;
      this.lastRow = 1;
    } else {
      this.data = {};
      this.lastRow = 0;
    }
    this.formulas = {};
    this.backgrounds = {};
    this.fontStyles = {};
  }
}
