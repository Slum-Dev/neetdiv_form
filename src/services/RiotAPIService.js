import { API_ENDPOINTS } from '../config/constants.js';

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
   * 200以外はundefinedを返す
   * @private
   * @template T
   * @param {"get" | "delete" | "patch" | "post" | "put"} method
   * @param {string} url
   * @returns {Promise<T | undefined>}
   */
  async fetch(method, url) {
    try {
      const response = await UrlFetchApp.fetch(url, {
        method,
        headers: {
          "X-Riot-Token": this.apiKey,
        },
        muteHttpExceptions: true,
      });
      
      if (response.getResponseCode() !== 200) {
        console.warn(`Riot API returned status ${response.getResponseCode()} for ${url}`);
        return undefined;
      }
      
      return JSON.parse(response.getContentText());
    } catch (error) {
      console.error('Riot API fetch error:', error);
      return undefined;
    }
  }

  /**
   * GET リクエストのショートハンド
   * @private
   * @param {string} url
   * @returns {Promise<any | undefined>}
   */
  async get(url) {
    return this.fetch("get", url);
  }

  /**
   * アカウント情報からPUUIDを取得
   * @param {string} gameName - ゲーム内名（例：若干ワース）
   * @param {string} tagLine - タグライン（例：k4sen）
   * @returns {Promise<string | undefined>} PUUID または undefined
   */
  async getAccountPuuid(gameName, tagLine) {
    const url = `${API_ENDPOINTS.BASE_URL_ASIA}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const account = await this.get(url);
    return account?.puuid;
  }

  /**
   * PUUIDからサモナーレベルを取得
   * @param {string} puuid - プレイヤーのPUUID
   * @returns {Promise<number | undefined>} サモナーレベル または undefined
   */
  async getSummonerLevel(puuid) {
    const url = `${API_ENDPOINTS.BASE_URL_JP}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const summoner = await this.get(url);
    return summoner?.summonerLevel;
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
   * @returns {Promise<{solo?: RankInfo, flex?: RankInfo} | undefined>} ランク情報 または undefined
   */
  async getRankInfo(puuid) {
    const url = `${API_ENDPOINTS.BASE_URL_JP}/lol/league/v4/entries/by-puuid/${puuid}`;
    const ranks = await this.get(url);
    
    if (!ranks || !Array.isArray(ranks)) {
      return undefined;
    }
    
    return {
      solo: ranks.find((e) => e.queueType === "RANKED_SOLO_5x5"),
      flex: ranks.find((e) => e.queueType === "RANKED_FLEX_SR"),
    };
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

/**
 * テスト用のモックサービス
 */
export class MockRiotAPIService {
  constructor(responses = {}) {
    this.responses = responses;
    this.callHistory = [];
  }

  async getAccountPuuid(gameName, tagLine) {
    this.callHistory.push({ method: 'getAccountPuuid', args: [gameName, tagLine] });
    return this.responses.puuid || "mock-puuid-123";
  }

  async getSummonerLevel(puuid) {
    this.callHistory.push({ method: 'getSummonerLevel', args: [puuid] });
    return this.responses.summonerLevel || 150;
  }

  async getRankInfo(puuid) {
    this.callHistory.push({ method: 'getRankInfo', args: [puuid] });
    return this.responses.rankInfo || {
      solo: { tier: "GOLD", rank: "III" },
      flex: null
    };
  }

  async getMatchIds(puuid, start, count) {
    this.callHistory.push({ method: 'getMatchIds', args: [puuid, start, count] });
    return this.responses.matchIds || ["JP1_123456789", "JP1_987654321"];
  }

  async getMatchDetail(matchId) {
    this.callHistory.push({ method: 'getMatchDetail', args: [matchId] });
    return this.responses.matchDetail || {
      info: {
        participants: []
      }
    };
  }
}