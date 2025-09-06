import type {
  RiotAPIService,
  SpreadsheetService,
} from "./FormSubmissionHandler.js";
import { FormSubmissionHandler } from "./FormSubmissionHandler.js";

/**
 * レートリミットで失敗した項目を再取得するハンドラ
 */
export class FormRetryHandler {
  private sheet: SpreadsheetService;
  private riotAPI: RiotAPIService;

  constructor(
    spreadsheetService: SpreadsheetService,
    riotAPIService: RiotAPIService,
  ) {
    this.sheet = spreadsheetService;
    this.riotAPI = riotAPIService;
  }

  async handle() {
    const rows = this.getRetryableRows();
    for (const row of rows) {
      const handler = new FormSubmissionHandler(this.sheet, this.riotAPI);
      await handler.handle(row);
    }
  }

  /**
   * 再取得するべきエラーが記録された行番号を返す
   */
  getRetryableRows(): number[] {
    const retryKeywords = [
      "RiotAPIError: 429",
      "RiotAPIError: 500",
      "RiotAPIError: 503",
    ];

    const rows = new Set<number>();
    for (const keyword of retryKeywords) {
      for (const { row, column } of this.sheet.findCell(keyword)) {
        const cellValue = String(this.sheet.getCellValue(row, column));
        if (cellValue.startsWith("Err:")) {
          rows.add(row);
        }
      }
    }
    return [...rows.values()];
  }
}
