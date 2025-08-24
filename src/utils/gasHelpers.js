/**
 * Google Apps Script関連のヘルパー関数
 */

/**
 * Riot APIキーを取得
 * @returns {string} APIキー
 * @throws {Error} APIキーが設定されていない場合
 */
export function getApiKey() {
  const apiKey = PropertiesService.getScriptProperties().getProperty("API_KEY");
  if (!apiKey) {
    throw new Error(
      "API_KEYが設定されていません。スクリプトプロパティを確認してください。",
    );
  }
  return apiKey;
}
