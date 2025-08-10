function onFormSubmit(e) {
  // フォームでのロールとRiot APIのロール表記互換Map
  const roleMap = {
    TOP: "TOP",
    JG: "JUNGLE",
    MID: "MIDDLE",
    BOT: "BOTTOM",
    SUP: "UTILITY",
  };

  // Riot APIでロールのプレイ回数集計Map
  var position = {
    TOP: 0,
    JUNGLE: 0,
    MIDDLE: 0,
    BOTTOM: 0,
    UTILITY: 0,
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
  let cleanedUrl = opggUrl.replace(/\/(champions|mastery|ingame)$/, "");
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
  let puuid;
  try {
    puuid = riot.getAccountPuuid(summonerName, summonerId);
    sheet.getRange(lastRow, 14).setValue(`${puuid}`);
  } catch (e) {
    sheet.getRange(lastRow, 14).setValue(e.message);
  }

  // プレイヤーのサモナーレベルを取得
  let summonerLevel;
  try {
    summonerLevel = riot.getSummonerLevel(puuid);
    sheet.getRange(lastRow, 11).setValue(summonerLevel);
  } catch (e) {
    sheet.getRange(lastRow, 11).setValue(e.message);
  }

  // サモナーレベルが30以上であれば追加でランクの情報を取得
  if (summonerLevel >= 30) {
    sheet.getRange(lastRow, 12).setValue("情報なし");
    sheet.getRange(lastRow, 13).setValue("情報なし");

    try {
      const rank = riot.getRankInfo(puuid);
      sheet.getRange(lastRow, 12).setValue("アンランク");
      sheet.getRange(lastRow, 13).setValue("アンランク");
      if (rank.solo) {
        sheet.getRange(lastRow, 12).setValue(`${rank.solo.tier} ${rank.solo.rank}`);
      }
      if (rank.flex) {
        sheet.getRange(lastRow, 13).setValue(`${rank.flex.tier} ${rank.flex.rank}`);
      }
    } catch (e) {
      sheet.getRange(lastRow, 12).setValue(e.message);
      sheet.getRange(lastRow, 13).setValue(e.message);
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
   * 200以外は例外をthrowする
   * @template T
   * @param {"get" | "delete" | "patch" | "post" | "put"} method
   * @param {string} url
   * @throws {Error} (Response_Code, {cause: Riot_API_Response_JSON_Object})
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

    const responseCode = res.getResponseCode();
    const responseBody = res.JSON.parse(res.getContentText());
    if (responseCode !== 200) {
      throw new Error(responseCode, {cause: responseBody});
    }
    return responseBody;
  }

  get(url) {
    try {
      return this.fetch("get", url);
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {string} name 例：若干ワース
   * @param {string} tagline 例：k4sen
   * @throws {RiotAPIException}
   * @returns {string | undefined}
   */
  getAccountPuuid(name, tagline) {
    try {
      return this.get(
        `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tagline}`,
      )?.puuid;
    } catch (e) {
      throw new RiotAPIException('Riotアカウントの問い合わせに失敗しました。', e.cause);
    }
  }

  /**
   * @param {string} puuid
   * @throws {RiotAPIException}
   * @returns {number | undefined}
   */
  getSummonerLevel(puuid) {
    try {
      return this.get(
        `https://jp1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`
      )?.summonerLevel;
    } catch (e) {
      throw new RiotAPIException('サモナーレベルの取得に失敗しました。', e.cause);
    }
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
   * @throws {RiotAPIException}
   * @returns {{solo?: RankInfo, flex?: RankInfo} | undefined}
   */
  getRankInfo(puuid) {
    /**
     * @type {RankInfo[] | undefined}
     */
    let ranks;
    try {
      ranks = this.get(
        `https://jp1.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`
      );
      return {
        solo: ranks.find((e) => e.queueType === "RANKED_SOLO_5x5"),
        flex: ranks.find((e) => e.queueType === "RANKED_FLEX_SR"),
      };
    } catch (e) {
      throw new RiotAPIException('サモナーレベルの取得に失敗しました。', e.cause);
    }
  }
}

class RiotAPIException extends Error {
  constructor(message, apiResponse) {
    super(`Err: ${message}${apiResponse.message} (${apiResponse.status_code})`);
  }
}