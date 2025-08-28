// globalThisにプロパティを生やすやつ
declare namespace globalThis {
  function onFormSubmit(e: GoogleAppsScript.Events.SheetsOnFormSubmit): unknown;
}
