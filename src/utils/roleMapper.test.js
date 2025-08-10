import { describe, it, expect } from 'vitest';
import {
  mapFormRoleToAPI,
  mapAPIRoleToForm,
  isValidFormRole,
  isValidAPIRole,
  getAllFormRoles,
  getAllAPIRoles,
  getRoleDisplayName,
  createRoleStatistics
} from './roleMapper.js';

describe('roleMapper', () => {
  describe('mapFormRoleToAPI', () => {
    it('フォームロールをAPIロールに変換', () => {
      expect(mapFormRoleToAPI('TOP')).toBe('TOP');
      expect(mapFormRoleToAPI('JG')).toBe('JUNGLE');
      expect(mapFormRoleToAPI('MID')).toBe('MIDDLE');
      expect(mapFormRoleToAPI('BOT')).toBe('BOTTOM');
      expect(mapFormRoleToAPI('SUP')).toBe('UTILITY');
    });

    it('小文字のロールを大文字に変換', () => {
      expect(mapFormRoleToAPI('top')).toBe('TOP');
      expect(mapFormRoleToAPI('jg')).toBe('JUNGLE');
      expect(mapFormRoleToAPI('mid')).toBe('MIDDLE');
      expect(mapFormRoleToAPI('bot')).toBe('BOTTOM');
      expect(mapFormRoleToAPI('sup')).toBe('UTILITY');
    });

    it('混合ケースでも変換', () => {
      expect(mapFormRoleToAPI('Top')).toBe('TOP');
      expect(mapFormRoleToAPI('jG')).toBe('JUNGLE');
      expect(mapFormRoleToAPI('MiD')).toBe('MIDDLE');
    });

    it('無効なロールはそのまま返す', () => {
      expect(mapFormRoleToAPI('INVALID')).toBe('INVALID');
      expect(mapFormRoleToAPI('ADC')).toBe('ADC');
    });

    it('空文字やnullの場合は空文字を返す', () => {
      expect(mapFormRoleToAPI('')).toBe('');
      expect(mapFormRoleToAPI(null)).toBe('');
      expect(mapFormRoleToAPI(undefined)).toBe('');
    });
  });

  describe('mapAPIRoleToForm', () => {
    it('APIロールをフォームロールに変換', () => {
      expect(mapAPIRoleToForm('TOP')).toBe('TOP');
      expect(mapAPIRoleToForm('JUNGLE')).toBe('JG');
      expect(mapAPIRoleToForm('MIDDLE')).toBe('MID');
      expect(mapAPIRoleToForm('BOTTOM')).toBe('BOT');
      expect(mapAPIRoleToForm('UTILITY')).toBe('SUP');
    });

    it('小文字のAPIロールも変換', () => {
      expect(mapAPIRoleToForm('top')).toBe('TOP');
      expect(mapAPIRoleToForm('jungle')).toBe('JG');
      expect(mapAPIRoleToForm('middle')).toBe('MID');
      expect(mapAPIRoleToForm('bottom')).toBe('BOT');
      expect(mapAPIRoleToForm('utility')).toBe('SUP');
    });

    it('無効なロールはそのまま返す', () => {
      expect(mapAPIRoleToForm('INVALID')).toBe('INVALID');
      expect(mapAPIRoleToForm('SUPPORT')).toBe('SUPPORT');
    });

    it('空文字やnullの場合は空文字を返す', () => {
      expect(mapAPIRoleToForm('')).toBe('');
      expect(mapAPIRoleToForm(null)).toBe('');
      expect(mapAPIRoleToForm(undefined)).toBe('');
    });
  });

  describe('isValidFormRole', () => {
    it('有効なフォームロールを判定', () => {
      expect(isValidFormRole('TOP')).toBe(true);
      expect(isValidFormRole('JG')).toBe(true);
      expect(isValidFormRole('MID')).toBe(true);
      expect(isValidFormRole('BOT')).toBe(true);
      expect(isValidFormRole('SUP')).toBe(true);
    });

    it('小文字でも有効と判定', () => {
      expect(isValidFormRole('top')).toBe(true);
      expect(isValidFormRole('jg')).toBe(true);
      expect(isValidFormRole('mid')).toBe(true);
      expect(isValidFormRole('bot')).toBe(true);
      expect(isValidFormRole('sup')).toBe(true);
    });

    it('混合ケースでも有効と判定', () => {
      expect(isValidFormRole('Top')).toBe(true);
      expect(isValidFormRole('Jg')).toBe(true);
    });

    it('無効なロールをfalseと判定', () => {
      expect(isValidFormRole('JUNGLE')).toBe(false);
      expect(isValidFormRole('ADC')).toBe(false);
      expect(isValidFormRole('SUPPORT')).toBe(false);
      expect(isValidFormRole('INVALID')).toBe(false);
    });

    it('空文字やnullをfalseと判定', () => {
      expect(isValidFormRole('')).toBe(false);
      expect(isValidFormRole(null)).toBe(false);
      expect(isValidFormRole(undefined)).toBe(false);
    });
  });

  describe('isValidAPIRole', () => {
    it('有効なAPIロールを判定', () => {
      expect(isValidAPIRole('TOP')).toBe(true);
      expect(isValidAPIRole('JUNGLE')).toBe(true);
      expect(isValidAPIRole('MIDDLE')).toBe(true);
      expect(isValidAPIRole('BOTTOM')).toBe(true);
      expect(isValidAPIRole('UTILITY')).toBe(true);
    });

    it('小文字でも有効と判定', () => {
      expect(isValidAPIRole('top')).toBe(true);
      expect(isValidAPIRole('jungle')).toBe(true);
      expect(isValidAPIRole('middle')).toBe(true);
      expect(isValidAPIRole('bottom')).toBe(true);
      expect(isValidAPIRole('utility')).toBe(true);
    });

    it('無効なロールをfalseと判定', () => {
      expect(isValidAPIRole('JG')).toBe(false);
      expect(isValidAPIRole('MID')).toBe(false);
      expect(isValidAPIRole('BOT')).toBe(false);
      expect(isValidAPIRole('SUP')).toBe(false);
      expect(isValidAPIRole('SUPPORT')).toBe(false);
      expect(isValidAPIRole('INVALID')).toBe(false);
    });

    it('空文字やnullをfalseと判定', () => {
      expect(isValidAPIRole('')).toBe(false);
      expect(isValidAPIRole(null)).toBe(false);
      expect(isValidAPIRole(undefined)).toBe(false);
    });
  });

  describe('getAllFormRoles', () => {
    it('全てのフォームロールを返す', () => {
      const roles = getAllFormRoles();
      expect(roles).toEqual(['TOP', 'JG', 'MID', 'BOT', 'SUP']);
    });

    it('返される配列は元配列と同じ', () => {
      const roles1 = getAllFormRoles();
      const roles2 = getAllFormRoles();
      expect(roles1).toEqual(roles2);
    });
  });

  describe('getAllAPIRoles', () => {
    it('全てのAPIロールを返す', () => {
      const roles = getAllAPIRoles();
      expect(roles).toEqual(['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY']);
    });

    it('返される配列は元配列と同じ', () => {
      const roles1 = getAllAPIRoles();
      const roles2 = getAllAPIRoles();
      expect(roles1).toEqual(roles2);
    });
  });

  describe('getRoleDisplayName', () => {
    it('フォームロールの日本語表示名を返す', () => {
      expect(getRoleDisplayName('TOP')).toBe('トップ');
      expect(getRoleDisplayName('JG')).toBe('ジャングル');
      expect(getRoleDisplayName('MID')).toBe('ミッド');
      expect(getRoleDisplayName('BOT')).toBe('ボット');
      expect(getRoleDisplayName('SUP')).toBe('サポート');
    });

    it('APIロールの日本語表示名を返す', () => {
      expect(getRoleDisplayName('TOP')).toBe('トップ');
      expect(getRoleDisplayName('JUNGLE')).toBe('ジャングル');
      expect(getRoleDisplayName('MIDDLE')).toBe('ミッド');
      expect(getRoleDisplayName('BOTTOM')).toBe('ボット');
      expect(getRoleDisplayName('UTILITY')).toBe('サポート');
    });

    it('小文字でも表示名を返す', () => {
      expect(getRoleDisplayName('top')).toBe('トップ');
      expect(getRoleDisplayName('jungle')).toBe('ジャングル');
      expect(getRoleDisplayName('jg')).toBe('ジャングル');
    });

    it('混合ケースでも表示名を返す', () => {
      expect(getRoleDisplayName('Top')).toBe('トップ');
      expect(getRoleDisplayName('Jungle')).toBe('ジャングル');
    });

    it('不明なロールはそのまま返す', () => {
      expect(getRoleDisplayName('UNKNOWN')).toBe('UNKNOWN');
      expect(getRoleDisplayName('SUPPORT')).toBe('SUPPORT');
    });

    it('空文字やnullの場合は「不明」を返す', () => {
      expect(getRoleDisplayName('')).toBe('不明');
      expect(getRoleDisplayName(null)).toBe('不明');
      expect(getRoleDisplayName(undefined)).toBe('不明');
    });
  });

  describe('createRoleStatistics', () => {
    it('全てのAPIロールが0で初期化されたオブジェクトを返す', () => {
      const stats = createRoleStatistics();
      expect(stats).toEqual({
        TOP: 0,
        JUNGLE: 0,
        MIDDLE: 0,
        BOTTOM: 0,
        UTILITY: 0
      });
    });

    it('毎回新しいオブジェクトを返す', () => {
      const stats1 = createRoleStatistics();
      const stats2 = createRoleStatistics();
      
      stats1.TOP = 5;
      expect(stats2.TOP).toBe(0); // stats2は影響を受けない
    });

    it('返されるオブジェクトは変更可能', () => {
      const stats = createRoleStatistics();
      stats.TOP = 10;
      stats.JUNGLE = 5;
      
      expect(stats.TOP).toBe(10);
      expect(stats.JUNGLE).toBe(5);
      expect(stats.MIDDLE).toBe(0); // その他は変更されない
    });
  });

  describe('統合テスト', () => {
    it('フォームロール → APIロール → フォームロール', () => {
      const originalRoles = ['TOP', 'JG', 'MID', 'BOT', 'SUP'];
      
      for (const role of originalRoles) {
        const apiRole = mapFormRoleToAPI(role);
        const backToForm = mapAPIRoleToForm(apiRole);
        expect(backToForm).toBe(role);
      }
    });

    it('APIロール → フォームロール → APIロール', () => {
      const originalRoles = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
      
      for (const role of originalRoles) {
        const formRole = mapAPIRoleToForm(role);
        const backToAPI = mapFormRoleToAPI(formRole);
        expect(backToAPI).toBe(role);
      }
    });

    it('全ロールが有効性チェックを通る', () => {
      const formRoles = getAllFormRoles();
      const apiRoles = getAllAPIRoles();
      
      for (const role of formRoles) {
        expect(isValidFormRole(role)).toBe(true);
      }
      
      for (const role of apiRoles) {
        expect(isValidAPIRole(role)).toBe(true);
      }
    });

    it('全ロールに表示名が設定されている', () => {
      const formRoles = getAllFormRoles();
      const apiRoles = getAllAPIRoles();
      
      for (const role of formRoles) {
        const displayName = getRoleDisplayName(role);
        expect(displayName).not.toBe('不明');
        expect(displayName).not.toBe(role); // 日本語表示名が設定されている
      }
      
      for (const role of apiRoles) {
        const displayName = getRoleDisplayName(role);
        expect(displayName).not.toBe('不明');
        expect(displayName).not.toBe(role); // 日本語表示名が設定されている
      }
    });
  });
});