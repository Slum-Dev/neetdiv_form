/**
 * フォームのロール表記をRiot APIのロール表記に変換するマッピング
 */
const ROLE_MAP = {
  TOP: "TOP",
  JG: "JUNGLE",
  MID: "MIDDLE",
  BOT: "BOTTOM",
  SUP: "UTILITY",
};

/**
 * Riot APIのロール表記をフォームのロール表記に逆変換するマッピング
 */
const REVERSE_ROLE_MAP = {
  TOP: "TOP",
  JUNGLE: "JG",
  MIDDLE: "MID",
  BOTTOM: "BOT",
  UTILITY: "SUP",
};

/**
 * フォームのロール表記をRiot APIのロール表記に変換
 * @param {string} formRole - フォームでのロール（TOP, JG, MID, BOT, SUP）
 * @returns {string} Riot APIでのロール（TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY）
 */
export function mapFormRoleToAPI(formRole) {
  if (!formRole) {
    return "";
  }

  const upperRole = formRole.toUpperCase();
  return ROLE_MAP[upperRole] || formRole;
}

/**
 * Riot APIのロール表記をフォームのロール表記に変換
 * @param {string} apiRole - Riot APIでのロール
 * @returns {string} フォームでのロール
 */
export function mapAPIRoleToForm(apiRole) {
  if (!apiRole) {
    return "";
  }

  const upperRole = apiRole.toUpperCase();
  return REVERSE_ROLE_MAP[upperRole] || apiRole;
}

/**
 * 有効なフォームロールかどうかを検証
 * @param {string} role - 検証するロール
 * @returns {boolean} 有効なロールの場合true
 */
export function isValidFormRole(role) {
  if (!role) {
    return false;
  }

  const upperRole = role.toUpperCase();
  return Object.keys(ROLE_MAP).includes(upperRole);
}

/**
 * 有効なAPIロールかどうかを検証
 * @param {string} role - 検証するロール
 * @returns {boolean} 有効なAPIロールの場合true
 */
export function isValidAPIRole(role) {
  if (!role) {
    return false;
  }

  const upperRole = role.toUpperCase();
  return Object.values(ROLE_MAP).includes(upperRole);
}

/**
 * 全てのフォームロールを取得
 * @returns {string[]} フォームロールの配列
 */
export function getAllFormRoles() {
  return Object.keys(ROLE_MAP);
}

/**
 * 全てのAPIロールを取得
 * @returns {string[]} APIロールの配列
 */
export function getAllAPIRoles() {
  return Object.values(ROLE_MAP);
}

/**
 * ロールの表示名を取得（日本語対応）
 * @param {string} role - ロール（フォーム形式またはAPI形式）
 * @returns {string} 表示名
 */
export function getRoleDisplayName(role) {
  const roleDisplayNames = {
    TOP: "トップ",
    JG: "ジャングル",
    JUNGLE: "ジャングル",
    MID: "ミッド",
    MIDDLE: "ミッド",
    BOT: "ボット",
    BOTTOM: "ボット",
    SUP: "サポート",
    UTILITY: "サポート",
  };

  if (!role) {
    return "不明";
  }

  const upperRole = role.toUpperCase();
  return roleDisplayNames[upperRole] || role;
}

/**
 * ロール統計用の空のオブジェクトを作成
 * @returns {Object} APIロールをキーとした統計オブジェクト
 */
export function createRoleStatistics() {
  return {
    TOP: 0,
    JUNGLE: 0,
    MIDDLE: 0,
    BOTTOM: 0,
    UTILITY: 0,
  };
}
