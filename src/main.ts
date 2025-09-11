import { SHEET_NAME } from "./config/constants.js";
import { FormRetryHandler } from "./handlers/FormRetryHandler.js";
import { FormSubmissionHandler } from "./handlers/FormSubmissionHandler.js";
import { RiotAPIServiceImpl } from "./services/RiotAPIService.js";
import { SpreadsheetServiceImpl } from "./services/SpreadsheetService.js";
import { getApiKey } from "./utils/gasHelpers.js";

/**
 * Google Apps Scriptのトリガー関数
 * フォーム送信時のエントリーポイント
 * @param e - フォーム送信イベント
 */
function onFormSubmit(e: GoogleAppsScript.Events.SheetsOnFormSubmit) {
  try {
    // 依存性の初期化
    const apiKey = getApiKey();
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (sheet == null) {
      throw new Error("シートを取得できませんでした");
    }

    // サービスの初期化
    const spreadsheetService = new SpreadsheetServiceImpl(sheet);
    const riotAPIService = new RiotAPIServiceImpl(apiKey);

    // ハンドラーの作成と実行
    const handler = new FormSubmissionHandler(
      spreadsheetService,
      riotAPIService,
    );
    handler.handle(e.range.getRow());

    // 失敗した項目を再取得
    const retryHandler = new FormRetryHandler(
      spreadsheetService,
      riotAPIService,
    );
    retryHandler.handle();
  } catch (error) {
    console.error("フォーム処理中にエラーが発生しました:", error);
    // エラーログをシートに記録することも検討
    throw error;
  }
}

globalThis.onFormSubmit = onFormSubmit;
