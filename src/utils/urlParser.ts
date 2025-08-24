/**
 * @property {string} summonerName  サモナー名
 * @property {string} tagLine       タグライン
 * @property {string} region        リージョン
 * @property {string} cleanedUrl    整形+URLエンコード済みURL
 */
export type SummonerInfo = {
  summonerName: string;
  tagLine: string;
  region: string;
  cleanedUrl: string;
};

/**
 * OPGG URLを解析してサモナー情報を抽出
 * @param {string} opggUrl - OPGG URL
 * @returns {SummonerInfo | undefined} サモナー情報
 */
export function parseOpggUrl(opggUrl: string | any): SummonerInfo | undefined {
  if (!opggUrl || typeof opggUrl !== "string") {
    return;
  }

  // オリジンがop.ggかつ "/summoners/<region>/<name>-<tag?>" のようなパスを持つURL
  const urlRegex =
    /^https?:\/\/(?:www\.)?op.gg\/(?:\w+\/)*summoners\/(?<region>\w+)\/(?<name>[^\s#/?-]+)(?:-(?<tag>[^\s#/?]+))?/i;
  const match = urlRegex.exec(opggUrl);
  if (!match?.groups) {
    return;
  }

  const regionPart = match.groups.region;
  const namePart = match.groups.name;
  if (!regionPart || !namePart) {
    return;
  }
  const tagPart = match.groups.tag;

  const region = regionPart.toLowerCase();
  const summonerName = decodeURIComponent(namePart);
  const tagLine = tagPart ? decodeURIComponent(tagPart) : "JP1";

  return {
    summonerName,
    tagLine,
    region,
    cleanedUrl: buildOpggUrl(summonerName, tagLine, region),
  };
}

/**
 * サモナー名とタグラインから表示名を生成
 * @param {string} summonerName - サモナー名
 * @param {string} tagLine - タグライン
 * @returns {string} 表示名（例：SummonerName#JP1）
 */
export function formatSummonerDisplayName(
  summonerName: string,
  tagLine: string,
): string {
  return `${summonerName}#${tagLine}`;
}

/**
 * OPGG URLを構築
 * @param {string} summonerName - サモナー名
 * @param {string} tagLine - タグライン
 * @param {string} [region='jp'] - リージョン
 * @returns {string} OPGG URL
 */
export function buildOpggUrl(
  summonerName: string,
  tagLine: string,
  region: string = "jp",
): string {
  const encodedName = encodeURIComponent(summonerName);
  const encodedTag = encodeURIComponent(tagLine);
  return `https://op.gg/summoners/${region}/${encodedName}-${encodedTag}`;
}
