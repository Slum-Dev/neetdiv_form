/**
 * アプリケーション全体で使用される定数
 */

/**
 * Google Sheetsの設定
 */
export const SHEET_NAME = "フォームの回答 1";

/**
 * スプレッドシートの列インデックス（1始まり）
 */
export const COLUMN_INDEXES = {
  // フォーム入力項目
  GAME_NANE: 3, // サモナー名
  TAG_LINE: 4, // サモナーID(タグライン)
  ROLE: 7, // 宣言レーン
  OPGG_URL: 8, // OPGG URL

  // 自動生成項目
  SUMMONER_NAME: 10, // サモナー名#タグライン（コピペ用）
  LEVEL: 11, // サモナーレベル
  SOLO_RANK: 12, // ソロランク
  FLEX_RANK: 13, // フレックスランク
  PUUID: 14, // PUUID（サブ垢確認用）

  // 将来の拡張用（マッチ履歴）
  MATCH_COUNT: 15, // 宣言レーンのマッチ数
  CHAMPION_POOL_START: 16, // チャンピオンプール開始列
} as const;

/**
 * Riot APIエンドポイント
 */
export const API_ENDPOINTS = {
  BASE_URL_JP: "https://jp1.api.riotgames.com",
  BASE_URL_ASIA: "https://asia.api.riotgames.com",
  BASE_URL_AMERICAS: "https://americas.api.riotgames.com",
  BASE_URL_EUROPE: "https://europe.api.riotgames.com",
  BASE_URL_SEA: "https://sea.api.riotgames.com",
} as const;

/**
 * APIレート制限設定
 */
export const RATE_LIMITS = {
  REQUESTS_PER_SECOND: 20,
  REQUESTS_PER_TWO_MINUTES: 100,
  RETRY_DELAY_MS: 1000,
  MAX_RETRIES: 3,
} as const;

/**
 * ランクティア
 */
export const RANK_TIERS = {
  IRON: "IRON",
  BRONZE: "BRONZE",
  SILVER: "SILVER",
  GOLD: "GOLD",
  PLATINUM: "PLATINUM",
  EMERALD: "EMERALD",
  DIAMOND: "DIAMOND",
  MASTER: "MASTER",
  GRANDMASTER: "GRANDMASTER",
  CHALLENGER: "CHALLENGER",
} as const;

/**
 * ランクディビジョン
 */
export const RANK_DIVISIONS = {
  I: "I",
  II: "II",
  III: "III",
  IV: "IV",
} as const;

/**
 * キューのタイプ
 */
export const QUEUE_TYPES = {
  RANKED_SOLO_5x5: "RANKED_SOLO_5x5",
  RANKED_FLEX_SR: "RANKED_FLEX_SR",
} as const;

/**
 * エラーメッセージ
 */
export const ERROR_MESSAGES = {
  API_KEY_NOT_SET:
    "API_KEYが設定されていません。スクリプトプロパティを確認してください。",
  SHEET_NOT_FOUND: "指定されたシートが見つかりません。",
  INVALID_URL: "OPGG URLの形式が正しくありません。",
  ACCOUNT_NOT_FOUND:
    "Riotアカウントの問い合わせに失敗しました。OPGG URLが正しいか確認してください。",
  LEVEL_FETCH_FAILED: "サモナーレベルの取得に失敗しました。",
  RANK_FETCH_FAILED: "ランクの取得に失敗しました。",
  NETWORK_ERROR: "ネットワークエラーが発生しました。",
  RATE_LIMIT_EXCEEDED:
    "APIレート制限に達しました。しばらく待ってから再試行してください。",
} as const;

/**
 * デフォルト値
 */
export const DEFAULT_VALUES = {
  NO_INFO: "情報なし",
  UNRANKED: "アンランク",
  DEFAULT_REGION: "jp",
  DEFAULT_TAG_LINE: "JP1",
  MIN_RANKED_LEVEL: 30,
} as const;

/**
 * チャンピオンプール表示設定
 */
export const CHAMPION_POOL_CONFIG = {
  MAX_CHAMPIONS_TO_DISPLAY: 5,
  MIN_GAMES_TO_INCLUDE: 2,
} as const;

/**
 * マッチ履歴取得設定
 */
export const MATCH_HISTORY_CONFIG = {
  DEFAULT_COUNT: 20,
  MAX_COUNT: 100,
  START_INDEX: 0,
} as const;
