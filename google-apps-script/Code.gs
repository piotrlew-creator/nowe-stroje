/**
 * Backend "Nowe Stroje" — Google Apps Script.
 *
 * Ten skrypt zamienia arkusz Google Sheets w prosty backend dla strony
 * zgłoszeniowej: przyjmuje nowe zgłoszenia (doPost), sprawdza duplikaty
 * numeru zawodnika oraz pary imię+nazwisko, i udostępnia zapisane dane
 * do wyświetlenia w tabeli (doGet).
 *
 * Instrukcja wdrożenia znajduje się w pliku INSTRUKCJA.md w głównym
 * folderze repozytorium.
 */

const SHEET_NAME = "Zawodnicy";
const HEADERS = ["Numer zawodnika", "Nazwisko", "Imię", "Rozmiar", "Uwagi"];

function doGet(e) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1).filter(function (r) {
    return r[0] !== "" || r[1] !== "" || r[2] !== "";
  });

  const data = rows.map(function (r) {
    return {
      numer: r[0],
      nazwisko: r[1],
      imie: r[2],
      rozmiar: r[3],
      uwagi: r[4] || ""
    };
  });

  return jsonOutput_({ status: "ok", data: data });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  var gotLock = false;
  try {
    gotLock = lock.tryLock(10000);
    if (!gotLock) {
      return jsonOutput_({ status: "error", message: "Serwer jest chwilowo zajęty, spróbuj ponownie." });
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonOutput_({ status: "error", message: "Nieprawidłowe dane." });
    }

    const nazwisko = String(payload.nazwisko || "").trim();
    const imie = String(payload.imie || "").trim();
    const numer = String(payload.numer || "").trim();
    const rozmiar = String(payload.rozmiar || "").trim();
    const uwagi = String(payload.uwagi || "").trim();

    if (!nazwisko || !imie || !numer || !rozmiar) {
      return jsonOutput_({ status: "error", message: "Uzupełnij wszystkie wymagane pola." });
    }

    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();
    const rows = values.slice(1);

    for (var i = 0; i < rows.length; i++) {
      var rNumer = String(rows[i][0]).trim();
      var rNazwisko = String(rows[i][1]).trim().toLowerCase();
      var rImie = String(rows[i][2]).trim().toLowerCase();

      if (rNumer !== "" && rNumer === numer) {
        return jsonOutput_({ status: "conflict", reason: "numer" });
      }
      if (rNazwisko === nazwisko.toLowerCase() && rImie === imie.toLowerCase()) {
        return jsonOutput_({ status: "conflict", reason: "nazwisko" });
      }
    }

    sheet.appendRow([numer, nazwisko, imie, rozmiar, uwagi]);
    return jsonOutput_({ status: "ok" });
  } finally {
    if (gotLock) lock.releaseLock();
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
