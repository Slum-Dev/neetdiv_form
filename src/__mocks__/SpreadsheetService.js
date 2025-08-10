/**
 * テスト用のモックサービス
 */
export class MockSpreadsheetService {
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

  getCellValue(row, column) {
    const key = `${row},${column}`;
    return this.data[key] || '';
  }

  setCellValue(row, column, value) {
    const key = `${row},${column}`;
    this.data[key] = value;
    this.lastRow = Math.max(this.lastRow, row);
  }

  setHyperlink(row, column, url, label = null) {
    const key = `${row},${column}`;
    this.formulas[key] = `=HYPERLINK("${url}", "${label || url}")`;
  }

  getRangeValues(row, column, numRows, numColumns) {
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

  setRangeValues(row, column, values) {
    for (let r = 0; r < values.length; r++) {
      for (let c = 0; c < values[r].length; c++) {
        this.setCellValue(row + r, column + c, values[r][c]);
      }
    }
  }

  getRowValues(row) {
    const values = [];
    for (let col = 1; col <= 20; col++) {
      values.push(this.getCellValue(row, col));
    }
    return values;
  }

  setCellBackground(row, column, color) {
    const key = `${row},${column}`;
    this.backgrounds[key] = color;
  }

  setCellFontStyle(row, column, style) {
    const key = `${row},${column}`;
    this.fontStyles[key] = style;
  }

  insertRowsAfter(afterRow, numRows = 1) {
    this.lastRow += numRows;
  }

  clearSheet(preserveHeaders = true) {
    if (preserveHeaders) {
      const headerData = {};
      for (const key in this.data) {
        if (key.startsWith('1,')) {
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