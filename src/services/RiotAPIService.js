import { API_ENDPOINTS } from '../config/constants.js';
import { RiotAPIException } from '../utils/RiotAPIException.js';

/**
 * Riot APIとの通信を管理するサービスクラス
 */
export class RiotAPIService {
  /**
   * @param {string} apiKey - Riot API アクセストークン
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Riot APIトークンを乗せてfetch
   * 200ならJSON.parseして返す
   * 200以外は例外をthrowする
   * @private
   * @template T
   * @param {"get" | "delete" | "patch" | "post" | "put"} method
   * @param {string} url
   * @throws {Error} Response_Code with cause: Riot_API_Response_JSON_Object
   * @returns {Promise<T>}
   */
  async fetch(method, url) {
    const response = await UrlFetchApp.fetch(url, {
      method,
      headers: {
        "X-Riot-Token": this.apiKey,
      },
      muteHttpExceptions: true,
    });
    
    const responseCode = response.getResponseCode();
    const responseBody = JSON.parse(response.getContentText());
    
    if (responseCode !== 200) {
      throw new Error(responseCode, {cause: responseBody});
    }
    
    return responseBody;
  }

  /**
   * GET リクエストのショートハンド
   * @private
   * @param {string} url
   * @throws {Error}
   * @returns {Promise<any>}
   */
  async get(url) {
    try {
      return this.fetch("get", url);
    } catch (e) {
      throw e;
    }
  }

  /**
   * アカウント情報からPUUIDを取得
   * @param {string} gameName - ゲーム内名（例：若干ワース）
   * @param {string} tagLine - タグライン（例：k4sen）
   * @throws {RiotAPIException}
   * @returns {Promise<string>} PUUID
   */
  async getAccountPuuid(gameName, tagLine) {
    try {
      const url = `${API_ENDPOINTS.BASE_URL_ASIA}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
      const account = await this.get(url);
      return account?.puuid;
    } catch (e) {
      throw new RiotAPIException('Riotアカウントの問い合わせに失敗しました。', e.cause);
    }
  }

  /**
   * PUUIDからサモナーレベルを取得
   * @param {string} puuid - プレイヤーのPUUID
   * @throws {RiotAPIException}
   * @returns {Promise<number>} サモナーレベル
   */
  async getSummonerLevel(puuid) {
    try {
      const url = `${API_ENDPOINTS.BASE_URL_JP}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
      const summoner = await this.get(url);
      return summoner?.summonerLevel;
    } catch (e) {
      throw new RiotAPIException('サモナーレベルの取得に失敗しました。', e.cause);
    }
  }

  /**
   * @typedef {Object} RankInfo
   * @property {string} leagueId
   * @property {"RANKED_FLEX_SR" | "RANKED_SOLO_5x5"} queueType
   * @property {string} tier - ランクの色（IRON, BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, MASTER, GRANDMASTER, CHALLENGER）
   * @property {string} rank - ランクの階層（I, II, III, IV）
   * @property {string} summonerId
   * @property {number} leaguePoints
   * @property {number} wins
   * @property {number} losses
   * @property {boolean} veteran
   * @property {boolean} inactive
   * @property {boolean} freshBlood
   * @property {boolean} hotStreak
   */

  /**
   * PUUIDからランク情報を取得
   * @param {string} puuid - プレイヤーのPUUID
   * @throws {RiotAPIException}
   * @returns {Promise<{solo?: RankInfo, flex?: RankInfo}>} ランク情報
   */
  async getRankInfo(puuid) {
    try {
      const url = `${API_ENDPOINTS.BASE_URL_JP}/lol/league/v4/entries/by-puuid/${puuid}`;
      const ranks = await this.get(url);
      
      return {
        solo: ranks.find((e) => e.queueType === "RANKED_SOLO_5x5"),
        flex: ranks.find((e) => e.queueType === "RANKED_FLEX_SR"),
      };
    } catch (e) {
      throw new RiotAPIException('ランクの取得に失敗しました。', e.cause);
    }
  }

  /**
   * マッチIDリストを取得
   * @param {string} puuid - プレイヤーのPUUID
   * @param {number} [start=0] - 開始インデックス
   * @param {number} [count=20] - 取得件数
   * @returns {Promise<string[] | undefined>} マッチIDリスト または undefined
   */
  async getMatchIds(puuid, start = 0, count = 20) {
    const url = `${API_ENDPOINTS.BASE_URL_ASIA}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;
    return this.get(url);
  }

  /**
   * マッチの詳細情報を取得
   * @param {string} matchId - マッチID
   * @returns {Promise<Object | undefined>} マッチ詳細 または undefined
   */
  async getMatchDetail(matchId) {
    const url = `${API_ENDPOINTS.BASE_URL_ASIA}/lol/match/v5/matches/${matchId}`;
    return this.get(url);
  }
}
