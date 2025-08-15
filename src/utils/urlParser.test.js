import { describe, it, expect } from 'vitest';
import {
  parseOpggUrl,
  formatSummonerDisplayName,
  buildOpggUrl,
} from './urlParser.js';

describe('urlParser', () => {
  describe('parseOpggUrl', () => {
    it('標準的なOPGG URLを解析', () => {
      const url = 'https://op.gg/ja/lol/summoners/jp/TestPlayer-JP1';
      const result = parseOpggUrl(url);
      
      expect(result).toEqual({
        summonerName: 'TestPlayer',
        tagLine: 'JP1',
        region: 'jp',
        cleanedUrl: 'https://op.gg/summoners/jp/TestPlayer-JP1',
      });
    });

    it('www付きのURLを解析', () => {
      const url = 'https://www.op.gg/ja/lol/summoners/jp/TestPlayer-JP1';
      const result = parseOpggUrl(url);

      expect(result).toEqual({
        summonerName: 'TestPlayer',
        tagLine: 'JP1',
        region: 'jp',
        cleanedUrl: 'https://op.gg/summoners/jp/TestPlayer-JP1',
      });
    });

    it('ロケールなしURLを解析', () => {
      const url = 'https://op.gg/lol/summoners/jp/TestPlayer-JP1';
      const result = parseOpggUrl(url);

      expect(result).toEqual({
        summonerName: 'TestPlayer',
        tagLine: 'JP1',
        region: 'jp',
        cleanedUrl: 'https://op.gg/summoners/jp/TestPlayer-JP1',
      });
    });

    it('短い形式のURLを解析', () => {
      const url = 'https://op.gg/summoners/jp/TestPlayer-JP1';
      const result = parseOpggUrl(url);

      expect(result).toEqual({
        summonerName: 'TestPlayer',
        tagLine: 'JP1',
        region: 'jp',
        cleanedUrl: 'https://op.gg/summoners/jp/TestPlayer-JP1',
      });
    });

    it('championsパスを削除', () => {
      const url = 'https://www.op.gg/summoners/jp/TestPlayer-JP1/champions';
      const result = parseOpggUrl(url);
      
      expect(result.cleanedUrl).toBe('https://op.gg/summoners/jp/TestPlayer-JP1');
    });

    it('masteryパスを削除', () => {
      const url = 'https://www.op.gg/summoners/jp/TestPlayer-JP1/mastery';
      const result = parseOpggUrl(url);
      
      expect(result.cleanedUrl).toBe('https://op.gg/summoners/jp/TestPlayer-JP1');
    });

    it('ingameパスを削除', () => {
      const url = 'https://www.op.gg/summoners/jp/TestPlayer-JP1/ingame';
      const result = parseOpggUrl(url);
      
      expect(result.cleanedUrl).toBe('https://op.gg/summoners/jp/TestPlayer-JP1');
    });

    it('未知のパスを削除', () => {
      const url = 'https://www.op.gg/summoners/jp/TestPlayer-JP1/xxxxxxx';
      const result = parseOpggUrl(url);
      
      expect(result.cleanedUrl).toBe('https://op.gg/summoners/jp/TestPlayer-JP1');
    });

    it('クエリパラメータを削除', () => {
      const url = 'https://www.op.gg/summoners/jp/TestPlayer-JP1?refresh=true';
      const result = parseOpggUrl(url);
      
      expect(result).toEqual({
        summonerName: 'TestPlayer',
        tagLine: 'JP1',
        region: 'jp',
        cleanedUrl: 'https://op.gg/summoners/jp/TestPlayer-JP1',
      });
    });

    it('フラグメントを削除', () => {
      const url = 'https://www.op.gg/lol/summoners/jp/TestPlayer-JP1#hash';
      const result = parseOpggUrl(url);
      
      expect(result).toEqual({
        summonerName: 'TestPlayer',
        tagLine: 'JP1',
        region: 'jp',
        cleanedUrl: 'https://op.gg/summoners/jp/TestPlayer-JP1',
      });
    });

    it('末尾のスペースを無視', () => {
      const url = 'https://op.gg/summoners/jp/TestPlayer-JP1  　  ';
      const result = parseOpggUrl(url);
      
      expect(result).toEqual({
        summonerName: 'TestPlayer',
        tagLine: 'JP1',
        region: 'jp',
        cleanedUrl: 'https://op.gg/summoners/jp/TestPlayer-JP1',
      });
    });

    it('日本語サモナー名をデコード', () => {
      const url = 'https://www.op.gg/summoners/jp/%E3%83%86%E3%82%B9%E3%83%88-JP1';
      const result = parseOpggUrl(url);
      
      expect(result).toEqual({
        summonerName: 'テスト',
        tagLine: 'JP1',
        region: 'jp',
        cleanedUrl: 'https://op.gg/summoners/jp/%E3%83%86%E3%82%B9%E3%83%88-JP1',
      });
    });

    it('日本語タグラインをデコード', () => {
      const url = 'https://www.op.gg/summoners/jp/TestPlayer-%E3%83%86%E3%82%B9%E3%83%88';
      const result = parseOpggUrl(url);
      
      expect(result).toEqual({
        summonerName: 'TestPlayer',
        tagLine: 'テスト',
        region: 'jp',
        cleanedUrl: 'https://op.gg/summoners/jp/TestPlayer-%E3%83%86%E3%82%B9%E3%83%88',
      });
    });

    it('日本語URLを解析', () => {
      const url = 'https://op.gg/ja/lol/summoners/jp/テスト-テスト';
      const result = parseOpggUrl(url);

      expect(result).toEqual({
        summonerName: 'テスト',
        tagLine: 'テスト',
        region: 'jp',
        cleanedUrl: 'https://op.gg/summoners/jp/%E3%83%86%E3%82%B9%E3%83%88-%E3%83%86%E3%82%B9%E3%83%88',
      });
    });

    it('特殊文字を含むサモナー名', () => {
      const url = 'https://www.op.gg/summoners/jp/Test%20Player%23123-αβγ';
      const result = parseOpggUrl(url);
      
      expect(result.summonerName).toBe('Test Player#123');
      expect(result.tagLine).toBe('αβγ');
    });

    it('タグラインがない場合はデフォルトJP1', () => {
      const url = 'https://www.op.gg/summoners/jp/TestPlayer';
      const result = parseOpggUrl(url);
      
      expect(result.summonerName).toBe('TestPlayer');
      expect(result.tagLine).toBe('JP1');
    });

    it('スペースを含むサモナー名', () => {
      const url = 'https://www.op.gg/summoners/jp/Test%20Player-KR';
      const result = parseOpggUrl(url);
      
      expect(result.summonerName).toBe('Test Player');
      expect(result.tagLine).toBe('KR');
    });

    it('無効なURLの場合 undefined', () => {
      expect(parseOpggUrl(null)).toBeUndefined();
      expect(parseOpggUrl('')).toBeUndefined();
      expect(parseOpggUrl(123)).toBeUndefined();
    });

    it('サモナー情報が抽出できない場合 undefined', () => {
      const url = 'https://www.op.gg/summoners/jp/';
      expect(parseOpggUrl(url)).toBeUndefined();
    });
  });

  describe('formatSummonerDisplayName', () => {
    it('サモナー名とタグラインを結合', () => {
      const result = formatSummonerDisplayName('TestPlayer', 'JP1');
      expect(result).toBe('TestPlayer#JP1');
    });

    it('日本語名でも正しく結合', () => {
      const result = formatSummonerDisplayName('テストプレイヤー', 'JP1');
      expect(result).toBe('テストプレイヤー#JP1');
    });

    it('特殊文字を含む名前', () => {
      const result = formatSummonerDisplayName('Test Player 123', 'NA1');
      expect(result).toBe('Test Player 123#NA1');
    });
  });

  describe('buildOpggUrl', () => {
    it('デフォルトリージョンでURL構築', () => {
      const url = buildOpggUrl('TestPlayer', 'JP1');
      expect(url).toBe('https://op.gg/summoners/jp/TestPlayer-JP1');
    });

    it('指定リージョンでURL構築', () => {
      const url = buildOpggUrl('TestPlayer', 'NA1', 'na');
      expect(url).toBe('https://op.gg/summoners/na/TestPlayer-NA1');
    });

    it('日本語名をエンコード', () => {
      const url = buildOpggUrl('テストプレイヤー', 'テストタグ');
      expect(url).toContain(`${encodeURIComponent("テストプレイヤー")}-${encodeURIComponent("テストタグ")}`);
    });

    it('スペースを含む名前をエンコード', () => {
      const url = buildOpggUrl('Test Player', 'テスト タグ');
      expect(url).toContain(`Test%20Player-${encodeURIComponent("テスト タグ")}`);
    });

    it('特殊文字をエンコード', () => {
      const url = buildOpggUrl('Test#Player', 'JP1');
      expect(url).toContain('Test%23Player');
    });
  });
});