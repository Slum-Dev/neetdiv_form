import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MockRiotAPIService } from "../__mocks__/RiotAPIService.js";
import {
  type RankInfo,
  RiotAPIError,
  RiotAPIServiceImpl,
} from "./RiotAPIService.js";

describe("RiotAPIService", () => {
  let service: RiotAPIServiceImpl;
  const mockApiKey = "test-api-key";
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("UrlFetchApp", {
      fetch: mockFetch,
    });
    service = new RiotAPIServiceImpl(mockApiKey);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("fetch", () => {
    it("200レスポンスの場合JSONをパースして返す", async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ data: "test" }),
      };
      mockFetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.fetch("get", "https://api.test.com");

      // Assert
      expect(result).toEqual({ data: "test" });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com",
        expect.objectContaining({
          method: "get",
          headers: { "X-Riot-Token": mockApiKey },
          muteHttpExceptions: true,
        }),
      );
    });

    it("200以外のレスポンスの場合RiotAPIErrorを返す", async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 404,
        getContentText: () =>
          JSON.stringify({
            status: {
              status_code: 404,
              message: "Not Found",
            },
          }),
      };
      mockFetch.mockReturnValue(mockResponse);

      // Act & Assert
      const response = await service.fetch("get", "https://api.test.com");
      expect(response).toBeInstanceOf(RiotAPIError);
      expect(`${response}`).toBe("RiotAPIError: 404: Not Found");
    });

    it("ネットワークエラーの場合RiotAPIErrorを返す", async () => {
      // Arrange
      mockFetch.mockImplementation(() => {
        throw new Error("Network error");
      });

      // Act & Assert
      const response = await service.fetch("get", "https://api.test.com");
      expect(response).toBeInstanceOf(RiotAPIError);
      expect(`${response}`).toBe("RiotAPIError: Error: Network error");
    });
  });

  describe("getAccountPuuid", () => {
    it("正常にPUUIDを取得できる", async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () =>
          JSON.stringify({
            puuid: "test-puuid-123",
            gameName: "TestPlayer",
            tagLine: "JP1",
          }),
      };
      mockFetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getAccountPuuid("TestPlayer", "JP1");

      // Assert
      expect(result).toBe("test-puuid-123");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "/riot/account/v1/accounts/by-riot-id/TestPlayer/JP1",
        ),
        expect.any(Object),
      );
    });

    it("日本語を含む名前を正しくエンコード", async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ puuid: "jp-puuid" }),
      };
      mockFetch.mockReturnValue(mockResponse);

      // Act
      await service.getAccountPuuid("テストプレイヤー", "JP1");

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent("テストプレイヤー")),
        expect.any(Object),
      );
    });

    it("アカウントが見つからない場合RiotAPIErrorを返す", async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 404,
        getContentText: () =>
          JSON.stringify({
            status: {
              status_code: 404,
              message: "Not Found",
            },
          }),
      };
      mockFetch.mockReturnValue(mockResponse);

      // Act & Assert
      const response = await service.getAccountPuuid("Invalid", "JP1");
      expect(response).toBeInstanceOf(RiotAPIError);
    });
  });

  describe("getSummonerLevel", () => {
    it("正常にサモナーレベルを取得できる", async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () =>
          JSON.stringify({
            summonerLevel: 150,
            id: "summoner-id",
            accountId: "account-id",
          }),
      };
      mockFetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getSummonerLevel("test-puuid");

      // Assert
      expect(result).toBe(150);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "/lol/summoner/v4/summoners/by-puuid/test-puuid",
        ),
        expect.any(Object),
      );
    });

    it("サモナーが見つからない場合RiotAPIErrorを返す", async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 404,
        getContentText: () =>
          JSON.stringify({ message: "Not Found", status_code: 404 }),
      };
      mockFetch.mockReturnValue(mockResponse);

      // Act & Assert
      const resp = await service.getSummonerLevel("invalid-puuid");
      expect(resp).toBeInstanceOf(RiotAPIError);
    });
  });

  describe("getRankInfo", () => {
    it("ソロとフレックスの両方のランク情報を取得", async () => {
      // Arrange
      const mockRanks = [
        {
          queueType: "RANKED_SOLO_5x5",
          tier: "GOLD",
          rank: "III",
          leaguePoints: 75,
        },
        {
          queueType: "RANKED_FLEX_SR",
          tier: "SILVER",
          rank: "I",
          leaguePoints: 50,
        },
      ];
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify(mockRanks),
      };
      mockFetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getRankInfo("test-puuid");

      // Assert
      notInstanceOf(result, RiotAPIError);
      expect(result.solo).toEqual(mockRanks[0]);
      expect(result.flex).toEqual(mockRanks[1]);
    });

    it("ソロランクのみの場合", async () => {
      // Arrange
      const mockRanks = [
        {
          queueType: "RANKED_SOLO_5x5",
          tier: "DIAMOND",
          rank: "IV",
        },
      ];
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify(mockRanks),
      };
      mockFetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getRankInfo("test-puuid");

      // Assert
      notInstanceOf(result, RiotAPIError);
      expect(result.solo).toEqual(mockRanks[0]);
      expect(result.flex).toBeUndefined();
    });

    it("アンランクの場合空の配列を受け取る", async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify([]),
      };
      mockFetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getRankInfo("test-puuid");

      // Assert
      notInstanceOf(result, RiotAPIError);
      expect(result.solo).toBeUndefined();
      expect(result.flex).toBeUndefined();
    });

    it("エラーの場合RiotAPIErrorを返す", async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 404,
        getContentText: () =>
          JSON.stringify({ message: "Not Found", status_code: 404 }),
      };
      mockFetch.mockReturnValue(mockResponse);

      // Act & Assert
      const resp = await service.getRankInfo("invalid-puuid");
      expect(resp).toBeInstanceOf(RiotAPIError);
    });
  });

  // describe("getMatchIds", () => {
  //   it("マッチIDリストを取得できる", async () => {
  //     // Arrange
  //     const mockMatchIds = ["JP1_12345", "JP1_67890"];
  //     const mockResponse = {
  //       getResponseCode: () => 200,
  //       getContentText: () => JSON.stringify(mockMatchIds),
  //     };
  //     mockFetch.mockReturnValue(mockResponse);

  //     // Act
  //     const result = await service.getMatchIds("test-puuid", 0, 20);

  //     // Assert
  //     expect(result).toEqual(mockMatchIds);
  //     expect(mockFetch).toHaveBeenCalledWith(
  //       expect.stringContaining("start=0&count=20"),
  //       expect.any(Object),
  //     );
  //   });
  // });

  // describe("getMatchDetail", () => {
  //   it("マッチ詳細を取得できる", async () => {
  //     // Arrange
  //     const mockMatch = {
  //       info: {
  //         gameMode: "CLASSIC",
  //         participants: [
  //           { puuid: "player1", championName: "Lux" },
  //           { puuid: "player2", championName: "Jinx" },
  //         ],
  //       },
  //     };
  //     const mockResponse = {
  //       getResponseCode: () => 200,
  //       getContentText: () => JSON.stringify(mockMatch),
  //     };
  //     mockFetch.mockReturnValue(mockResponse);

  //     // Act
  //     const result = await service.getMatchDetail("JP1_12345");

  //     // Assert
  //     expect(result).toEqual(mockMatch);
  //   });
  // });
});

