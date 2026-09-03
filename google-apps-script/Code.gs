/**
 * Backend "Nowe Stroje" — Google Apps Script.
 *
 * Ten skrypt zamienia arkusz Google Sheets w prosty backend dla strony
 * zgłoszeniowej: przyjmuje nowe zgłoszenia oraz ich edycję/usunięcie
 * (doPost), sprawdza duplikaty numeru zawodnika oraz pary imię+nazwisko,
 * i udostępnia zapisane dane do wyświetlenia w tabeli (doGet).
 *
 * Instrukcja wdrożenia znajduje się w pliku INSTRUKCJA.md w głównym
 * folderze repozytorium. Po KAŻDEJ zmianie tego pliku trzeba utworzyć
 * nowe wdrożenie (Wdróż → Zarządzaj wdrożeniami → ✏️ → Nowa wersja),
 * inaczej zmiany nie zostaną uwzględnione pod dotychczasowym adresem URL.
 */

const SHEET_NAME = "Zawodnicy";
const HEADERS = ["Numer zawodnika", "Nazwisko", "Imię", "Rozmiar koszulki", "Rozmiar spodenek", "Uwagi"];

function doGet(e) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const data = [];

  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (r[0] === "" && r[1] === "" && r[2] === "") continue;
    data.push({
      wiersz: i + 1, // numer wiersza w arkuszu (nagłówek = 1) — identyfikator do edycji/usuwania
      numer: r[0],
      nazwisko: r[1],
      imie: r[2],
      rozmiarKoszulki: r[3],
      rozmiarSpodenek: r[4],
      uwagi: r[5] || ""
    });
  }

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

    const akcja = payload.akcja || "dodaj";

    if (akcja === "usun") return usunWiersz_(payload);
    if (akcja === "edytuj") return edytujWiersz_(payload);
    return dodajWiersz_(payload);
  } finally {
    if (gotLock) lock.releaseLock();
  }
}

function dodajWiersz_(payload) {
  const dane = wyciagnijDane_(payload);
  if (!dane) return jsonOutput_({ status: "error", message: "Uzupełnij wszystkie wymagane pola." });

  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues().slice(1);

  const konflikt = znajdzKonflikt_(rows, dane, -1);
  if (konflikt) return jsonOutput_({ status: "conflict", reason: konflikt });

  sheet.appendRow([dane.numer, dane.nazwisko, dane.imie, dane.rozmiarKoszulki, dane.rozmiarSpodenek, dane.uwagi]);
  return jsonOutput_({ status: "ok" });
}

function edytujWiersz_(payload) {
  const wiersz = parseInt(payload.wiersz, 10);
  if (!wiersz || wiersz < 2) {
    return jsonOutput_({ status: "error", message: "Brak identyfikatora edytowanego wiersza." });
  }

  const dane = wyciagnijDane_(payload);
  if (!dane) return jsonOutput_({ status: "error", message: "Uzupełnij wszystkie wymagane pola." });

  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  if (wiersz > values.length) {
    return jsonOutput_({ status: "error", message: "Ten wpis już nie istnieje (mógł zostać usunięty)." });
  }

  const rows = values.slice(1);
  const konflikt = znajdzKonflikt_(rows, dane, wiersz);
  if (konflikt) return jsonOutput_({ status: "conflict", reason: konflikt });

  sheet.getRange(wiersz, 1, 1, 6).setValues([[dane.numer, dane.nazwisko, dane.imie, dane.rozmiarKoszulki, dane.rozmiarSpodenek, dane.uwagi]]);
  return jsonOutput_({ status: "ok" });
}

function usunWiersz_(payload) {
  const wiersz = parseInt(payload.wiersz, 10);
  if (!wiersz || wiersz < 2) {
    return jsonOutput_({ status: "error", message: "Brak identyfikatora usuwanego wiersza." });
  }

  const sheet = getSheet_();
  if (wiersz > sheet.getLastRow()) {
    return jsonOutput_({ status: "error", message: "Ten wpis już nie istnieje." });
  }

  sheet.deleteRow(wiersz);
  return jsonOutput_({ status: "ok" });
}

function wyciagnijDane_(payload) {
  const nazwisko = String(payload.nazwisko || "").trim();
  const imie = String(payload.imie || "").trim();
  const numer = String(payload.numer || "").trim();
  const rozmiarKoszulki = String(payload.rozmiarKoszulki || "").trim();
  const rozmiarSpodenek = String(payload.rozmiarSpodenek || "").trim();
  const uwagi = String(payload.uwagi || "").trim();

  if (!nazwisko || !imie || !numer || !rozmiarKoszulki || !rozmiarSpodenek) return null;
  return {
    nazwisko: nazwisko,
    imie: imie,
    numer: numer,
    rozmiarKoszulki: rozmiarKoszulki,
    rozmiarSpodenek: rozmiarSpodenek,
    uwagi: uwagi
  };
}

/**
 * Szuka konfliktu (zajęty numer zawodnika lub istniejąca para imię+nazwisko)
 * wśród `rows` (dane bez nagłówka). `pomijanyWiersz` to numer wiersza
 * w arkuszu (1-indeksowany, nagłówek = 1), który należy pominąć przy
 * sprawdzaniu — używane przy edycji, żeby wpis nie "kolidował sam ze sobą".
 * Użyj -1, gdy nic nie trzeba pomijać (dodawanie nowego wpisu).
 */
function znajdzKonflikt_(rows, dane, pomijanyWiersz) {
  const numer = dane.numer;
  const nazwiskoLower = dane.nazwisko.toLowerCase();
  const imieLower = dane.imie.toLowerCase();

  for (var i = 0; i < rows.length; i++) {
    const numerWierszaArkusza = i + 2;
    if (numerWierszaArkusza === pomijanyWiersz) continue;

    var rNumer = String(rows[i][0]).trim();
    var rNazwisko = String(rows[i][1]).trim().toLowerCase();
    var rImie = String(rows[i][2]).trim().toLowerCase();

    if (rNumer !== "" && rNumer === numer) return "numer";
    if (rNazwisko === nazwiskoLower && rImie === imieLower) return "nazwisko";
  }
  return null;
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
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
