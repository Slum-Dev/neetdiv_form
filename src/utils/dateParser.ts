/**
 * 日時文字列からDate型日時に変換
 * @param timestamp 日時文字列
 * @returns 日時
 */
export function parseFormsTimestamp(timestamp: string | null | undefined) {
  if (!timestamp) {
    throw new Error("タイムスタンプが指定されていません。");
  }

  var m = String(timestamp).match(
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2}):(\d{2})$/,
  );
  if (!m) {
    throw new Error(
      "タイムスタンプの形式が不正です。'yyyy/MM/dd H:mm:ss' を指定してください。受け取った値: " +
        timestamp,
    );
  }

  var year = Number(m[1]);
  var month = Number(m[2]) - 1;
  var day = Number(m[3]);
  var hour = Number(m[4]);
  var minute = Number(m[5]);
  var second = Number(m[6]);

  return new Date(year, month, day, hour, minute, second);
}
