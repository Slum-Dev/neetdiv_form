import type { RiotAPIService } from "../handlers/FormSubmissionHandler.js";
import { type RankInfo, RiotAPIError } from "../services/RiotAPIService.js";

/**
 * テスト用のモックサービス
 */
export class MockRiotAPIService implements RiotAPIService {
  public responses: {
    puuid?: string;
    summonerLevel?: number;
    rankInfo?: RankInfo;
    error?: boolean;
  };
  public callHistory: { method: string; args: unknown[] }[];

  constructor(responses = {}) {
    this.responses = responses;
    this.callHistory = [];
  }

  async getAccountPuuid(
    gameName: string,
    tagLine: string,
  ): Promise<string | RiotAPIError> {
    this.callHistory.push({
      method: "getAccountPuuid",
      args: [gameName, tagLine],
    });
    if (this.responses.error && !this.responses.puuid) {
      return new RiotAPIError("Riotアカウントの問い合わせに失敗しました。", {
        message: "Not Found",
        status_code: 404,
      });
    }
    return this.responses.puuid ?? "mock-puuid-123";
  }

  async getSummonerLevel(puuid: string): Promise<number | RiotAPIError> {
    this.callHistory.push({ method: "getSummonerLevel", args: [puuid] });
    if (this.responses.error && !this.responses.summonerLevel) {
      return new RiotAPIError("サモナーレベルの取得に失敗しました。", {
        message: "Not Found",
        status_code: 404,
      });
    }
    return this.responses.summonerLevel ?? 150;
  }

  async getRankInfo(puuid: string): Promise<RankInfo | RiotAPIError> {
    this.callHistory.push({ method: "getRankInfo", args: [puuid] });
    if (this.responses.error) {
      return new RiotAPIError("ランクの取得に失敗しました。", {
        message: "Not Found",
        status_code: 404,
      });
    }
    return (
      this.responses.rankInfo ?? {
        solo: { tier: "GOLD", rank: "III" },
      }
    );
  }

  // async getMatchIds(puuid: string, start: number, count: number) {
  //   this.callHistory.push({
  //     method: "getMatchIds",
  //     args: [puuid, start, count],
  //   });
  //   return this.responses.matchIds ?? ["JP1_123456789", "JP1_987654321"];
  // }

  // async getMatchDetail(matchId: string) {
  //   this.callHistory.push({ method: "getMatchDetail", args: [matchId] });
  //   return (
  //     this.responses.matchDetail ?? {
  //       info: {
  //         participants: [],
  //       },
  //     }
  //   );
  // }
}
