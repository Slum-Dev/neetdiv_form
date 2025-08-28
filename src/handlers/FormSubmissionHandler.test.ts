import { describe, expect, it } from "vitest";
import { MockRiotAPIService } from "../__mocks__/RiotAPIService.js";
import { MockSpreadsheetService } from "../__mocks__/SpreadsheetService.js";
import { COLUMN_INDEXES } from "../config/constants.js";
import type { Summoner } from "../services/RiotAPIService.js";
import { FormSubmissionHandler } from "./FormSubmissionHandler.js";

const createMockedHandler = () => {
  const mockSpreadsheet = new MockSpreadsheetService();
  const mockRiotAPI = new MockRiotAPIService();
  const handler = new FormSubmissionHandler(mockSpreadsheet, mockRiotAPI);
  return {
    handler,
    mockSpreadsheet,
    mockRiotAPI,
  };
};

describe("FormSubmissionHandler", () => {
  describe("handle", () => {
    it("正常なフォーム送信を処理できる", async () => {
      // Arrange
      const { handler, mockRiotAPI, mockSpreadsheet } = createMockedHandler();
      mockSpreadsheet.setCellValue(10, COLUMN_INDEXES.ROLE, "TOP");
      mockSpreadsheet.setCellValue(
        10,
        COLUMN_INDEXES.OPGG_URL,
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
      await handler.handle(10);

      // Assert
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.OPGG_URL)).toBe(
        '=HYPERLINK("https://op.gg/summoners/jp/TestPlayer-JP1", "https://op.gg/summoners/jp/TestPlayer-JP1")',
      );
      expect(
        mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.SUMMONER_NAME),
      ).toBe("TestPlayer#JP1");
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.LEVEL)).toBe(150);
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.SOLO_RANK)).toBe(
        "GOLD III",
      );
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.FLEX_RANK)).toBe(
        "SILVER I",
      );
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.PUUID)).toBe(
        "test-puuid-123",
      );
    });

    it("存在しないサモナーの場合エラーメッセージを設定", async () => {
      // Arrange
      const { handler, mockRiotAPI, mockSpreadsheet } = createMockedHandler();
      mockSpreadsheet.setCellValue(
        10,
        COLUMN_INDEXES.OPGG_URL,
        "https://www.op.gg/summoners/jp/InvalidPlayer-JP1",
      );

      // MockRiotAPIServiceがエラーを返すように設定
      mockRiotAPI.responses = { error: true };

      // Act
      const result = await handler.handle(10);

      // Act & Assert
      expect(result).toBeUndefined();
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.PUUID)).toContain(
        "Err:",
      );
    });

    it("レベル30未満のサモナーはランク情報を取得しない", async () => {
      // Arrange
      const { handler, mockRiotAPI, mockSpreadsheet } = createMockedHandler();
      mockSpreadsheet.setCellValue(
        10,
        COLUMN_INDEXES.OPGG_URL,
        "https://www.op.gg/summoners/jp/NewPlayer-JP1",
      );

      mockRiotAPI.responses = {
        puuid: "new-player-puuid",
        summonerLevel: 25,
      };

      // Act
      await handler.handle(10);

      // Assert
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.LEVEL)).toBe(25);
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.SOLO_RANK)).toBe(
        "レベル30未満",
      );
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.FLEX_RANK)).toBe(
        "レベル30未満",
      );
    });

    it("アンランクのサモナーを適切に処理", async () => {
      // Arrange
      const { handler, mockRiotAPI, mockSpreadsheet } = createMockedHandler();
      mockSpreadsheet.setCellValue(
        10,
        COLUMN_INDEXES.OPGG_URL,
        "https://www.op.gg/summoners/jp/UnrankedPlayer-JP1",
      );

      mockRiotAPI.responses = {
        puuid: "unranked-puuid",
        summonerLevel: 50,
        rankInfo: {},
      };

      // Act
      await handler.handle(10);

      // Assert
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.SOLO_RANK)).toBe(
        "アンランク",
      );
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.FLEX_RANK)).toBe(
        "アンランク",
      );
    });
  });

  describe("parseOpggUrl", () => {
    it("OPGG URLを正しく解析してサモナー情報を返す", () => {
      // Arrange
      const { handler } = createMockedHandler();
      const url = "https://www.op.gg/summoners/jp/TestPlayer-JP1/champions";

      // Act
      const result = handler.parseOpggUrl(url, 10);

      // Assert
      expect(result).toEqual({
        summonerName: "TestPlayer",
        tagLine: "JP1",
        region: "jp",
      });
    });

    it("無効なURLの場合エラーを設定してundefinedを返す", () => {
      // Arrange
      const { handler, mockSpreadsheet } = createMockedHandler();
      const url = ""; // 空文字は無効なURLとしてエラーになる

      // Act
      const result = handler.parseOpggUrl(url, 10);

      // Assert
      expect(result).toBeUndefined();
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.PUUID)).toContain(
        "Err:",
      );
    });

    it("日本語を含むサモナー名を正しくデコード", () => {
      // Arrange
      const { handler } = createMockedHandler();
      const url =
        "https://www.op.gg/summoners/jp/%E3%83%86%E3%82%B9%E3%83%88-JP1";

      // Act
      const result = handler.parseOpggUrl(url, 10);

      // Assert
      expect(result?.summonerName).toBe("テスト");
      expect(result?.tagLine).toBe("JP1");
    });
  });

  describe("fetchSummoner", () => {
    it("全てのAPIデータを正常に取得", async () => {
      // Arrange
      const { handler, mockRiotAPI, mockSpreadsheet } = createMockedHandler();
      mockRiotAPI.responses = {
        puuid: "test-puuid",
        summonerLevel: 100,
        rankInfo: {
          solo: { tier: "DIAMOND", rank: "IV" },
        },
      };

      // Act
      const result = await handler.fetchSummoner("Test", "JP1", 10);

      // Assert
      expect(result).toEqual<Summoner>({
        puuid: "test-puuid",
        summonerLevel: 100,
        gameName: "Test",
        tagLine: "JP1",
      });
      expect(
        mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.SUMMONER_NAME),
      ).toBe("Test#JP1");
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.LEVEL)).toBe(100);
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.PUUID)).toBe(
        "test-puuid",
      );
    });

    it("PUUIDが取得できない場合はundefinedを返す", async () => {
      // Arrange
      const { handler, mockRiotAPI, mockSpreadsheet } = createMockedHandler();
      mockRiotAPI.responses = { error: true };

      // Act
      const result = await handler.fetchSummoner("Invalid", "JP1", 10);

      // Assert
      expect(result).toBeUndefined();
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.PUUID)).toContain(
        "Err:",
      );
    });

    it("サモナーレベルが取得できない場合はundefinedを返す", async () => {
      // Arrange
      const { handler, mockRiotAPI, mockSpreadsheet } = createMockedHandler();
      mockRiotAPI.responses = {
        puuid: "test-puuid",
        error: true,
      };

      // Act
      const result = await handler.fetchSummoner("Test", "JP1", 10);

      // Assert
      expect(result).toBeUndefined();
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.LEVEL)).toContain(
        "Err:",
      );
    });
  });

  describe("writeRankData", () => {
    it("ランク情報をシートに書き込む", async () => {
      // Arrange
      const { handler, mockRiotAPI, mockSpreadsheet } = createMockedHandler();
      mockRiotAPI.responses = {
        rankInfo: {
          solo: { tier: "PLATINUM", rank: "II" },
          flex: { tier: "GOLD", rank: "I" },
        },
      };

      // Act
      await handler.writeRankData(
        {
          puuid: "test-puuid",
          summonerLevel: 150,
          gameName: "",
          tagLine: "",
        },
        10,
      );

      // Assert
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.SOLO_RANK)).toBe(
        "PLATINUM II",
      );
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.FLEX_RANK)).toBe(
        "GOLD I",
      );
    });

    it("レベル30未満の場合「レベル30未満」と書き込む", async () => {
      // Arrange
      const { handler, mockSpreadsheet } = createMockedHandler();

      // Act
      await handler.writeRankData(
        {
          puuid: "test-puuid",
          summonerLevel: 25,
          gameName: "",
          tagLine: "",
        },
        10,
      );

      // Assert
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.SOLO_RANK)).toBe(
        "レベル30未満",
      );
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.FLEX_RANK)).toBe(
        "レベル30未満",
      );
    });

    it("ランク取得に失敗した場合エラーメッセージを表示", async () => {
      // Arrange
      const { handler, mockRiotAPI, mockSpreadsheet } = createMockedHandler();
      mockRiotAPI.responses = {
        error: true,
      };

      // Act
      const result = await handler.writeRankData(
        {
          puuid: "test-puuid",
          summonerLevel: 100,
          gameName: "",
          tagLine: "",
        },
        10,
      );

      // Assert
      expect(result).toBeUndefined();
      expect(
        mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.SOLO_RANK),
      ).toContain("Err:");
      expect(
        mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.FLEX_RANK),
      ).toContain("Err:");
    });

    it("片方のみランクを持つ場合を正しく処理", async () => {
      // Arrange
      const { handler, mockRiotAPI, mockSpreadsheet } = createMockedHandler();
      mockRiotAPI.responses = {
        rankInfo: {
          solo: { tier: "GOLD", rank: "III" },
        },
      };
      const summoner: Summoner = {
        puuid: "test-puuid",
        summonerLevel: 100,
        gameName: "",
        tagLine: "",
      };

      // Act
      await handler.writeRankData(summoner, 10);

      // Assert
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.SOLO_RANK)).toBe(
        "GOLD III",
      );
      expect(mockSpreadsheet.getCellValue(10, COLUMN_INDEXES.FLEX_RANK)).toBe(
        "アンランク",
      );
    });
  });
});
