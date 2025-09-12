import {
  COLUMN_INDEXES,
  DRAFT_SHEET_NAME,
  FORM_SHEET_NAME,
  ROW_INDEXES,
} from "../config/constants.js";
import { parseFormsTimestamp } from "../utils/dateParser.js";

export class MenuActionHandler {
  /**
   * ドラフトをクリア
   */
  clearDraft() {
    DRAFT_SHEET_NAME.forEach((sheetName) => {
      const sheet =
        SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      if (sheet) {
        sheet
          .getRange(
            ROW_INDEXES.FORM_FIRST_ROW,
            COLUMN_INDEXES.DRAFT_SELECTED,
            996,
            1,
          )
          .clearContent();
      }
    });
  }

  /**
   * フォームエントリー履歴とドラフトを全削除
   */
  removeAllFormEntry() {
    const formSheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FORM_SHEET_NAME);
    if (!formSheet) {
      throw new Error("フォームシートが見つかりません");
    }
    const lastRow = formSheet.getLastRow();
    formSheet.deleteRows(
      ROW_INDEXES.FORM_FIRST_ROW,
      lastRow - ROW_INDEXES.FORM_FIRST_ROW + 1,
    );

    this.clearDraft();
  }

  /**
   * 指定した日時より前のエントリー履歴を削除
   * @param datetime 日時指定
   * @returns 削除した行数
   */
  deleteRowsOlderThan(datetime: Date): number {
    const formSheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FORM_SHEET_NAME);
    if (!formSheet) {
      throw new Error("フォームシートが見つかりません");
    }

    const lastRow = formSheet.getLastRow();
    if (lastRow < ROW_INDEXES.FORM_FIRST_ROW) {
      return 0;
    }

    const numRows = lastRow - ROW_INDEXES.FORM_FIRST_ROW + 1;
    const values = formSheet
      .getRange(ROW_INDEXES.FORM_FIRST_ROW, 1, numRows, 1)
      .getValues();
    const toDelete: number[] = [];

    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      if (!row) continue;

      const timestamp = row[COLUMN_INDEXES.TIMESTAMP];
      if (timestamp === "" || timestamp === null || timestamp === undefined)
        continue;
      let date: Date;
      if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = parseFormsTimestamp(String(timestamp).trim());
      }

      if (date.getTime() < datetime.getTime()) {
        toDelete.push(i + ROW_INDEXES.FORM_FIRST_ROW);
      }
    }

    // ループで行削除するのに逆順にしてからじゃないとズレる
    toDelete.reverse().forEach((rowIndex) => {
      formSheet.deleteRow(rowIndex);
    });

    return toDelete.length;
  }

  /**
   * ダイアログから日時指定を受け取って、指定した日時より古いエントリー履歴を削除し、ドラフト記録をクリア
   * @param value 入力値
   * @returns 削除した行数
   */
  sendToRemoveDataByDatetime(value: string | null | undefined) {
    if (!value) throw new Error("入力が空です");
    const datetime = parseFormsTimestamp(value);
    const deleted = this.deleteRowsOlderThan(datetime);
    this.clearDraft();
    return deleted;
  }

  /**
   * 指定日時より前のエントリー履歴削除のダイアログを表示
   */
  showRemoveBeforeDialog() {
    const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
    const defaultValue = Utilities.formatDate(
      new Date(),
      tz,
      "yyyy/MM/dd H:mm:ss",
    );

    const t = HtmlService.createTemplateFromFile("remove_before_dialog");

    t.defaultValue = defaultValue;

    const html = t.evaluate().setWidth(360).setHeight(180);
    SpreadsheetApp.getUi().showModalDialog(
      html,
      "指定日時より前のエントリー履歴削除",
    );
  }
}
