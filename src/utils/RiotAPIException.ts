/**
 * Riot API通信エラー用のカスタム例外クラス
 */
export class RiotAPIException extends Error {
  public apiResponse: any;
  constructor(message: string, apiResponse: any) {
    super(
      `Err: ${message}${apiResponse?.message || ""} (${apiResponse?.status_code || "Unknown"})`,
    );
    this.name = "RiotAPIException";
    this.apiResponse = apiResponse;
  }
}
