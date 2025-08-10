import { FormSubmissionHandler } from './handlers/FormSubmissionHandler.js';
import { RiotAPIService } from './services/RiotAPIService.js';
import { SpreadsheetService } from './services/SpreadsheetService.js';
import { SHEET_NAME } from './config/constants.js';
import { getApiKey } from './utils/gasHelpers.js';

/**
 * Google Apps Scriptのトリガー関数
 * フォーム送信時のエントリーポイント
 * @param {Object} e - フォーム送信イベント
 */
function onFormSubmit(e) {
  try {
    // 依存性の初期化
    const apiKey = getApiKey();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    // サービスの初期化
    const spreadsheetService = new SpreadsheetService(sheet);
    const riotAPIService = new RiotAPIService(apiKey);
    
    // ハンドラーの作成と実行
    const handler = new FormSubmissionHandler(spreadsheetService, riotAPIService);
    handler.handle(e);
    
  } catch (error) {
    console.error('フォーム処理中にエラーが発生しました:', error);
    // エラーログをシートに記録することも検討
    throw error;
  }
}


// GASApp向けにexport（esbuildのIIFEで利用される）
export { onFormSubmit };
