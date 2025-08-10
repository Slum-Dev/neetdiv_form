import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { SpreadsheetService } from './SpreadsheetService.js';
import { MockSpreadsheetService } from '../__mocks__/SpreadsheetService.js';

// Google Sheetsのモックオブジェクト
const createMockSheet = () => ({
  getLastRow: jest.fn(),
  getLastColumn: jest.fn(),
  getRange: jest.fn(),
  deleteRows: jest.fn(),
  clear: jest.fn(),
  insertRowsAfter: jest.fn()
});

const createMockRange = (value = '') => ({
  getValue: jest.fn(() => value),
  setValue: jest.fn(),
  setFormula: jest.fn(),
  getValues: jest.fn(() => [[value]]),
  setValues: jest.fn(),
  setBackground: jest.fn(),
  setFontWeight: jest.fn(),
  setFontStyle: jest.fn(),
  setFontColor: jest.fn()
});

describe('SpreadsheetService', () => {
  let service;
  let mockSheet;

  beforeEach(() => {
    mockSheet = createMockSheet();
    service = new SpreadsheetService(mockSheet);
  });

  describe('constructor', () => {
    it('シートオブジェクトが必須', () => {
      expect(() => new SpreadsheetService(null)).toThrow('Sheet object is required');
      expect(() => new SpreadsheetService(undefined)).toThrow('Sheet object is required');
    });
  });

  describe('getLastRow', () => {
    it('最終行番号を返す', () => {
      mockSheet.getLastRow.mockReturnValue(10);
      expect(service.getLastRow()).toBe(10);
      expect(mockSheet.getLastRow).toHaveBeenCalled();
    });
  });

  describe('getCellValue', () => {
    it('指定セルの値を取得', () => {
      const mockRange = createMockRange('test value');
      mockSheet.getRange.mockReturnValue(mockRange);

      const result = service.getCellValue(5, 3);

      expect(result).toBe('test value');
      expect(mockSheet.getRange).toHaveBeenCalledWith(5, 3);
      expect(mockRange.getValue).toHaveBeenCalled();
    });
  });

  describe('setCellValue', () => {
    it('指定セルに値を設定', () => {
      const mockRange = createMockRange();
      mockSheet.getRange.mockReturnValue(mockRange);

      service.setCellValue(5, 3, 'new value');

      expect(mockSheet.getRange).toHaveBeenCalledWith(5, 3);
      expect(mockRange.setValue).toHaveBeenCalledWith('new value');
    });
  });

  describe('setHyperlink', () => {
    it('ハイパーリンクを設定（ラベルあり）', () => {
      const mockRange = createMockRange();
      mockSheet.getRange.mockReturnValue(mockRange);

      service.setHyperlink(5, 3, 'https://example.com', 'Example');

      expect(mockSheet.getRange).toHaveBeenCalledWith(5, 3);
      expect(mockRange.setFormula).toHaveBeenCalledWith(
        '=HYPERLINK("https://example.com", "Example")'
      );
    });

    it('ハイパーリンクを設定（ラベルなし）', () => {
      const mockRange = createMockRange();
      mockSheet.getRange.mockReturnValue(mockRange);

      service.setHyperlink(5, 3, 'https://example.com');

      expect(mockRange.setFormula).toHaveBeenCalledWith(
        '=HYPERLINK("https://example.com", "https://example.com")'
      );
    });
  });

  describe('getRangeValues', () => {
    it('範囲の値を2次元配列で取得', () => {
      const mockValues = [
        ['A1', 'B1', 'C1'],
        ['A2', 'B2', 'C2']
      ];
      const mockRange = {
        getValues: jest.fn(() => mockValues)
      };
      mockSheet.getRange.mockReturnValue(mockRange);

      const result = service.getRangeValues(1, 1, 2, 3);

      expect(result).toEqual(mockValues);
      expect(mockSheet.getRange).toHaveBeenCalledWith(1, 1, 2, 3);
    });
  });

  describe('setRangeValues', () => {
    it('範囲に値を一括設定', () => {
      const mockRange = {
        setValues: jest.fn()
      };
      mockSheet.getRange.mockReturnValue(mockRange);
      
      const values = [
        ['A1', 'B1'],
        ['A2', 'B2']
      ];

      service.setRangeValues(1, 1, values);

      expect(mockSheet.getRange).toHaveBeenCalledWith(1, 1, 2, 2);
      expect(mockRange.setValues).toHaveBeenCalledWith(values);
    });

    it('空配列の場合は何もしない', () => {
      service.setRangeValues(1, 1, []);
      expect(mockSheet.getRange).not.toHaveBeenCalled();
    });
  });

  describe('getRowValues', () => {
    it('行全体の値を取得', () => {
      mockSheet.getLastColumn.mockReturnValue(5);
      const mockRange = {
        getValues: jest.fn(() => [['A', 'B', 'C', 'D', 'E']])
      };
      mockSheet.getRange.mockReturnValue(mockRange);

      const result = service.getRowValues(3);

      expect(result).toEqual(['A', 'B', 'C', 'D', 'E']);
      expect(mockSheet.getRange).toHaveBeenCalledWith(3, 1, 1, 5);
    });
  });

  describe('setCellBackground', () => {
    it('セルの背景色を設定', () => {
      const mockRange = {
        setBackground: jest.fn()
      };
      mockSheet.getRange.mockReturnValue(mockRange);

      service.setCellBackground(5, 3, '#FF0000');

      expect(mockSheet.getRange).toHaveBeenCalledWith(5, 3);
      expect(mockRange.setBackground).toHaveBeenCalledWith('#FF0000');
    });
  });

  describe('setCellFontStyle', () => {
    it('フォントスタイルを全て設定', () => {
      const mockRange = {
        setFontWeight: jest.fn(),
        setFontStyle: jest.fn(),
        setFontColor: jest.fn()
      };
      mockSheet.getRange.mockReturnValue(mockRange);

      service.setCellFontStyle(5, 3, {
        bold: true,
        italic: false,
        color: '#0000FF'
      });

      expect(mockRange.setFontWeight).toHaveBeenCalledWith('bold');
      expect(mockRange.setFontStyle).toHaveBeenCalledWith('normal');
      expect(mockRange.setFontColor).toHaveBeenCalledWith('#0000FF');
    });

    it('部分的なスタイル設定', () => {
      const mockRange = {
        setFontWeight: jest.fn(),
        setFontStyle: jest.fn(),
        setFontColor: jest.fn()
      };
      mockSheet.getRange.mockReturnValue(mockRange);

      service.setCellFontStyle(5, 3, { bold: true });

      expect(mockRange.setFontWeight).toHaveBeenCalledWith('bold');
      expect(mockRange.setFontStyle).not.toHaveBeenCalled();
      expect(mockRange.setFontColor).not.toHaveBeenCalled();
    });
  });

  describe('insertRowsAfter', () => {
    it('指定行の後に行を挿入', () => {
      service.insertRowsAfter(5, 3);
      expect(mockSheet.insertRowsAfter).toHaveBeenCalledWith(5, 3);
    });

    it('デフォルトで1行挿入', () => {
      service.insertRowsAfter(5);
      expect(mockSheet.insertRowsAfter).toHaveBeenCalledWith(5, 1);
    });
  });

  describe('clearSheet', () => {
    it('ヘッダー行を保持してクリア', () => {
      mockSheet.getLastRow.mockReturnValue(10);

      service.clearSheet(true);

      expect(mockSheet.deleteRows).toHaveBeenCalledWith(2, 9);
      expect(mockSheet.clear).not.toHaveBeenCalled();
    });

    it('1行しかない場合は何もしない', () => {
      mockSheet.getLastRow.mockReturnValue(1);

      service.clearSheet(true);

      expect(mockSheet.deleteRows).not.toHaveBeenCalled();
      expect(mockSheet.clear).not.toHaveBeenCalled();
    });

    it('全てクリア', () => {
      service.clearSheet(false);

      expect(mockSheet.clear).toHaveBeenCalled();
      expect(mockSheet.deleteRows).not.toHaveBeenCalled();
    });
  });
});

