function doGet () {
  return HtmlService.createHtmlOutputFromFile('index');
}

function getKadaiFromDB(dayStr) {
  const sheetName = 'kadaiQuery';
  let str, sheet, range, values,
    lock = LockService.getScriptLock();

  if (lock.tryLock(5000)) { // 処理が重複した場合、5秒間は他の人が終わるのを待つ

    sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    range = sheet.getRange(1,1,1,1);

    // まずはqueryシートにqueryを書き、該当データを絞り込む
    str = '=query(' + "'" + 'kadai' + "'" + '!A:F,';
    str += '"select A,B,C,D,E where A <= date'+ " '" + dayStr+ "' ";
    str += 'and B >= date' + " '" + dayStr+ "' ";
    str += 'and F is null order by B asc",1)';

    range.setValues([[str]]);

    // queryで絞り込まれたデータを取得し、返す。
    range = sheet.getRange(1,1,sheet.getLastRow(),5); // AからEで7列
    values = range.getValues()

    lock.releaseLock(); //ロックを解除

    // 驚異！！日付型など、いくつかの種類ものは渡せない！
    // 仕方がないので文字列へ変換して返す
    for (let i in values) {
      if (i != 0) { //最初はタイトルで日付型じゃないから飛ばさないと怒られる
        values[i][0] = Utilities.formatDate(values[i][0], 'JST', 'yyyy-MM-dd')
        values[i][1] = Utilities.formatDate(values[i][1], 'JST', 'yyyy-MM-dd')
      }
    }

  } else {
    // do nothing
  }

  return {
     result : values
  }
}

function test () {

  putKadaiToDB('2023-01-11', '2023-2-23', '証明マラソン2');
}

function putKadaiToDB(karaStr, madeStr, naiyou) {
  const sheetName = 'kadai',
    userId   = Session.getActiveUser().getUserLoginId();
  let sheet,
    lock = LockService.getScriptLock();

  if (lock.tryLock(5000)) { // 処理が重複した場合、5秒間は他の人が終わるのを待つ

    sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    sheet.appendRow([karaStr, madeStr, naiyou, userId, '=row()']);

    lock.releaseLock(); //ロックを解除
  } else {
    // do nothing
  }

  return {
    result : 'OK'
  }
}

/*
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
*/