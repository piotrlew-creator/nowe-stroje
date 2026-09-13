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

/**
 * Numer zawodnika: "0", "00" oraz liczby od 1 do 99 bez zera wiodącego.
 * "0" i "00" to dwa RÓŻNE numery, dlatego numer jest wszędzie traktowany
 * jako tekst — jako liczba "00" stałoby się zerem i numery byłyby
 * nierozróżnialne. Wykluczone: "07", "003" i wszystkie trzycyfrowe.
 */
const NUMER_WZORZEC = /^(0|00|[1-9][0-9]?)$/;
const NUMER_KOMUNIKAT =
  "Numer zawodnika może być: 0, 00 albo liczba od 1 do 99. " +
  "Numery z zerem z przodu (np. 07) oraz trzycyfrowe nie są dozwolone.";

function doGet(e) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const data = [];

  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (r[0] === "" && r[1] === "" && r[2] === "") continue;
    data.push({
      wiersz: i + 1, // numer wiersza w arkuszu (nagłówek = 1) — identyfikator do edycji/usuwania
      // Numer zawsze jako tekst — starsze wpisy mogą być zapisane w arkuszu
      // jako liczby, a "0" i "00" muszą pozostać rozróżnialne.
      numer: String(r[0]).trim(),
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
  if (!NUMER_WZORZEC.test(dane.numer)) {
    return jsonOutput_({ status: "error", message: NUMER_KOMUNIKAT });
  }

  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues().slice(1);

  const konflikt = znajdzKonflikt_(rows, dane, -1);
  if (konflikt) return jsonOutput_({ status: "conflict", reason: konflikt });

  zapiszWiersz_(sheet, sheet.getLastRow() + 1, dane);
  return jsonOutput_({ status: "ok" });
}

function edytujWiersz_(payload) {
  const wiersz = parseInt(payload.wiersz, 10);
  if (!wiersz || wiersz < 2) {
    return jsonOutput_({ status: "error", message: "Brak identyfikatora edytowanego wiersza." });
  }

  const dane = wyciagnijDane_(payload);
  if (!dane) return jsonOutput_({ status: "error", message: "Uzupełnij wszystkie wymagane pola." });
  if (!NUMER_WZORZEC.test(dane.numer)) {
    return jsonOutput_({ status: "error", message: NUMER_KOMUNIKAT });
  }

  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  if (wiersz > values.length) {
    return jsonOutput_({ status: "error", message: "Ten wpis już nie istnieje (mógł zostać usunięty)." });
  }

  const rows = values.slice(1);
  const konflikt = znajdzKonflikt_(rows, dane, wiersz);
  if (konflikt) return jsonOutput_({ status: "conflict", reason: konflikt });

  zapiszWiersz_(sheet, wiersz, dane);
  return jsonOutput_({ status: "ok" });
}

/**
 * Zapisuje wiersz danych, wymuszając format TEKSTOWY w kolumnie z numerem.
 * Bez ustawienia formatu "@" Google Sheets sam zamieniłby "00" na liczbę 0,
 * przez co numery 0 i 00 przestałyby być rozróżnialne.
 */
function zapiszWiersz_(sheet, wiersz, dane) {
  sheet.getRange(wiersz, 1).setNumberFormat("@");
  sheet.getRange(wiersz, 1, 1, 6).setValues([[
    dane.numer, dane.nazwisko, dane.imie,
    dane.rozmiarKoszulki, dane.rozmiarSpodenek, dane.uwagi
  ]]);
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
    // Kolumna z numerem zawodnika jako tekst, żeby "00" nie stało się zerem.
    sheet.getRange("A2:A").setNumberFormat("@");
  }
  return sheet;
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
