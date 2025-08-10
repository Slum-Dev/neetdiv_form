import { describe, it, expect } from 'vitest';
import {
  parseOpggUrl,
  formatSummonerDisplayName,
  buildOpggUrl,
  isValidOpggUrl,
  extractRegionFromUrl
} from './urlParser.js';

describe('urlParser', () => {
  describe('parseOpggUrl', () => {
    it('標準的なOPGG URLを解析', () => {
      const url = 'https://www.op.gg/summoners/jp/TestPlayer-JP1';
      const result = parseOpggUrl(url);
      
      expect(result).toEqual({
        summonerName: 'TestPlayer',
        tagLine: 'JP1',
        cleanedUrl: 'https://www.op.gg/summoners/jp/TestPlayer-JP1'
      });
    });

    it('championsパスを削除', () => {
      const url = 'https://www.op.gg/summoners/jp/TestPlayer-JP1/champions';
      const result = parseOpggUrl(url);
      
      expect(result.cleanedUrl).toBe('https://www.op.gg/summoners/jp/TestPlayer-JP1');
    });

    it('masteryパスを削除', () => {
      const url = 'https://www.op.gg/summoners/jp/TestPlayer-JP1/mastery';
      const result = parseOpggUrl(url);
      
      expect(result.cleanedUrl).toBe('https://www.op.gg/summoners/jp/TestPlayer-JP1');
    });

    it('ingameパスを削除', () => {
      const url = 'https://www.op.gg/summoners/jp/TestPlayer-JP1/ingame';
      const result = parseOpggUrl(url);
      
      expect(result.cleanedUrl).toBe('https://www.op.gg/summoners/jp/TestPlayer-JP1');
    });

    it('クエリパラメータを削除', () => {
      const url = 'https://www.op.gg/summoners/jp/TestPlayer-JP1?refresh=true';
      const result = parseOpggUrl(url);
      
      expect(result).toEqual({
        summonerName: 'TestPlayer',
        tagLine: 'JP1',
        cleanedUrl: 'https://www.op.gg/summoners/jp/TestPlayer-JP1?refresh=true'
      });
    });

    it('日本語サモナー名をデコード', () => {
      const url = 'https://www.op.gg/summoners/jp/%E3%83%86%E3%82%B9%E3%83%88-JP1';
      const result = parseOpggUrl(url);
      
      expect(result.summonerName).toBe('テスト');
      expect(result.tagLine).toBe('JP1');
    });

    it('特殊文字を含むサモナー名', () => {
      const url = 'https://www.op.gg/summoners/jp/Test%20Player%23123-JP1';
      const result = parseOpggUrl(url);
      
      expect(result.summonerName).toBe('Test Player#123');
      expect(result.tagLine).toBe('JP1');
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

    it('無効なURLの場合エラー', () => {
      expect(() => parseOpggUrl(null)).toThrow('有効なURLを指定してください');
      expect(() => parseOpggUrl('')).toThrow('有効なURLを指定してください');
      expect(() => parseOpggUrl(123)).toThrow('有効なURLを指定してください');
    });

    it('サモナー情報が抽出できない場合エラー', () => {
      const url = 'https://www.op.gg/summoners/jp/';
      expect(() => parseOpggUrl(url)).toThrow('URLからサモナー情報を抽出できません');
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
      expect(url).toBe('https://www.op.gg/summoners/jp/TestPlayer-JP1');
    });

    it('指定リージョンでURL構築', () => {
      const url = buildOpggUrl('TestPlayer', 'NA1', 'na');
      expect(url).toBe('https://www.op.gg/summoners/na/TestPlayer-NA1');
    });

    it('日本語名をエンコード', () => {
      const url = buildOpggUrl('テストプレイヤー', 'JP1');
      expect(url).toContain(encodeURIComponent('テストプレイヤー'));
    });

    it('スペースを含む名前をエンコード', () => {
      const url = buildOpggUrl('Test Player', 'JP1');
      expect(url).toBe('https://www.op.gg/summoners/jp/Test%20Player-JP1');
    });

    it('特殊文字をエンコード', () => {
      const url = buildOpggUrl('Test#Player', 'JP1');
      expect(url).toContain('Test%23Player');
    });
  });

  describe('isValidOpggUrl', () => {
    it('有効なOPGG URLを判定', () => {
      expect(isValidOpggUrl('https://www.op.gg/summoners/jp/Test-JP1')).toBe(true);
      expect(isValidOpggUrl('https://op.gg/summoners/kr/Test-KR')).toBe(true);
      expect(isValidOpggUrl('http://www.op.gg/summoners/na/Test-NA1')).toBe(true);
    });

    it('無効なURLを判定', () => {
      expect(isValidOpggUrl('https://example.com')).toBe(false);
      expect(isValidOpggUrl('https://www.op.gg/champions')).toBe(false);
      expect(isValidOpggUrl('not-a-url')).toBe(false);
      expect(isValidOpggUrl(null)).toBe(false);
      expect(isValidOpggUrl('')).toBe(false);
      expect(isValidOpggUrl(123)).toBe(false);
    });

    it('大文字小文字を無視', () => {
      expect(isValidOpggUrl('HTTPS://WWW.OP.GG/SUMMONERS/jp/Test-JP1')).toBe(true);
      expect(isValidOpggUrl('https://www.OP.gg/Summoners/jp/Test-JP1')).toBe(true);
    });
  });

  describe('extractRegionFromUrl', () => {
    it('URLからリージョンを抽出', () => {
      expect(extractRegionFromUrl('https://www.op.gg/summoners/jp/Test-JP1')).toBe('jp');
      expect(extractRegionFromUrl('https://www.op.gg/summoners/kr/Test-KR')).toBe('kr');
      expect(extractRegionFromUrl('https://www.op.gg/summoners/na/Test-NA1')).toBe('na');
      expect(extractRegionFromUrl('https://www.op.gg/summoners/euw/Test-EUW')).toBe('euw');
    });

    it('大文字のリージョンを小文字に変換', () => {
      expect(extractRegionFromUrl('https://www.op.gg/summoners/JP/Test-JP1')).toBe('jp');
      expect(extractRegionFromUrl('https://www.op.gg/summoners/KR/Test-KR')).toBe('kr');
    });

    it('リージョンが見つからない場合null', () => {
      expect(extractRegionFromUrl('https://www.op.gg/champions')).toBeNull();
      expect(extractRegionFromUrl('https://example.com')).toBeNull();
      expect(extractRegionFromUrl('not-a-url')).toBeNull();
    });

    it('追加パスがあってもリージョンを抽出', () => {
      expect(extractRegionFromUrl('https://www.op.gg/summoners/jp/Test-JP1/champions')).toBe('jp');
      expect(extractRegionFromUrl('https://www.op.gg/summoners/kr/Test-KR/mastery')).toBe('kr');
    });
  });
});