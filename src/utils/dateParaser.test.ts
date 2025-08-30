import { describe, expect, it } from "vitest";
import { parseFormsTimestamp } from "./dateParser.js";

describe("parseFormsTimestamp", () => {
  it("正しく日付文字列を解析", () => {
    const date = parseFormsTimestamp("2024/06/01 9:05:07");
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(5); // 6月は5
    expect(date.getDate()).toBe(1);
    expect(date.getHours()).toBe(9);
    expect(date.getMinutes()).toBe(5);
    expect(date.getSeconds()).toBe(7);
  });

  it("2桁の月日時分秒を解析", () => {
    const date = parseFormsTimestamp("2023/12/31 23:59:59");
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(11); // 12月 は 11
    expect(date.getDate()).toBe(31);
    expect(date.getHours()).toBe(23);
    expect(date.getMinutes()).toBe(59);
    expect(date.getSeconds()).toBe(59);
  });

  it("指定フォーマット以外の日時を受け取るとErrorになる", () => {
    expect(() => parseFormsTimestamp("2024-06-01 09:05:07")).toThrow();
    expect(() => parseFormsTimestamp("2024/6/1")).toThrow();
    expect(() => parseFormsTimestamp("")).toThrow();
    expect(() => parseFormsTimestamp(null)).toThrow();
    expect(() => parseFormsTimestamp(undefined)).toThrow();
    expect(() => parseFormsTimestamp("2024/06/01 9:5:7")).toThrow();
  });

  it("日付のみで時間がない場合Errorになる", () => {
    expect(() => parseFormsTimestamp("2024/06/01")).toThrow();
  });

  it("時間のみで日付がない場合Errorになる", () => {
    expect(() => parseFormsTimestamp("09:05:07")).toThrow();
  });
});
