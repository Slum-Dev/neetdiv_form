import { beforeEach, describe, expect, it } from "vitest";
import { MockRiotAPIService } from "../__mocks__/RiotAPIService.js";
import { MockSpreadsheetService } from "../__mocks__/SpreadsheetService.js";
import {
  FormSubmissionHandler,
  type GameData,
} from "./FormSubmissionHandler.js";

describe("FormSubmissionHandler", () => {
  let handler: FormSubmissionHandler;
  let mockSpreadsheet: MockSpreadsheetService;
  let mockRiotAPI: MockRiotAPIService;

  beforeEach(() => {
    mockSpreadsheet = new MockSpreadsheetService();
    mockRiotAPI = new MockRiotAPIService();
    handler = new FormSubmissionHandler(mockSpreadsheet, mockRiotAPI);
  });

  describe("handle", () => {
    it("正常なフォーム送信を処理できる", async () => {
      // Arrange
      mockSpreadsheet.lastRow = 10;
      mockSpreadsheet.setCellValue(10, 7, "TOP");
      mockSpreadsheet.setCellValue(
        10,
        8,
        "https://www.op.gg/summoners/jp/TestPlayer-JP1",
      );

      mockRiotAPI.responses = {
        puuid: "test-puuid-123",
        summonerLevel: 150,
        rankInfo: {
          solo: { tier: "GOLD", rank: "III" },
          flex: { tier: "SILVER", rank: "I" },
        },
      };

      // Act
      await handler.handle({});

      // Assert
      expect(mockSpreadsheet.formulas["10,8"]).toBe(
        '=HYPERLINK("https://op.gg/summoners/jp/TestPlayer-JP1", "https://op.gg/summoners/jp/TestPlayer-JP1")',
      );
      expect(mockSpreadsheet.getCellValue(10, 10)).toBe("TestPlayer#JP1");
      expect(mockSpreadsheet.getCellValue(10, 11)).toBe(150);
      expect(mockSpreadsheet.getCellValue(10, 12)).toBe("GOLD III");
      expect(mockSpreadsheet.getCellValue(10, 13)).toBe("SILVER I");
      expect(mockSpreadsheet.getCellValue(10, 14)).toBe("test-puuid-123");
    });

    it("存在しないサモナーの場合エラーメッセージを設定", async () => {
      // Arrange
      mockSpreadsheet.lastRow = 10;
      mockSpreadsheet.setCellValue(
        10,
        8,
        "https://www.op.gg/summoners/jp/InvalidPlayer-JP1",
      );

      // MockRiotAPIServiceが例外をthrowするように設定
      mockRiotAPI.responses = { throwError: true };

      // Act
      await handler.handle({});

      // Assert
      expect(mockSpreadsheet.getCellValue(10, 14)).toContain("Err:");
    });

    it("レベル30未満のサモナーはランク情報を取得しない", async () => {
      // Arrange
      mockSpreadsheet.lastRow = 10;
      mockSpreadsheet.setCellValue(
        10,
        8,
        "https://www.op.gg/summoners/jp/NewPlayer-JP1",
      );

      mockRiotAPI.responses = {
        puuid: "new-player-puuid",
        summonerLevel: 25,
        rankInfo: null,
      };

      // Act
      await handler.handle({});

      // Assert
      expect(mockSpreadsheet.getCellValue(10, 11)).toBe(25);
      expect(mockSpreadsheet.getCellValue(10, 12)).toBe("");
      expect(mockSpreadsheet.getCellValue(10, 13)).toBe("");
    });

    it("アンランクのサモナーを適切に処理", async () => {
      // Arrange
      mockSpreadsheet.lastRow = 10;
      mockSpreadsheet.setCellValue(
        10,
        8,
        "https://www.op.gg/summoners/jp/UnrankedPlayer-JP1",
      );

      mockRiotAPI.responses = {
        puuid: "unranked-puuid",
        summonerLevel: 50,
        rankInfo: {
          solo: null,
          flex: null,
        },
      };

      // Act
      await handler.handle({});

      // Assert
      expect(mockSpreadsheet.getCellValue(10, 12)).toBe("アンランク");
      expect(mockSpreadsheet.getCellValue(10, 13)).toBe("アンランク");
    });
  });

  describe("processSummonerInfo", () => {
    it("OPGG URLを正しく解析してサモナー情報を返す", () => {
      // Arrange
      const url = "https://www.op.gg/summoners/jp/TestPlayer-JP1/champions";

      // Act
      const result = handler.processSummonerInfo(url, 10);

      // Assert
      expect(result).toEqual({
        summonerName: "TestPlayer",
        tagLine: "JP1",
        region: "jp",
        cleanedUrl: "https://op.gg/summoners/jp/TestPlayer-JP1",
      });
    });

    it("無効なURLの場合エラーを設定してnullを返す", () => {
      // Arrange
      const url = ""; // 空文字は無効なURLとしてエラーになる

      // Act
      const result = handler.processSummonerInfo(url, 10);

      // Assert
      expect(result).toBeNull();
      expect(mockSpreadsheet.getCellValue(10, 14)).toContain("Err:");
    });

    it("日本語を含むサモナー名を正しくデコード", () => {
      // Arrange
      const url =
        "https://www.op.gg/summoners/jp/%E3%83%86%E3%82%B9%E3%83%88-JP1";

      // Act
      const result = handler.processSummonerInfo(url, 10);

      // Assert
      expect(result?.summonerName).toBe("テスト");
      expect(result?.tagLine).toBe("JP1");
    });
  });

  describe("fetchGameData", () => {
    it("全てのAPIデータを正常に取得", async () => {
      // Arrange
      mockRiotAPI.responses = {
        puuid: "test-puuid",
        summonerLevel: 100,
        rankInfo: {
          solo: { tier: "DIAMOND", rank: "IV" },
          flex: null,
        },
      };

      // Act
      const result = await handler.fetchGameData(
        {
          summonerName: "Test",
          tagLine: "JP1",
          region: "jp",
          cleanedUrl: "https://op.gg/summoners/jp/Test-JP1",
        },
        10,
      );

      // Assert
      expect(result).toEqual({
        puuid: "test-puuid",
        summonerLevel: 100,
        rankInfo: {
          solo: { tier: "DIAMOND", rank: "IV" },
          flex: null,
        },
      });
      expect(mockSpreadsheet.getCellValue(10, 10)).toBe("Test#JP1");
    });

    it("PUUIDが取得できない場合はnullを返す", async () => {
      // Arrange
      mockRiotAPI.responses = { throwError: true };

      // Act
      const result = await handler.fetchGameData(
        {
          summonerName: "Invalid",
          tagLine: "JP1",
          region: "jp",
          cleanedUrl: "https://op.gg/summoners/jp/Invalid-JP1",
        },
        10,
      );

      // Assert
      expect(result).toBeNull();
      expect(mockSpreadsheet.getCellValue(10, 14)).toContain("Err:");
    });

    it("サモナーレベルが取得できない場合はnullを返す", async () => {
      // Arrange
      mockRiotAPI.responses = {
        puuid: "test-puuid",
        throwError: true,
        summonerLevel: undefined, // getSummonerLevelで例外をthrowさせる
      };

      // Act
      const result = await handler.fetchGameData(
        {
          summonerName: "Test",
          tagLine: "JP1",
          region: "jp",
          cleanedUrl: "https://op.gg/summoners/jp/Test-JP1",
        },
        10,
      );

      // Assert
      expect(result).toBeNull();
      expect(mockSpreadsheet.getCellValue(10, 11)).toContain("Err:");
    });
  });

  describe("writeGameDataToSheet", () => {
    it("ランク情報を含む全データをシートに書き込む", () => {
      // Arrange
      const gameData: GameData = {
        puuid: "test-puuid",
        summonerLevel: 150,
        rankInfo: {
          solo: {
            tier: "PLATINUM",
            rank: "II",
            leagueId: "",
            queueType: "",
            summonerId: "",
            leaguePoints: 0,
            wins: 0,
            losses: 0,
            veteran: false,
            inactive: false,
            freshBlood: false,
            hotStreak: false,
          },
          flex: {
            tier: "GOLD",
            rank: "I",
            leagueId: "",
            queueType: "",
            summonerId: "",
            leaguePoints: 0,
            wins: 0,
            losses: 0,
            veteran: false,
            inactive: false,
            freshBlood: false,
            hotStreak: false,
          },
        },
      };

      // Act
      handler.writeGameDataToSheet(gameData, 10);

      // Assert
      expect(mockSpreadsheet.getCellValue(10, 11)).toBe(150);
      expect(mockSpreadsheet.getCellValue(10, 12)).toBe("PLATINUM II");
      expect(mockSpreadsheet.getCellValue(10, 13)).toBe("GOLD I");
    });

    it("レベル30未満の場合ランク情報を書き込まない", () => {
      // Arrange
      const gameData = {
        puuid: "test-puuid",
        summonerLevel: 25,
        rankInfo: null,
      };

      // Act
      handler.writeGameDataToSheet(gameData, 10);

      // Assert
      expect(mockSpreadsheet.getCellValue(10, 11)).toBe(25);
      expect(mockSpreadsheet.getCellValue(10, 12)).toBe("");
      expect(mockSpreadsheet.getCellValue(10, 13)).toBe("");
    });

    it("ランク取得に失敗した場合エラーメッセージを表示", () => {
      // Arrange
      const gameData = {
        puuid: "test-puuid",
        summonerLevel: 100,
        rankInfo: { error: "Err: ランクの取得に失敗しました。" },
      };

      // Act
      handler.writeGameDataToSheet(gameData, 10);

      // Assert
      expect(mockSpreadsheet.getCellValue(10, 12)).toContain("Err:");
      expect(mockSpreadsheet.getCellValue(10, 13)).toContain("Err:");
    });

    it("片方のみランクを持つ場合を正しく処理", () => {
      // Arrange
      const gameData: GameData = {
        puuid: "test-puuid",
        summonerLevel: 100,
        rankInfo: {
          solo: {
            tier: "GOLD",
            rank: "III",
            leagueId: "",
            queueType: "",
            summonerId: "",
            leaguePoints: 0,
            wins: 0,
            losses: 0,
            veteran: false,
            inactive: false,
            freshBlood: false,
            hotStreak: false,
          },
          flex: null,
        },
      };

      // Act
      handler.writeGameDataToSheet(gameData, 10);

      // Assert
      expect(mockSpreadsheet.getCellValue(10, 12)).toBe("GOLD III");
      expect(mockSpreadsheet.getCellValue(10, 13)).toBe("アンランク");
    });
  });
});
