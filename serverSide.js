function doGet () {
  return HtmlService.createHtmlOutputFromFile('index');
}

function getCalendarFromDB() {
  const sheetName = 'calendar';

  let sheet, range, values,
    lock = LockService.getScriptLock();

  if (lock.tryLock(5000)) { // 処理が重複した場合、5秒間は他の人が終わるのを待つ

    sheet = SpreadsheetApp.openById(calendarSheetId).getSheetByName(sheetName);
    range = sheet.getRange(1,1,sheet.getLastRow(),5); // AからEで5列
    values = range.getValues();

    lock.releaseLock(); //ロックを解除

  } else {
    // do nothing
  }

  return {
    result : values
  }
}

function getJikanwariFromDB() {
  const sheetName = 'jikanwari';

  let sheet, range, values,
    lock = LockService.getScriptLock();

  if (lock.tryLock(5000)) { // 処理が重複した場合、5秒間は他の人が終わるのを待つ

    sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    range = sheet.getRange(1,1,16,7); // (１限から7限+タイトル)*2で16行, AからGで7列
    values = range.getValues();

    lock.releaseLock(); //ロックを解除

  } else {
    // do nothing
  }

  return {
    result : values
  }
}

function getNaiyouFromDB(year, month, day) {
  const sheetName = 'query';
  let str, sheet, range, values,
    lock = LockService.getScriptLock();

  if (lock.tryLock(5000)) { // 処理が重複した場合、5秒間は他の人が終わるのを待つ

    sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    range = sheet.getRange(1,1,1,1);

    // まずはqueryシートにqueryを書き、該当データを絞り込む
    str = '=query(' + "'" + getNaiyouSheetName(month) + "'" + '!A:G,';
    str += '"select A,B,C,D,E,F,G where A = ' + String(day) + ' order by B asc, G desc",1)';
    range.setValues([[str]]);

    // queryで絞り込まれたデータを取得し、返す。
    range = sheet.getRange(1,1,sheet.getLastRow(),7); // AからGで7列
    values = range.getValues()

    lock.releaseLock(); //ロックを解除

  } else {
    // do nothing
  }

  return {
    res : values
  }
}

function putNaiyouToDB(year, month, day, koma, kamoku, naiyou, motimono) {
  const sheetName = 'query',
    userId   = Session.getActiveUser().getUserLoginId();
  let nextTuuban, str, sheet, range,
    sheetNamePut = getNaiyouSheetName(month),
    lock = LockService.getScriptLock();

  if (lock.tryLock(5000)) { // 処理が重複した場合、5秒間は他の人が終わるのを待つ

    sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    range = sheet.getRange(1,1,1,1);

    // まずはqueryシートにqueryを書き、該当の通番の最大値をとる
    str = '=query(' + "'" + getNaiyouSheetName(month) + "'" + '!A:G,';
    str += '"select A,B,C,D,E,F,G where A = ' + String(day) + ' and ';
    str += 'B = ' + String(koma) + ' order by G desc",1)'; // 1は見出し行の数
    range.setValues([[str]]);

    // queryで絞り込まれたデータを取得する。
    range = sheet.getRange(2,7); // 通番の先頭
    nextTuuban = range.getValue();
    if(nextTuuban == '') {
      nextTuuban = 1;
    } else {
      nextTuuban++;
    }

    sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetNamePut);
    sheet.appendRow([day, koma, kamoku, naiyou, motimono, userId, nextTuuban]);

    lock.releaseLock(); //ロックを解除
  } else {
    // do nothing
  }

  return {
    res : nextTuuban
  }
}

function getNaiyouSheetName (month) {
  let monthStr = '0' + String(month);
  return ('month' + monthStr.slice(-2)); // 月の数字部分は0埋めで2桁
}