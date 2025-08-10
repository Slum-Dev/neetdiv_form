import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getApiKey } from './gasHelpers.js';

// Google Apps Script APIのモック
global.PropertiesService = {
  getScriptProperties: jest.fn(() => ({
    getProperty: jest.fn()
  }))
};

describe('gasHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getApiKey', () => {
    it('正常にAPIキーを取得', () => {
      // Arrange
      const mockApiKey = 'test-api-key-123';
      const mockPropertiesService = {
        getProperty: jest.fn(() => mockApiKey)
      };
      global.PropertiesService.getScriptProperties.mockReturnValue(mockPropertiesService);

      // Act
      const result = getApiKey();

      // Assert
      expect(result).toBe(mockApiKey);
      expect(global.PropertiesService.getScriptProperties).toHaveBeenCalled();
      expect(mockPropertiesService.getProperty).toHaveBeenCalledWith('API_KEY');
    });

    it('APIキーが設定されていない場合エラー', () => {
      // Arrange
      const mockPropertiesService = {
        getProperty: jest.fn(() => null)
      };
      global.PropertiesService.getScriptProperties.mockReturnValue(mockPropertiesService);

      // Act & Assert
      expect(() => getApiKey()).toThrow('API_KEYが設定されていません。スクリプトプロパティを確認してください。');
    });

    it('空文字のAPIキーの場合エラー', () => {
      // Arrange
      const mockPropertiesService = {
        getProperty: jest.fn(() => '')
      };
      global.PropertiesService.getScriptProperties.mockReturnValue(mockPropertiesService);

      // Act & Assert
      expect(() => getApiKey()).toThrow('API_KEYが設定されていません。スクリプトプロパティを確認してください。');
    });
  });

});