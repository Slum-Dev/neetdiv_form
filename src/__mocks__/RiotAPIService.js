import { RiotAPIException } from "../utils/RiotAPIException.js";

/**
 * テスト用のモックサービス
 */
export class MockRiotAPIService {
  constructor(responses = {}) {
    this.responses = responses;
    this.callHistory = [];
  }

  async getAccountPuuid(gameName, tagLine) {
    this.callHistory.push({
      method: "getAccountPuuid",
      args: [gameName, tagLine],
    });
    if (this.responses.throwError && !this.responses.puuid) {
      throw new RiotAPIException("Riotアカウントの問い合わせに失敗しました。", {
        message: "Not Found",
        status_code: 404,
      });
    }
    return this.responses.puuid || "mock-puuid-123";
  }

  async getSummonerLevel(puuid) {
    this.callHistory.push({ method: "getSummonerLevel", args: [puuid] });
    if (this.responses.throwError && !this.responses.summonerLevel) {
      throw new RiotAPIException("サモナーレベルの取得に失敗しました。", {
        message: "Not Found",
        status_code: 404,
      });
    }
    return this.responses.summonerLevel || 150;
  }

  async getRankInfo(puuid) {
    this.callHistory.push({ method: "getRankInfo", args: [puuid] });
    if (this.responses.throwError) {
      throw new RiotAPIException("ランクの取得に失敗しました。", {
        message: "Not Found",
        status_code: 404,
      });
    }
    return (
      this.responses.rankInfo || {
        solo: { tier: "GOLD", rank: "III" },
        flex: null,
      }
    );
  }

  async getMatchIds(puuid, start, count) {
    this.callHistory.push({
      method: "getMatchIds",
      args: [puuid, start, count],
    });
    return this.responses.matchIds || ["JP1_123456789", "JP1_987654321"];
  }

  async getMatchDetail(matchId) {
    this.callHistory.push({ method: "getMatchDetail", args: [matchId] });
    return (
      this.responses.matchDetail || {
        info: {
          participants: [],
        },
      }
    );
  }
}