describe('MockSpreadsheetService', () => {
  let mockService;

  beforeEach(() => {
    mockService = new MockSpreadsheetService();
  });

  it('値の設定と取得', () => {
    mockService.setCellValue(5, 3, 'test value');
    expect(mockService.getCellValue(5, 3)).toBe('test value');
  });

  it('存在しないセルは空文字を返す', () => {
    expect(mockService.getCellValue(10, 10)).toBe('');
  });

  it('最終行を更新', () => {
    expect(mockService.getLastRow()).toBe(1);
    
    mockService.setCellValue(10, 1, 'value');
    expect(mockService.getLastRow()).toBe(10);
    
    mockService.setCellValue(5, 1, 'value');
    expect(mockService.getLastRow()).toBe(10);
  });

  it('ハイパーリンクの設定', () => {
    mockService.setHyperlink(5, 3, 'https://example.com', 'Example');
    expect(mockService.formulas['5,3']).toBe('=HYPERLINK("https://example.com", "Example")');
  });

  it('範囲値の設定と取得', () => {
    const values = [
      ['A1', 'B1'],
      ['A2', 'B2']
    ];
    
    mockService.setRangeValues(1, 1, values);
    
    expect(mockService.getCellValue(1, 1)).toBe('A1');
    expect(mockService.getCellValue(1, 2)).toBe('B1');
    expect(mockService.getCellValue(2, 1)).toBe('A2');
    expect(mockService.getCellValue(2, 2)).toBe('B2');
    
    const retrieved = mockService.getRangeValues(1, 1, 2, 2);
    expect(retrieved).toEqual(values);
  });

  it('行値の取得', () => {
    mockService.setCellValue(3, 1, 'A');
    mockService.setCellValue(3, 2, 'B');
    mockService.setCellValue(3, 3, 'C');
    
    const rowValues = mockService.getRowValues(3);
    expect(rowValues[0]).toBe('A');
    expect(rowValues[1]).toBe('B');
    expect(rowValues[2]).toBe('C');
  });

  it('背景色の設定', () => {
    mockService.setCellBackground(5, 3, '#FF0000');
    expect(mockService.backgrounds['5,3']).toBe('#FF0000');
  });

  it('フォントスタイルの設定', () => {
    const style = { bold: true, color: '#0000FF' };
    mockService.setCellFontStyle(5, 3, style);
    expect(mockService.fontStyles['5,3']).toEqual(style);
  });

  it('行の挿入', () => {
    expect(mockService.getLastRow()).toBe(1);
    mockService.insertRowsAfter(5, 3);
    expect(mockService.getLastRow()).toBe(4);
  });

  it('シートのクリア（ヘッダー保持）', () => {
    mockService.setCellValue(1, 1, 'Header1');
    mockService.setCellValue(1, 2, 'Header2');
    mockService.setCellValue(2, 1, 'Data1');
    mockService.setCellValue(3, 1, 'Data2');
    
    mockService.clearSheet(true);
    
    expect(mockService.getCellValue(1, 1)).toBe('Header1');
    expect(mockService.getCellValue(1, 2)).toBe('Header2');
    expect(mockService.getCellValue(2, 1)).toBe('');
    expect(mockService.getLastRow()).toBe(1);
  });

  it('シートの完全クリア', () => {
    mockService.setCellValue(1, 1, 'Header');
    mockService.setCellValue(2, 1, 'Data');
    mockService.setHyperlink(3, 1, 'https://example.com');
    
    mockService.clearSheet(false);
    
    expect(mockService.getCellValue(1, 1)).toBe('');
    expect(mockService.getCellValue(2, 1)).toBe('');
    expect(mockService.formulas).toEqual({});
    expect(mockService.getLastRow()).toBe(0);
  });
});