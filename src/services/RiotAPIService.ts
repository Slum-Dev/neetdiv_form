import { API_ENDPOINTS } from "../config/constants.js";
import type { RiotAPIService } from "../handlers/FormSubmissionHandler.js";

type LeagueEntryDTO = {
  leagueId: string;
  queueType: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" | (string & {});
  tier: string;
  rank: string;
  puuid: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
};

export type QueueSummary = Pick<LeagueEntryDTO, "tier" | "rank">;

export type RankInfo = {
  solo?: QueueSummary;
  flex?: QueueSummary;
};

export type Summoner = {
  puuid: string;
  summonerLevel: number;
  gameName: string;
  tagLine: string;
};

export class RiotAPIError extends Error {
  constructor(message: unknown, cause?: unknown) {
    const msg = cause ? `${message}: ${cause}` : message;
    super(`${msg}`);
    this.name = "RiotAPIError";
  }
}

/**
 * Riot APIとの通信を管理するサービスクラス
 */
export class RiotAPIServiceImpl implements RiotAPIService {
  /**
   * @param apiKey - Riot API アクセストークン
   */
  constructor(private apiKey: string) {}

  /**
   * Riot APIトークンを乗せてfetch
   * 200ならJSON.parseして返す
   * 200以外の例外は必ずRiotAPIErrorとして返す
   * @param method
   * @param url
   * @returns
   */
  async fetch<T>(
    method: GoogleAppsScript.URL_Fetch.HttpMethod,
    url: string,
  ): Promise<T | RiotAPIError> {
    try {
      const response = UrlFetchApp.fetch(url, {
        method,
        headers: {
          "X-Riot-Token": this.apiKey,
        },
        muteHttpExceptions: true,
      });

      const responseCode = response.getResponseCode();
      const responseBody = JSON.parse(response.getContentText());

      if (responseCode !== 200) {
        const errorBody = responseBody as { status?: { message?: string } };
        const cause = errorBody.status?.message ?? "Unknown";
        return new RiotAPIError(responseCode, cause);
      }

      return responseBody as T;
    } catch (e) {
      return new RiotAPIError(e);
    }
  }

  /**
   * GET リクエストのショートハンド
   */
  async get<T>(url: string): Promise<T | RiotAPIError> {
    return this.fetch("get", url);
  }

  /**
   * アカウント情報からPUUIDを取得
   * @param gameName - ゲーム内名（例：若干ワース）
   * @param tagLine - タグライン（例：k4sen）
   * @returns PUUID
   */
  async getAccountPuuid(
    gameName: string,
    tagLine: string,
  ): Promise<string | RiotAPIError> {
    const url = `${API_ENDPOINTS.BASE_URL_ASIA}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const account = await this.get<{ puuid: string }>(url);
    if (account instanceof RiotAPIError) {
      return account;
    }
    return account.puuid;
  }

  /**
   * PUUIDからサモナーレベルを取得
   * @param puuid - プレイヤーのPUUID
   * @returns サモナーレベル
   */
  async getSummonerLevel(puuid: string): Promise<number | RiotAPIError> {
    const url = `${API_ENDPOINTS.BASE_URL_JP}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const summoner = await this.get<{ summonerLevel: number }>(url);
    if (summoner instanceof RiotAPIError) {
      return summoner;
    }
    return summoner.summonerLevel;
  }

  /**
   * PUUIDからランク情報を取得
   * @param puuid - プレイヤーのPUUID
   * @returns ランク情報
   */
  async getRankInfo(puuid: string): Promise<RankInfo | RiotAPIError> {
    const url = `${API_ENDPOINTS.BASE_URL_JP}/lol/league/v4/entries/by-puuid/${puuid}`;
    const ranks = await this.get<LeagueEntryDTO[]>(url);
    if (ranks instanceof RiotAPIError) {
      return ranks;
    }

    const rankInfo: RankInfo = {};
    const solo = ranks.find((e) => e.queueType === "RANKED_SOLO_5x5");
    const flex = ranks.find((e) => e.queueType === "RANKED_FLEX_SR");
    if (solo !== undefined) {
      rankInfo.solo = solo;
    }
    if (flex !== undefined) {
      rankInfo.flex = flex;
    }

    return rankInfo;
  }

  // /**
  //  * マッチIDリストを取得
  //  * @param puuid - プレイヤーのPUUID
  //  * @param [start=0] - 開始インデックス
  //  * @param [count=20] - 取得件数
  //  * @returns マッチIDリスト または undefined
  //  */
  // async getMatchIds(
  //   puuid: string,
  //   start: number = 0,
  //   count: number = 20,
  // ): Promise<string[] | RiotAPIError> {
  //   const url = `${API_ENDPOINTS.BASE_URL_ASIA}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;
  //   return this.get<string[]>(url);
  // }

  // /**
  //  * マッチの詳細情報を取得
  //  * @param matchId - マッチID
  //  * @returns マッチ詳細 または undefined
  //  */
  // async getMatchDetail(matchId: string): Promise<MatchDetail | RiotAPIError> {
  //   const url = `${API_ENDPOINTS.BASE_URL_ASIA}/lol/match/v5/matches/${matchId}`;
  //   return this.get<MatchDetail>(url);
  // }
}
