/**
 * Google Sheetsとの通信を管理するサービスクラス
 */
export class SpreadsheetService {
  /**
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Google Sheetsのシートオブジェクト
   */
  constructor(private sheet: GoogleAppsScript.Spreadsheet.Sheet | any) {
    if (!sheet) {
      throw new Error("Sheet object is required");
    }
    this.sheet = sheet;
  }

  /**
   * 最終行番号を取得
   * @returns {number} 最終行番号
   */
  getLastRow() {
    return this.sheet.getLastRow();
  }

  /**
   * 特定のセルの値を取得
   * @param {number} row - 行番号（1始まり）
   * @param {number} column - 列番号（1始まり）
   * @returns {any} セルの値
   */
  getCellValue(row: number, column: number): any {
    return this.sheet.getRange(row, column).getValue();
  }

  /**
   * 特定のセルに値を設定
   * @param {number} row - 行番号（1始まり）
   * @param {number} column - 列番号（1始まり）
   * @param {any} value - 設定する値
   */
  setCellValue(row: number, column: number, value: any): void {
    this.sheet.getRange(row, column).setValue(value);
  }

  /**
   * 特定のセルにハイパーリンクを設定
   * @param {number} row - 行番号（1始まり）
   * @param {number} column - 列番号（1始まり）
   * @param {string} url - リンクURL
   * @param {string} [label] - 表示テキスト（省略時はURLを表示）
   */
  setHyperlink(
    row: number,
    column: number,
    url: string,
    label: string | null = null,
  ): void {
    const displayText = label || url;
    const formula = `=HYPERLINK("${url}", "${displayText}")`;
    this.sheet.getRange(row, column).setFormula(formula);
  }

  /**
   * 複数のセルの値を一括で取得
   * @param {number} row - 開始行番号（1始まり）
   * @param {number} column - 開始列番号（1始まり）
   * @param {number} numRows - 行数
   * @param {number} numColumns - 列数
   * @returns {Array<Array<any>>} 値の2次元配列
   */
  getRangeValues(
    row: number,
    column: number,
    numRows: number,
    numColumns: number,
  ) {
    return this.sheet.getRange(row, column, numRows, numColumns).getValues();
  }

  /**
   * 複数のセルに値を一括で設定
   * @param {number} row - 開始行番号（1始まり）
   * @param {number} column - 開始列番号（1始まり）
   * @param {Array<Array<any>>} values - 設定する値の2次元配列
   */
  setRangeValues(row: number, column: number, values: Array<Array<any>>) {
    const numRows = values.length;
    const numColumns = values[0]?.length || 0;

    if (numRows > 0 && numColumns > 0) {
      this.sheet.getRange(row, column, numRows, numColumns).setValues(values);
    }
  }

  /**
   * 行全体を取得
   * @param {number} row - 行番号（1始まり）
   * @returns {Array<any>} 行の値の配列
   */
  getRowValues(row: number): Array<any> | undefined {
    const lastColumn = this.sheet.getLastColumn();
    return this.sheet.getRange(row, 1, 1, lastColumn).getValues()[0];
  }

  /**
   * セルの背景色を設定
   * @param {number} row - 行番号（1始まり）
   * @param {number} column - 列番号（1始まり）
   * @param {string} color - 色（例：'#FF0000' または 'red'）
   */
  setCellBackground(row: number, column: number, color: string) {
    this.sheet.getRange(row, column).setBackground(color);
  }

  /**
   * セルのフォントスタイルを設定
   * @param {number} row - 行番号（1始まり）
   * @param {number} column - 列番号（1始まり）
   * @param {Object} style - スタイルオプション
   * @param {boolean} [style.bold] - 太字
   * @param {boolean} [style.italic] - 斜体
   * @param {string} [style.color] - フォントカラー
   */
  setCellFontStyle(row: number, column: number, style: any) {
    const range = this.sheet.getRange(row, column);

    if (style.bold !== undefined) {
      range.setFontWeight(style.bold ? "bold" : "normal");
    }
    if (style.italic !== undefined) {
      range.setFontStyle(style.italic ? "italic" : "normal");
    }
    if (style.color) {
      range.setFontColor(style.color);
    }
  }

  /**
   * 新しい行を挿入
   * @param {number} afterRow - この行の後に挿入（1始まり）
   * @param {number} [numRows=1] - 挿入する行数
   */
  insertRowsAfter(afterRow: number, numRows: number = 1) {
    this.sheet.insertRowsAfter(afterRow, numRows);
  }

  /**
   * シートをクリア
   * @param {boolean} [preserveHeaders=true] - ヘッダー行を保持するか
   */
  clearSheet(preserveHeaders = true) {
    if (preserveHeaders) {
      const lastRow = this.getLastRow();
      if (lastRow > 1) {
        this.sheet.deleteRows(2, lastRow - 1);
      }
    } else {
      this.sheet.clear();
    }
  }
}
