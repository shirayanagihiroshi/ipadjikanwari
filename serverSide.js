function doGet () {
  return HtmlService.createHtmlOutputFromFile('clientSide');
}

function test () {
  getNaiyouFromDB();
}

// なお、A列はシリアルの日付で、これはそのままではクライアントに返せない
// B列はA列を文字列にしたもので、これを代わりに返す。
// 以下でB列からの4列分にしてあるのはそういう意図
function getNaiyouFromDB() {
  const sheetName = 'SHRMemo';
  let str, sheet, range, values,
    lock = LockService.getScriptLock();

  if (lock.tryLock(3000)) { // 処理が重複した場合、3秒間は他の人が終わるのを待つ

    sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    range = sheet.getRange(1,2,366,4); // 1年分とる
    values = range.getValues()

    lock.releaseLock(); //ロックを解除

  } else {
    // do nothing
  }

  return {
    result : values
  }
}
