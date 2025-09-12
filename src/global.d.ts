// globalThisにプロパティを生やすやつ
declare namespace globalThis {
  function onFormSubmit(e: GoogleAppsScript.Events.SheetsOnFormSubmit): unknown;
  function onOpen(): unknown;
  function removeAllFormEntry(): void;
  function showRemoveBeforeDialog(): void;
  function sendToRemoveDataByDatetime(
    thresholdDatetime: string | null | undefined,
  ): number;
  function clearDraft(): void;
}
