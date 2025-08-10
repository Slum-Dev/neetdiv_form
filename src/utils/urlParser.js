/**
 * OPGG URLを解析してサモナー情報を抽出
 * @param {string} opggUrl - OPGG URL
 * @returns {{summonerName: string, tagLine: string, cleanedUrl: string}} サモナー情報
 * @throws {Error} URLの解析に失敗した場合
 */
export function parseOpggUrl(opggUrl) {
  if (!opggUrl || typeof opggUrl !== 'string') {
    throw new Error('有効なURLを指定してください');
  }

  // URLのクレンジング（末尾の不要なパスを削除）
  const cleanedUrl = opggUrl.replace(/\/(champions|mastery|ingame)$/, "");
  
  // URLからサモナー情報部分を抽出
  let encodedSummonerNI = cleanedUrl.split("/").pop();
  
  if (!encodedSummonerNI) {
    throw new Error('URLからサモナー情報を抽出できません');
  }
  
  // クエリパラメータを削除
  if (encodedSummonerNI.includes("?")) {
    encodedSummonerNI = encodedSummonerNI.split("?")[0];
  }
  
  // サモナー名とタグラインを分離
  const [namePart, tagPart] = encodedSummonerNI.split("-");
  
  if (!namePart) {
    throw new Error('サモナー名が見つかりません');
  }
  
  // URLデコード
  const summonerName = decodeURIComponent(namePart);
  const tagLine = tagPart ? decodeURIComponent(tagPart) : 'JP1'; // デフォルトタグライン
  
  return {
    summonerName,
    tagLine,
    cleanedUrl
  };
}

/**
 * サモナー名とタグラインから表示名を生成
 * @param {string} summonerName - サモナー名
 * @param {string} tagLine - タグライン
 * @returns {string} 表示名（例：SummonerName#JP1）
 */
export function formatSummonerDisplayName(summonerName, tagLine) {
  return `${summonerName}#${tagLine}`;
}

/**
 * OPGG URLを構築
 * @param {string} summonerName - サモナー名
 * @param {string} tagLine - タグライン
 * @param {string} [region='jp'] - リージョン
 * @returns {string} OPGG URL
 */
export function buildOpggUrl(summonerName, tagLine, region = 'jp') {
  const encodedName = encodeURIComponent(summonerName);
  const encodedTag = encodeURIComponent(tagLine);
  return `https://www.op.gg/summoners/${region}/${encodedName}-${encodedTag}`;
}

/**
 * URLが有効なOPGG URLかどうかを検証
 * @param {string} url - 検証するURL
 * @returns {boolean} 有効なOPGG URLの場合true
 */
export function isValidOpggUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // OPGG URLのパターンをチェック
  const opggPattern = /^https?:\/\/(www\.)?op\.gg\/summoners\//i;
  return opggPattern.test(url);
}

/**
 * URLからリージョンを抽出
 * @param {string} opggUrl - OPGG URL
 * @returns {string | null} リージョンコード（例：'jp', 'kr', 'na'）またはnull
 */
export function extractRegionFromUrl(opggUrl) {
  const match = opggUrl.match(/op\.gg\/summoners\/([a-z]+)\//i);
  return match ? match[1].toLowerCase() : null;
}