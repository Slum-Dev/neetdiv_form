import { FORM_SHEET_NAME } from "./config/constants.js";
import { FormRetryHandler } from "./handlers/FormRetryHandler.js";
import { FormSubmissionHandler } from "./handlers/FormSubmissionHandler.js";
import { MenuActionHandler } from "./handlers/MenuActionHandler.js";
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
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FORM_SHEET_NAME);
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

/**
 * Google Apps Scriptのトリガー関数
 * スプレッドシートを開くときに実行される
 */
function onOpen() {
  SpreadsheetApp.getActiveSpreadsheet().addMenu("ニーディビ用メニュー", [
    { name: "すべて消す", functionName: "removeAllFormEntry" },
    {
      name: "指定日時より前のを消す",
      functionName: "showRemoveBeforeDialog",
    },
    { name: "ドラフトクリア", functionName: "clearDraft" },
  ]);
}

globalThis.onFormSubmit = onFormSubmit;
globalThis.onOpen = onOpen;

/**
 * カスタムメニューの関数
 */
const menuActionHandler = new MenuActionHandler();

function clearDraft() {
  menuActionHandler.clearDraft();
}

function removeAllFormEntry() {
  menuActionHandler.removeAllFormEntry();
}

function sendToRemoveDataByDatetime(value: string | null | undefined) {
  return menuActionHandler.sendToRemoveDataByDatetime(value);
}

function showRemoveBeforeDialog() {
  menuActionHandler.showRemoveBeforeDialog();
}

globalThis.clearDraft = clearDraft;
globalThis.removeAllFormEntry = removeAllFormEntry;
globalThis.sendToRemoveDataByDatetime = sendToRemoveDataByDatetime;
globalThis.showRemoveBeforeDialog = showRemoveBeforeDialog;
