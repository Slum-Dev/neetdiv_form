import { parseOpggUrl } from '../utils/urlParser.js';
import { mapFormRoleToAPI } from '../utils/roleMapper.js';
import { COLUMN_INDEXES } from '../config/constants.js';

/**
 * フォーム送信を処理するハンドラークラス
 * ビジネスロジックの調整役として機能
 */
export class FormSubmissionHandler {
  /**
   * @param {SpreadsheetService} spreadsheetService - スプレッドシート操作サービス
   * @param {RiotAPIService} riotAPIService - Riot API通信サービス
   */
  constructor(spreadsheetService, riotAPIService) {
    this.spreadsheet = spreadsheetService;
    this.riotAPI = riotAPIService;
  }

  /**
   * フォーム送信イベントを処理
   * @param {Object} formEvent - Google Formsのイベントオブジェクト
   */
  async handle(formEvent) {
    try {
      const lastRow = this.spreadsheet.getLastRow();
      
      // 1. フォームデータの取得と解析
      const formData = this.extractFormData(lastRow);
      
      // 2. OPGG URLの解析とクレンジング
      const summonerInfo = this.processSummonerInfo(formData.opggUrl, lastRow);
      if (!summonerInfo) {
        return; // エラーは既にシートに記録済み
      }
      
      // 3. Riot APIからデータ取得
      const gameData = await this.fetchGameData(summonerInfo, lastRow);
      if (!gameData) {
        return; // エラーは既にシートに記録済み
      }
      
      // 4. データをシートに書き込み
      this.writeGameDataToSheet(gameData, lastRow);
      
      // 5. マッチ履歴処理
      // Riot APIでロールのプレイ回数集計Map
      // var position = {
      //   TOP: 0,
      //   JUNGLE: 0,
      //   MIDDLE: 0,
      //   BOTTOM: 0,
      //   UTILITY: 0,
      // };
      
      // Riot APIでチャンピオンプール集計用Set
      // const championPool = new Set();
      
      // const roleMap = mapFormRoleToAPI(formData.role);
      
      // this.processMatchHistory(gameData.puuid, formData.role, lastRow);
      
    } catch (error) {
      console.error('FormSubmissionHandler.handle error:', error);
      throw error;
    }
  }

  /**
   * フォームデータを抽出
   * @private
   */
  extractFormData(row) {
    return {
      role: this.spreadsheet.getCellValue(row, COLUMN_INDEXES.ROLE),
      opggUrl: this.spreadsheet.getCellValue(row, COLUMN_INDEXES.OPGG_URL),
    };
  }

  /**
   * サモナー情報を処理
   * @private
   */
  processSummonerInfo(opggUrl, row) {
    try {
      // URLを解析
      const { summonerName, tagLine, cleanedUrl } = parseOpggUrl(opggUrl);
      
      // クレンジングしたURLをハイパーリンクとして設定
      this.spreadsheet.setHyperlink(row, COLUMN_INDEXES.OPGG_URL, cleanedUrl);
      
      // コピペ用のサモナー名を設定
      const displayName = `${summonerName}#${tagLine}`;
      this.spreadsheet.setCellValue(row, COLUMN_INDEXES.SUMMONER_NAME, displayName);
      
      return { summonerName, tagLine };
      
    } catch (error) {
      this.spreadsheet.setCellValue(
        row, 
        COLUMN_INDEXES.PUUID, 
        'Err: OPGG URLの解析に失敗しました。'
      );
      return null;
    }
  }

  /**
   * ゲームデータを取得
   * @private
   */
  async fetchGameData(summonerInfo, row) {
    let puuid;
    try {
      puuid = await this.riotAPI.getAccountPuuid(
        summonerInfo.summonerName, 
        summonerInfo.tagLine
      );
      this.spreadsheet.setCellValue(row, COLUMN_INDEXES.PUUID, puuid);
    } catch (e) {
      this.spreadsheet.setCellValue(row, COLUMN_INDEXES.PUUID, e.message);
      return null;
    }
    
    let summonerLevel;
    try {
      summonerLevel = await this.riotAPI.getSummonerLevel(puuid);
      this.spreadsheet.setCellValue(row, COLUMN_INDEXES.LEVEL, summonerLevel);
    } catch (e) {
      this.spreadsheet.setCellValue(row, COLUMN_INDEXES.LEVEL, e.message);
      return null;
    }
    
    // ランク情報を取得（レベル30以上の場合）
    let rankInfo = null;
    if (summonerLevel >= 30) {
      try {
        rankInfo = await this.riotAPI.getRankInfo(puuid);
      } catch (e) {
        // ランク情報取得エラーは後で処理
        rankInfo = { error: e.message };
      }
    }
    
    return {
      puuid,
      summonerLevel,
      rankInfo
    };
  }

  /**
   * ゲームデータをシートに書き込み
   * @private
   */
  writeGameDataToSheet(gameData, row) {
    // サモナーレベルを記録
    this.spreadsheet.setCellValue(row, COLUMN_INDEXES.LEVEL, gameData.summonerLevel);
    
    // ランク情報を記録（レベル30以上の場合）
    if (gameData.summonerLevel >= 30) {
      // デフォルト値を設定
      this.spreadsheet.setCellValue(row, COLUMN_INDEXES.SOLO_RANK, "情報なし");
      this.spreadsheet.setCellValue(row, COLUMN_INDEXES.FLEX_RANK, "情報なし");
      
      if (gameData.rankInfo && !gameData.rankInfo.error) {
        // ソロランク
        const soloRankText = gameData.rankInfo.solo 
          ? `${gameData.rankInfo.solo.tier} ${gameData.rankInfo.solo.rank}`
          : "アンランク";
        this.spreadsheet.setCellValue(row, COLUMN_INDEXES.SOLO_RANK, soloRankText);
        
        // フレックスランク
        const flexRankText = gameData.rankInfo.flex
          ? `${gameData.rankInfo.flex.tier} ${gameData.rankInfo.flex.rank}`
          : "アンランク";
        this.spreadsheet.setCellValue(row, COLUMN_INDEXES.FLEX_RANK, flexRankText);
      } else if (gameData.rankInfo && gameData.rankInfo.error) {
        // API呼び出しに失敗した場合
        this.spreadsheet.setCellValue(row, COLUMN_INDEXES.SOLO_RANK, gameData.rankInfo.error);
        this.spreadsheet.setCellValue(row, COLUMN_INDEXES.FLEX_RANK, gameData.rankInfo.error);
      } else {
        // rankInfoがnullの場合（レベル30未満）
        this.spreadsheet.setCellValue(row, COLUMN_INDEXES.SOLO_RANK, '');
        this.spreadsheet.setCellValue(row, COLUMN_INDEXES.FLEX_RANK, '');
      }
    }
  }

  // /**
  //  * マッチ履歴を処理（コメントアウトされた実装）
  //  * @private
  //  */
  // async processMatchHistory(puuid, declaredRole, row) {
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
  // }
}