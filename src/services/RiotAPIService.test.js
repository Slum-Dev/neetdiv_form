import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { RiotAPIService } from './RiotAPIService.js';
import { MockRiotAPIService } from '../__mocks__/RiotAPIService.js';

// UrlFetchAppのモック
global.UrlFetchApp = {
  fetch: jest.fn()
};

describe('RiotAPIService', () => {
  let service;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    service = new RiotAPIService(mockApiKey);
    jest.clearAllMocks();
  });

  describe('fetch', () => {
    it('200レスポンスの場合JSONをパースして返す', async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ data: 'test' })
      };
      global.UrlFetchApp.fetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.fetch('get', 'https://api.test.com');

      // Assert
      expect(result).toEqual({ data: 'test' });
      expect(global.UrlFetchApp.fetch).toHaveBeenCalledWith(
        'https://api.test.com',
        expect.objectContaining({
          method: 'get',
          headers: { 'X-Riot-Token': mockApiKey },
          muteHttpExceptions: true
        })
      );
    });

    it('200以外のレスポンスの場合undefinedを返す', async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 404,
        getContentText: () => 'Not Found'
      };
      global.UrlFetchApp.fetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.fetch('get', 'https://api.test.com');

      // Assert
      expect(result).toBeUndefined();
    });

    it('エラーが発生した場合undefinedを返す', async () => {
      // Arrange
      global.UrlFetchApp.fetch.mockImplementation(() => {
        throw new Error('Network error');
      });

      // Act
      const result = await service.fetch('get', 'https://api.test.com');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('getAccountPuuid', () => {
    it('正常にPUUIDを取得できる', async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ 
          puuid: 'test-puuid-123',
          gameName: 'TestPlayer',
          tagLine: 'JP1'
        })
      };
      global.UrlFetchApp.fetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getAccountPuuid('TestPlayer', 'JP1');

      // Assert
      expect(result).toBe('test-puuid-123');
      expect(global.UrlFetchApp.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/riot/account/v1/accounts/by-riot-id/TestPlayer/JP1'),
        expect.any(Object)
      );
    });

    it('日本語を含む名前を正しくエンコード', async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ puuid: 'jp-puuid' })
      };
      global.UrlFetchApp.fetch.mockReturnValue(mockResponse);

      // Act
      await service.getAccountPuuid('テストプレイヤー', 'JP1');

      // Assert
      expect(global.UrlFetchApp.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('テストプレイヤー')),
        expect.any(Object)
      );
    });

    it('アカウントが見つからない場合undefinedを返す', async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 404,
        getContentText: () => 'Not Found'
      };
      global.UrlFetchApp.fetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getAccountPuuid('Invalid', 'JP1');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('getSummonerLevel', () => {
    it('正常にサモナーレベルを取得できる', async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ 
          summonerLevel: 150,
          id: 'summoner-id',
          accountId: 'account-id'
        })
      };
      global.UrlFetchApp.fetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getSummonerLevel('test-puuid');

      // Assert
      expect(result).toBe(150);
      expect(global.UrlFetchApp.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/lol/summoner/v4/summoners/by-puuid/test-puuid'),
        expect.any(Object)
      );
    });

    it('サモナーが見つからない場合undefinedを返す', async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 404,
        getContentText: () => 'Not Found'
      };
      global.UrlFetchApp.fetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getSummonerLevel('invalid-puuid');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('getRankInfo', () => {
    it('ソロとフレックスの両方のランク情報を取得', async () => {
      // Arrange
      const mockRanks = [
        {
          queueType: 'RANKED_SOLO_5x5',
          tier: 'GOLD',
          rank: 'III',
          leaguePoints: 75
        },
        {
          queueType: 'RANKED_FLEX_SR',
          tier: 'SILVER',
          rank: 'I',
          leaguePoints: 50
        }
      ];
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify(mockRanks)
      };
      global.UrlFetchApp.fetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getRankInfo('test-puuid');

      // Assert
      expect(result.solo).toEqual(mockRanks[0]);
      expect(result.flex).toEqual(mockRanks[1]);
    });

    it('ソロランクのみの場合', async () => {
      // Arrange
      const mockRanks = [
        {
          queueType: 'RANKED_SOLO_5x5',
          tier: 'DIAMOND',
          rank: 'IV'
        }
      ];
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify(mockRanks)
      };
      global.UrlFetchApp.fetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getRankInfo('test-puuid');

      // Assert
      expect(result.solo).toEqual(mockRanks[0]);
      expect(result.flex).toBeUndefined();
    });

    it('アンランクの場合空の配列を受け取る', async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify([])
      };
      global.UrlFetchApp.fetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getRankInfo('test-puuid');

      // Assert
      expect(result.solo).toBeUndefined();
      expect(result.flex).toBeUndefined();
    });

    it('エラーの場合undefinedを返す', async () => {
      // Arrange
      const mockResponse = {
        getResponseCode: () => 404,
        getContentText: () => 'Not Found'
      };
      global.UrlFetchApp.fetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getRankInfo('invalid-puuid');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('getMatchIds', () => {
    it('マッチIDリストを取得できる', async () => {
      // Arrange
      const mockMatchIds = ['JP1_12345', 'JP1_67890'];
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify(mockMatchIds)
      };
      global.UrlFetchApp.fetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getMatchIds('test-puuid', 0, 20);

      // Assert
      expect(result).toEqual(mockMatchIds);
      expect(global.UrlFetchApp.fetch).toHaveBeenCalledWith(
        expect.stringContaining('start=0&count=20'),
        expect.any(Object)
      );
    });
  });

  describe('getMatchDetail', () => {
    it('マッチ詳細を取得できる', async () => {
      // Arrange
      const mockMatch = {
        info: {
          gameMode: 'CLASSIC',
          participants: [
            { puuid: 'player1', championName: 'Lux' },
            { puuid: 'player2', championName: 'Jinx' }
          ]
        }
      };
      const mockResponse = {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify(mockMatch)
      };
      global.UrlFetchApp.fetch.mockReturnValue(mockResponse);

      // Act
      const result = await service.getMatchDetail('JP1_12345');

      // Assert
      expect(result).toEqual(mockMatch);
    });
  });
});

