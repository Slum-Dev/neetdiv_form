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