describe("MockRiotAPIService", () => {
  it("デフォルトの応答を返す", async () => {
    const mockService = new MockRiotAPIService();
    const puuid = await mockService.getAccountPuuid("Test", "JP1");
    notInstanceOf(puuid, RiotAPIError);
    const level = await mockService.getSummonerLevel(puuid);
    notInstanceOf(level, RiotAPIError);
    const rank = await mockService.getRankInfo(puuid);
    notInstanceOf(level, RiotAPIError);

    expect(puuid).toBe("mock-puuid-123");
    expect(level).toBe(150);
    expect(rank).toEqual<RankInfo>({ solo: { tier: "GOLD", rank: "III" } });
  });

  it("カスタム応答を設定できる", async () => {
    const mockService = new MockRiotAPIService();
    mockService.responses = {
      puuid: "custom-puuid",
      summonerLevel: 200,
      rankInfo: {
        solo: { tier: "DIAMOND", rank: "I" },
        flex: { tier: "PLATINUM", rank: "II" },
      },
    };

    const puuid = await mockService.getAccountPuuid("Test", "JP1");
    notInstanceOf(puuid, RiotAPIError);
    const level = await mockService.getSummonerLevel(puuid);
    notInstanceOf(level, RiotAPIError);
    const rank = await mockService.getRankInfo(puuid);
    notInstanceOf(rank, RiotAPIError);

    expect(puuid).toBe("custom-puuid");
    expect(level).toBe(200);
    expect(rank.solo?.tier).toBe("DIAMOND");
    expect(rank.flex?.tier).toBe("PLATINUM");
  });

  it("メソッド呼び出し履歴を記録する", async () => {
    const mockService = new MockRiotAPIService();
    await mockService.getAccountPuuid("TestPlayer", "JP1");
    await mockService.getSummonerLevel("test-puuid");

    expect(mockService.callHistory).toHaveLength(2);
    expect(mockService.callHistory[0]).toEqual({
      method: "getAccountPuuid",
      args: ["TestPlayer", "JP1"],
    });
    expect(mockService.callHistory[1]).toEqual({
      method: "getSummonerLevel",
      args: ["test-puuid"],
    });
  });
});

function notInstanceOf<
  T,
  U extends abstract new (
    ...args: unknown[]
  ) => unknown,
>(value: T, cls: U): asserts value is Exclude<T, InstanceType<U>> {
  if (value instanceof cls) {
    throw new Error(`value should not instance of ${cls.name}`);
  }
}