describe('MockRiotAPIService', () => {
  let mockService;

  beforeEach(() => {
    mockService = new MockRiotAPIService();
  });

  it('デフォルトの応答を返す', async () => {
    const puuid = await mockService.getAccountPuuid('Test', 'JP1');
    const level = await mockService.getSummonerLevel(puuid);
    const rank = await mockService.getRankInfo(puuid);

    expect(puuid).toBe('mock-puuid-123');
    expect(level).toBe(150);
    expect(rank.solo).toEqual({ tier: 'GOLD', rank: 'III' });
  });

  it('カスタム応答を設定できる', async () => {
    mockService.responses = {
      puuid: 'custom-puuid',
      summonerLevel: 200,
      rankInfo: {
        solo: { tier: 'DIAMOND', rank: 'I' },
        flex: { tier: 'PLATINUM', rank: 'II' }
      }
    };

    const puuid = await mockService.getAccountPuuid('Test', 'JP1');
    const level = await mockService.getSummonerLevel(puuid);
    const rank = await mockService.getRankInfo(puuid);

    expect(puuid).toBe('custom-puuid');
    expect(level).toBe(200);
    expect(rank.solo.tier).toBe('DIAMOND');
    expect(rank.flex.tier).toBe('PLATINUM');
  });

  it('メソッド呼び出し履歴を記録する', async () => {
    await mockService.getAccountPuuid('TestPlayer', 'JP1');
    await mockService.getSummonerLevel('test-puuid');

    expect(mockService.callHistory).toHaveLength(2);
    expect(mockService.callHistory[0]).toEqual({
      method: 'getAccountPuuid',
      args: ['TestPlayer', 'JP1']
    });
    expect(mockService.callHistory[1]).toEqual({
      method: 'getSummonerLevel',
      args: ['test-puuid']
    });
  });
});