function onFormSubmit(e) {

  // フォームでのロールとRiot APIのロール表記互換Map
  const roleMap = {
    "TOP": "TOP",
    "JG": "JUNGLE",
    "MID": "MIDDLE",
    "BOT": "BOTTOM",
    "SUP": "UTILITY"
  };

  // Riot APIでロールのプレイ回数集計Map
  var position = {
    "TOP": 0,
    "JUNGLE": 0,
    "MIDDLE": 0,
    "BOTTOM": 0,
    "UTILITY": 0
  };

  // Riot APIでチャンピオンプール集計用Set
  const championPool = new Set();

  // シートを指定
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("フォームの回答 1");
  // 追加された列を指定
  const lastRow = sheet.getLastRow();

  // 宣言レーン
  const role = sheet.getRange(lastRow, 7).getValue();

  // OPGG URLからサモナー名とサモナーIDを取得
  // OPGG URL
  const opggUrl = sheet.getRange(lastRow, 8).getValue();
  // OPGG URLのクレンジング
  let cleanedUrl = opggUrl
    .replace(/\/(champions|mastery|ingame)$/, "");
  sheet.getRange(lastRow, 8).setFormula(`=HYPERLINK("${cleanedUrl}", "${cleanedUrl}")`);

  let encodedSummonerNI = cleanedUrl.split("/").pop();
  if (encodedSummonerNI.includes("?")) {
    encodedSummonerNI = encodedSummonerNI.split("?")[0];
  }
  let [namePart, tagPart] = encodedSummonerNI.split("-");
  const summonerName = decodeURIComponent(namePart);
  const summonerId = decodeURIComponent(tagPart);

  // コピペ用
  sheet.getRange(lastRow, 10).setValue(`${summonerName}#${summonerId}`);

  // Riot APIキー取得
  const apiKey = PropertiesService.getScriptProperties().getProperty("API_KEY");
  const riot = new RiotAPI(apiKey);

  // プレイヤーのUUIDを取得
  const puuid = riot.getAccountPuuid(summonerName, summonerId);
  sheet.getRange(lastRow, 14).setValue(`${puuid}`);

  // プレイヤーのサモナーレベルを取得
  const summonerLevel = riot.getSummonerLevel(puuid);
  sheet.getRange(lastRow, 11).setValue(summonerLevel);

  // サモナーレベルが30以上であれば追加でランクの情報を取得
  if (summonerLevel >= 30) {
    sheet.getRange(lastRow, 12).setValue("情報なし");
    sheet.getRange(lastRow, 13).setValue("情報なし");

    const rank = riot.getRankInfo(puuid);
    if (rank) {
      sheet.getRange(lastRow, 12).setValue("アンランク");
      sheet.getRange(lastRow, 13).setValue("アンランク");
      if (rank.solo) {
        sheet.getRange(lastRow, 12).setValue(`${rank.solo.tier} ${rank.solo.rank}`);
      }
      if (rank.flex) {
        sheet.getRange(lastRow, 13).setValue(`${rank.flex.tier} ${rank.flex.rank}`);
      }
    }
  }

  // Riot APIで宣言レーンのマッチ数とチャンピオンプール取得
  // const matchListUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${apiKey}`
  // response = UrlFetchApp.fetch(matchListUrl);
  // json = JSON.parse(response.getContentText());
  // var matchIdList = new Array();
  // for(let i = 0; i < json.length; i++) {
  //   matchIdList[i] = json[i]
  // }

  // for(let i = 0; i < matchIdList.length; i++) {
  //   const matchId = matchIdList[i];
  //   const matchUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`
  //   response = UrlFetchApp.fetch(matchUrl);
  //   json = JSON.parse(response.getContentText());
  //   const participants = json["info"]["participants"]
  //   const player = participants.find(p => p["puuid"] === puuid);
  //   if (player) {
  //     const championName = player["championName"];
  //     const teamPosition = player["teamPosition"];

  //     if (teamPosition === roleMap[role]) {
  //       championPool.add(championName);
  //     }
  //     position[teamPosition] = position[teamPosition] + 1;
  //   }
  // }

  // sheet.getRange(lastRow, 11).setValue(position[roleMap[role]]);

  // const championArray = Array.from(championPool);
  // for (let i = 0; i < championArray.length; i++) {
  //   sheet.getRange(lastRow, 12 + i).setValue(championArray[i]);
  // }
}

class RiotAPI {
  constructor(token) {
    this.token = token;
  }

  /**
   * Riot APIトークンを乗せてfetch
   * 200ならJSON.parseして返す
   * 200以外はundefinedを返す
   * @template T
   * @param {"get" | "delete" | "patch" | "post" | "put"} method
   * @param {string} url
   * @returns {T | undefined}
   */
  fetch(method, url) {
    const res = UrlFetchApp.fetch(url, {
      method,
      headers: {
        "X-Riot-Token": this.token,
      },
      muteHttpExceptions: true,
    });
    if (res.getResponseCode !== 200) {
      return;
    }
    return JSON.parse(res.getContentText());
  }

  get(url) {
    return this.fetch("get", url);
  }

  /**
   * @param {string} name 例：若干ワース
   * @param {string} tagline 例：k4sen
   * @returns {string | undefined}
   */
  getAccountPuuid(name, tagline) {
    return this.get(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tagline}`,
    )?.puuid;
  }

  /**
   * @param {string} puuid
   * @returns {number | undefined}
   */
  getSummonerLevel(puuid) {
    return this.get(`https://jp1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`)
      ?.summonerLevel;
  }

  /**
   * @typedef RankInfo
   * @property {string} leagueId
   * @property {"RANKED_FLEX_SR" | "RANKED_SOLO_5x5"} queueType
   * @property {string} tier ランクの色 チャレとかアイアンとか
   * @property {string} rank ランクの階層 I~IV
   * @property {string} puuid
   * @property {number} leaguePoints
   * @property {number} wins
   * @property {number} losses
   * @property {boolean} veteran
   * @property {boolean} inactive
   * @property {boolean} freshBlood
   * @property {boolean} hotStreak
   */
  /**
   * @param {string} puuid
   * @returns {{solo?: RankInfo, flex?: RankInfo} | undefined}
   */
  getRankInfo(puuid) {
    /**
     * @type {RankInfo[] | undefined}
     */
    const ranks = this.get(`https://jp1.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`);
    return {
      solo: ranks.find((e) => e.queueType === "RANKED_SOLO_5x5"),
      flex: ranks.find((e) => e.queueType === "RANKED_FLEX_SR"),
    };
  }
}
