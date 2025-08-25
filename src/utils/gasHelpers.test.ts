import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from "vitest";
import { getApiKey } from "./gasHelpers.js";

describe("gasHelpers", () => {
  let mockGetProperty: Mock;

  beforeEach(() => {
    mockGetProperty = vi.fn();
    vi.stubGlobal("PropertiesService", {
      getScriptProperties: vi.fn(() => ({
        getProperty: mockGetProperty,
      })),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getApiKey", () => {
    it("正常にAPIキーを取得", () => {
      // Arrange
      const mockApiKey = "test-api-key-123";
      mockGetProperty.mockReturnValue(mockApiKey);

      // Act
      const result = getApiKey();

      // Assert
      expect(result).toBe(mockApiKey);
      expect(PropertiesService.getScriptProperties).toHaveBeenCalled();
      expect(mockGetProperty).toHaveBeenCalledWith("API_KEY");
    });

    it("APIキーが設定されていない場合エラー", () => {
      // Arrange
      mockGetProperty.mockReturnValue(null);

      // Act & Assert
      expect(() => getApiKey()).toThrow(
        "API_KEYが設定されていません。スクリプトプロパティを確認してください。",
      );
    });

    it("空文字のAPIキーの場合エラー", () => {
      // Arrange
      mockGetProperty.mockReturnValue("");

      // Act & Assert
      expect(() => getApiKey()).toThrow(
        "API_KEYが設定されていません。スクリプトプロパティを確認してください。",
      );
    });
  });
});
