import { COLUMN_INDEXES } from "../config/constants.js";
import {
  type RankInfo,
  RiotAPIError,
  type Summoner,
} from "../services/RiotAPIService.js";
import type { CellValue } from "../services/SpreadsheetService.js";
import {
  buildOpggUrl,
  formatSummonerDisplayName,
  parseOpggUrl,
} from "../utils/urlParser.js";

export interface SpreadsheetService {
  getCellValue(row: number, column: number): CellValue;
  setCellValue(row: number, column: number, value: CellValue): void;
  setHyperlink(row: number, column: number, url: string, label?: string): void;
}

export interface RiotAPIService {
  getAccountPuuid(
    gameName: string,
    tagLine: string,
  ): Promise<string | RiotAPIError>;
  getSummonerLevel(puuid: string): Promise<number | RiotAPIError>;
  getRankInfo(puuid: string): Promise<RankInfo | RiotAPIError>;
}

/**
 * フォーム送信を処理するハンドラークラス
 * ビジネスロジックの調整役として機能
 */
export class FormSubmissionHandler {
  spreadsheet: SpreadsheetService;
  riotAPI: RiotAPIService;
  /**
   * @param spreadsheetService - スプレッドシート操作サービス
   * @param riotAPIService - Riot API通信サービス
   */
  constructor(
    spreadsheetService: SpreadsheetService,
    riotAPIService: RiotAPIService,
  ) {
    this.spreadsheet = spreadsheetService;
    this.riotAPI = riotAPIService;
  }

  /**
   * フォーム送信イベントを処理
   * @param row - 処理中の回答の行番号
   */
  async handle(row: number) {
    try {
      // 1. フォームデータの取得と解析
      const formData = this.extractFormData(row);

      // 2. OPGG URLの解析とクレンジング
      const opggUrl = this.parseOpggUrl(formData.opggUrl, row);
      if (opggUrl === undefined) {
        return; // エラーは既にシートに記録済み
      }

      // 3. Riot APIからデータ取得・基礎データを書き込み
      const summoner = await this.fetchSummoner(
        opggUrl.summonerName,
        opggUrl.tagLine,
        row,
      );
      if (summoner === undefined) {
        return; // エラーは既にシートに記録済み
      }

      // 4. ランクデータをシートに書き込み
      this.writeRankData(summoner, row);

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
      console.error("FormSubmissionHandler.handle error:", error);
      throw error;
    }
  }

  /**
   * フォームデータを抽出
   */
  extractFormData(row: number): { role: string; opggUrl: string } {
    return {
      role: String(this.spreadsheet.getCellValue(row, COLUMN_INDEXES.ROLE)),
      opggUrl: String(
        this.spreadsheet.getCellValue(row, COLUMN_INDEXES.OPGG_URL),
      ),
    };
  }

  /**
   * URLからサモナー情報を取得
   */
  parseOpggUrl(opggUrl: string, row: number) {
    // URLを解析
    const parsedOpggInfo = parseOpggUrl(opggUrl);
    if (!parsedOpggInfo) {
      this.spreadsheet.setCellValue(
        row,
        COLUMN_INDEXES.PUUID,
        "Err: OPGG URLの解析に失敗しました。",
      );
      return;
    }
    return parsedOpggInfo;
  }

  /**
   * APIからサモナーデータを取得
   */
  async fetchSummoner(
    gameName: string,
    tagLine: string,
    row: number,
  ): Promise<Summoner | undefined> {
    // PUUIDを取得
    const puuid = await this.riotAPI.getAccountPuuid(gameName, tagLine);
    if (puuid instanceof RiotAPIError) {
      // アカウントが存在しなかった
      const error = puuid;
      this.spreadsheet.setCellValue(
        row,
        COLUMN_INDEXES.PUUID,
        `Err: Riotアカウントの問い合わせに失敗しました。${error.message}`,
      );
      return;
    }

    // アカウントの存在が確認できたのでPUUIDを設定
    this.spreadsheet.setCellValue(row, COLUMN_INDEXES.PUUID, puuid);
    // 回答の「サモナー名・サモナーID」に正しい名前をセット
    this.spreadsheet.setCellValue(row, COLUMN_INDEXES.SUMMONER_NAME, gameName);
    this.spreadsheet.setCellValue(row, COLUMN_INDEXES.TAG_LINE, tagLine);

    // クレンジングしたURLをハイパーリンクとして設定
    const cleanedUrl = buildOpggUrl(gameName, tagLine);
    this.spreadsheet.setHyperlink(row, COLUMN_INDEXES.OPGG_URL, cleanedUrl);

    // コピペ用のサモナー名を設定
    const displayName = formatSummonerDisplayName(gameName, tagLine);
    this.spreadsheet.setCellValue(
      row,
      COLUMN_INDEXES.SUMMONER_NAME,
      displayName,
    );

    // サモナーレベルを取得
    const summonerLevel = await this.riotAPI.getSummonerLevel(puuid);
    if (summonerLevel instanceof RiotAPIError) {
      const error = summonerLevel;
      this.spreadsheet.setCellValue(
        row,
        COLUMN_INDEXES.LEVEL,
        `Err: サモナーレベルの取得に失敗しました。${error.message}`,
      );
      return;
    }

    // サモナーレベルを設定
    this.spreadsheet.setCellValue(row, COLUMN_INDEXES.LEVEL, summonerLevel);

    return {
      gameName,
      tagLine,
      puuid,
      summonerLevel,
    };
  }

  /**
   * ランクデータをシートに書き込み
   */
  async writeRankData(summoner: Summoner, row: number) {
    if (summoner.summonerLevel < 30) {
      this.spreadsheet.setCellValue(
        row,
        COLUMN_INDEXES.SOLO_RANK,
        "レベル30未満",
      );
      this.spreadsheet.setCellValue(
        row,
        COLUMN_INDEXES.FLEX_RANK,
        "レベル30未満",
      );
      return;
    }

    // ランク情報を取得
    const rankInfo = await this.riotAPI.getRankInfo(summoner.puuid);
    if (rankInfo instanceof RiotAPIError) {
      const error = rankInfo;
      this.spreadsheet.setCellValue(
        row,
        COLUMN_INDEXES.SOLO_RANK,
        `Err: ランクの取得に失敗しました。${error.message}`,
      );
      this.spreadsheet.setCellValue(
        row,
        COLUMN_INDEXES.FLEX_RANK,
        `Err: ランクの取得に失敗しました。${error.message}`,
      );
      return;
    }

    // デフォルト値を設定
    this.spreadsheet.setCellValue(row, COLUMN_INDEXES.SOLO_RANK, "アンランク");
    this.spreadsheet.setCellValue(row, COLUMN_INDEXES.FLEX_RANK, "アンランク");

    if (rankInfo.solo) {
      // ソロランク
      const soloRankText = `${rankInfo.solo.tier} ${rankInfo.solo.rank}`;
      this.spreadsheet.setCellValue(
        row,
        COLUMN_INDEXES.SOLO_RANK,
        soloRankText,
      );
    }
    if (rankInfo.flex) {
      // フレックスランク
      const flexRankText = `${rankInfo.flex.tier} ${rankInfo.flex.rank}`;
      this.spreadsheet.setCellValue(
        row,
        COLUMN_INDEXES.FLEX_RANK,
        flexRankText,
      );
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
