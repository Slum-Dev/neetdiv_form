import type { SpreadsheetService } from "../handlers/FormSubmissionHandler.js";

export type CellValue = string | number | boolean | Date;

// export type FontStyle = {
//   bold?: boolean;
//   italic?: boolean;
//   color?: string;
// };

/**
 * Google Sheetsとの通信を管理するサービスクラス
 */
export class SpreadsheetServiceImpl implements SpreadsheetService {
  /**
   * @param sheet - Google Sheetsのシートオブジェクト
   */
  constructor(private sheet: GoogleAppsScript.Spreadsheet.Sheet) {}

  // /**
  //  * 最終行番号を取得
  //  * @returns 最終行番号
  //  */
  // getLastRow(): number {
  //   return this.sheet.getLastRow();
  // }

  /**
   * 特定のセルの値を取得
   * @param row - 行番号（1始まり）
   * @param column - 列番号（1始まり）
   * @returns セルの値
   */
  getCellValue(row: number, column: number): CellValue {
    return this.sheet.getRange(row, column).getValue();
  }

  /**
   * 特定のセルに値を設定
   * @param row - 行番号（1始まり）
   * @param column - 列番号（1始まり）
   * @param value - 設定する値
   */
  setCellValue(row: number, column: number, value: CellValue): void {
    this.sheet.getRange(row, column).setValue(value);
  }

  /**
   * 特定のセルにハイパーリンクを設定
   * @param row - 行番号（1始まり）
   * @param column - 列番号（1始まり）
   * @param url - リンクURL
   * @param label - 表示テキスト（省略時はURLを表示）
   */
  setHyperlink(row: number, column: number, url: string, label?: string): void {
    const displayText = label || url;
    const formula = `=HYPERLINK("${url}", "${displayText}")`;
    this.setCellValue(row, column, formula);
  }

  // /**
  //  * 複数のセルの値を一括で取得
  //  * @param row - 開始行番号（1始まり）
  //  * @param column - 開始列番号（1始まり）
  //  * @param numRows - 行数
  //  * @param numColumns - 列数
  //  * @returns 値の2次元配列
  //  */
  // getRangeValues(
  //   row: number,
  //   column: number,
  //   numRows: number,
  //   numColumns: number,
  // ): Array<Array<CellValue>> {
  //   return this.sheet.getRange(row, column, numRows, numColumns).getValues();
  // }

  // /**
  //  * 複数のセルに値を一括で設定
  //  * @param row - 開始行番号（1始まり）
  //  * @param column - 開始列番号（1始まり）
  //  * @param values - 設定する値の2次元配列
  //  */
  // setRangeValues(
  //   row: number,
  //   column: number,
  //   values: Array<Array<CellValue>>,
  // ): void {
  //   const numRows = values.length;
  //   const numColumns = values[0]?.length || 0;

  //   if (numRows > 0 && numColumns > 0) {
  //     this.sheet.getRange(row, column, numRows, numColumns).setValues(values);
  //   }
  // }

  // /**
  //  * 行全体を取得
  //  * @param row - 行番号（1始まり）
  //  * @returns 行の値の配列
  //  */
  // getRowValues(row: number): Array<CellValue> {
  //   const lastColumn = this.sheet.getLastColumn();
  //   return this.sheet
  //     .getRange(row, 1, 1, lastColumn)
  //     .getValues()[0] as Array<CellValue>;
  // }

  // /**
  //  * セルの背景色を設定
  //  * @param row - 行番号（1始まり）
  //  * @param column - 列番号（1始まり）
  //  * @param color - 色（例：'#FF0000' または 'red'）
  //  */
  // setCellBackground(row: number, column: number, color: string): void {
  //   this.sheet.getRange(row, column).setBackground(color);
  // }

  // /**
  //  * セルのフォントスタイルを設定
  //  * @param row - 行番号（1始まり）
  //  * @param column - 列番号（1始まり）
  //  * @param style - スタイルオプション
  //  * @param [style.bold] - 太字
  //  * @param [style.italic] - 斜体
  //  * @param [style.color] - フォントカラー
  //  */
  // setCellFontStyle(row: number, column: number, style: FontStyle): void {
  //   const range = this.sheet.getRange(row, column);

  //   if (style.bold !== undefined) {
  //     range.setFontWeight(style.bold ? "bold" : "normal");
  //   }
  //   if (style.italic !== undefined) {
  //     range.setFontStyle(style.italic ? "italic" : "normal");
  //   }
  //   if (style.color) {
  //     range.setFontColor(style.color);
  //   }
  // }

  // /**
  //  * 新しい行を挿入
  //  * @param afterRow - この行の後に挿入（1始まり）
  //  * @param numRows - 挿入する行数
  //  */
  // insertRowsAfter(afterRow: number, numRows: number = 1): void {
  //   this.sheet.insertRowsAfter(afterRow, numRows);
  // }

  // /**
  //  * シートをクリア
  //  * @param preserveHeaders - ヘッダー行を保持するか
  //  */
  // clearSheet(preserveHeaders = true): void {
  //   if (preserveHeaders) {
  //     const lastRow = this.getLastRow();
  //     if (lastRow > 1) {
  //       this.sheet.deleteRows(2, lastRow - 1);
  //     }
  //   } else {
  //     this.sheet.clear();
  //   }
  // }
}
