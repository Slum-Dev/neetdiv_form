/**
 * Riot API通信エラー用のカスタム例外クラス
 */
export class RiotAPIException extends Error {
  constructor(message, apiResponse) {
    super(
      `Err: ${message}${apiResponse?.message || ""} (${apiResponse?.status_code || "Unknown"})`,
    );
    this.name = "RiotAPIException";
    this.apiResponse = apiResponse;
  }
}
