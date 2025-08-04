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
  const role = sheet.getRange(lastRow, 6).getValue();

  // OPGG URLからサモナー名とサモナーIDを取得
  // OPGG URL
  const opggUrl = sheet.getRange(lastRow, 7).getValue();
  // OPGG URLのクレンジング
  let cleanedUrl = opggUrl
    .replace(/\/(champions|mastery|ingame)$/, "");
  sheet.getRange(lastRow, 7).setFormula(`=HYPERLINK("${cleanedUrl}", "${cleanedUrl}")`);

  let encodedSummonerNI = cleanedUrl.split("/").pop();
  if (encodedSummonerNI.includes("?")) {
    encodedSummonerNI = encodedSummonerNI.split("?")[0];
  }
  let [namePart, tagPart] = encodedSummonerNI.split("-");
  const summonerName = decodeURIComponent(namePart);
  const summonerId = decodeURIComponent(tagPart);

  // コピペ用
  sheet.getRange(lastRow, 8).setValue(`${summonerName}#${summonerId}`);

  // Riot APIキー取得
  const apiKey = PropertiesService.getScriptProperties().getProperty("API_KEY");

  // プレイヤーのUUIDを取得
  const puuidUrl = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${summonerId}?api_key=${apiKey}`;
  var response = UrlFetchApp.fetch(puuidUrl);
  var json = JSON.parse(response.getContentText());
  const puuid = json["puuid"];

  // プレイヤーのサモナーレベルを取得
  const summonerUrl = `https://jp1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`
  response = UrlFetchApp.fetch(summonerUrl);
  json = JSON.parse(response.getContentText());
  const summounerLevel = json["summonerLevel"]
  sheet.getRange(lastRow, 9).setValue(summounerLevel);

  // サモナーレベルが30以上であれば追加でランクの情報を取得
  if (summounerLevel >= 30) {
    const rankUrl = `https://jp1.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${apiKey}`
    response = UrlFetchApp.fetch(rankUrl);
    json = JSON.parse(response.getContentText());
    if (json.length > 0) {
      const tier = json[0]["tier"]
      const rank = json[0]["rank"]
      sheet.getRange(lastRow, 10).setValue(`${tier} ${rank}`);
    } else {
      sheet.getRange(lastRow, 10).setValue("アンランク/情報なし");
    }
  } else {
    sheet.getRange(lastRow, 10).setValue("アンランク");
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
