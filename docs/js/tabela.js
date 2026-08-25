/**
 * Obsługa strony Tabela: pobranie danych, render, edycja, usuwanie
 * oraz eksport do XLSX/PDF.
 */

// Adres tego pliku — używany do wyliczenia poprawnej ścieżki do bibliotek
// w docs/js/vendor/ oraz czcionki w docs/fonts/, niezależnie od tego, czy
// MkDocs generuje adresy typu /tabela/ czy /tabela.html.
const _TABELA_JS_URL = document.currentScript ? document.currentScript.src : "";

function _vendorUrl(nazwaPliku) {
  return new URL("vendor/" + nazwaPliku, _TABELA_JS_URL).href;
}

function _fontUrl() {
  return new URL("../fonts/DejaVuSans.b64.txt", _TABELA_JS_URL).href;
}

let _fontBase64Cache = null;

function _pobierzFontBase64() {
  if (_fontBase64Cache) return Promise.resolve(_fontBase64Cache);
  return fetch(_fontUrl())
    .then(function (resp) { return resp.text(); })
    .then(function (txt) {
      _fontBase64Cache = txt.trim();
      return _fontBase64Cache;
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const tbody = document.getElementById("tabela-body");
  if (!tbody) return; // nie jesteśmy na stronie tabeli

  const stanEl = document.getElementById("tabela-stan");
  const odswiezBtn = document.getElementById("tabela-odswiez");
  const exportXlsxBtn = document.getElementById("export-xlsx");
  const exportPdfBtn = document.getElementById("export-pdf");

  const confirmOkBtn = document.getElementById("confirm-modal-ok");
  const confirmCancelBtn = document.getElementById("confirm-modal-cancel");
  const confirmBodyEl = document.getElementById("confirm-modal-body");

  const editForm = document.getElementById("edit-form");
  const editCancelBtn = document.getElementById("edit-modal-cancel");
  const editBladEl = document.getElementById("edit-form-blad");
  const editSaveBtn = document.getElementById("edit-modal-save");

  let aktualneDane = [];
  let wierszDoUsuniecia = null;
  let wierszDoEdycji = null;

  // --- Pobieranie i renderowanie ---

  function pobierzDane() {
    if (!backendSkonfigurowany()) {
      pokazBrakKonfiguracji();
      stanEl.textContent = "Backend nie jest skonfigurowany — zobacz INSTRUKCJA.md.";
      return;
    }

    stanEl.textContent = "Ładowanie danych…";
    tbody.innerHTML = "";

    fetch(APPS_SCRIPT_URL, { method: "GET" })
      .then(function (resp) { return resp.json(); })
      .then(function (wynik) {
        if (wynik.status !== "ok") {
          stanEl.textContent = "Nie udało się pobrać danych.";
          return;
        }
        aktualneDane = wynik.data || [];
        renderujTabele(aktualneDane);
      })
      .catch(function () {
        stanEl.textContent = "Błąd połączenia z serwerem.";
      });
  }

  function renderujTabele(dane) {
    tbody.innerHTML = "";

    if (dane.length === 0) {
      stanEl.textContent = "Brak zapisanych zgłoszeń.";
      return;
    }

    stanEl.textContent = "Liczba zgłoszeń: " + dane.length;

    dane.forEach(function (wiersz) {
      const tr = document.createElement("tr");

      [wiersz.numer, wiersz.nazwisko, wiersz.imie, wiersz.rozmiar, wiersz.uwagi].forEach(function (wartosc) {
        const td = document.createElement("td");
        td.textContent = wartosc || "";
        tr.appendChild(td);
      });

      const tdAkcje = document.createElement("td");
      tdAkcje.className = "tabela-akcje-komorka";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "icon-btn icon-btn--edytuj";
      editBtn.title = "Edytuj";
      editBtn.setAttribute("aria-label", "Edytuj zgłoszenie: " + wiersz.imie + " " + wiersz.nazwisko);
      editBtn.textContent = "✎";
      editBtn.addEventListener("click", function () { otworzEdycje(wiersz); });

      const usunBtn = document.createElement("button");
      usunBtn.type = "button";
      usunBtn.className = "icon-btn icon-btn--usun";
      usunBtn.title = "Usuń";
      usunBtn.setAttribute("aria-label", "Usuń zgłoszenie: " + wiersz.imie + " " + wiersz.nazwisko);
      usunBtn.textContent = "🗑";
      usunBtn.addEventListener("click", function () { otworzPotwierdzenieUsuniecia(wiersz); });

      tdAkcje.appendChild(editBtn);
      tdAkcje.appendChild(usunBtn);
      tr.appendChild(tdAkcje);

      tbody.appendChild(tr);
    });
  }

  // --- Usuwanie ---

  function otworzPotwierdzenieUsuniecia(wiersz) {
    wierszDoUsuniecia = wiersz;
    confirmBodyEl.textContent =
      "Czy na pewno chcesz usunąć zgłoszenie: " + wiersz.imie + " " + wiersz.nazwisko +
      " (nr " + wiersz.numer + ")? Tej operacji nie można cofnąć.";
    pokazOverlay_("confirm-modal-overlay");
  }

  confirmCancelBtn.addEventListener("click", function () {
    wierszDoUsuniecia = null;
    ukryjOverlay_("confirm-modal-overlay");
  });

  confirmOkBtn.addEventListener("click", function () {
    if (!wierszDoUsuniecia) return;
    if (!backendSkonfigurowany()) { pokazBrakKonfiguracji(); return; }

    const wiersz = wierszDoUsuniecia;
    confirmOkBtn.disabled = true;

    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ akcja: "usun", wiersz: wiersz.wiersz })
    })
      .then(function (resp) { return resp.json(); })
      .then(function (wynik) {
        confirmOkBtn.disabled = false;
        ukryjOverlay_("confirm-modal-overlay");
        wierszDoUsuniecia = null;

        if (wynik.status === "ok") {
          pobierzDane();
          pokazModal("Usunięto", "Zgłoszenie zostało usunięte.");
        } else {
          pokazModal("Błąd usuwania", wynik.message || "Nie udało się usunąć zgłoszenia.", { typ: "blad" });
        }
      })
      .catch(function () {
        confirmOkBtn.disabled = false;
        ukryjOverlay_("confirm-modal-overlay");
        pokazModal("Błąd połączenia", "Nie udało się połączyć z serwerem.", { typ: "blad" });
      });
  });

  // --- Edycja ---

  function otworzEdycje(wiersz) {
    wierszDoEdycji = wiersz;
    document.getElementById("edit-nazwisko").value = wiersz.nazwisko || "";
    document.getElementById("edit-imie").value = wiersz.imie || "";
    document.getElementById("edit-rozmiar").value = wiersz.rozmiar || "";
    document.getElementById("edit-numer").value = wiersz.numer || "";
    document.getElementById("edit-uwagi").value = wiersz.uwagi || "";
    ukryjBladEdycji();
    pokazOverlay_("edit-modal-overlay");
  }

  function ukryjBladEdycji() {
    editBladEl.hidden = true;
    editBladEl.textContent = "";
  }

  function pokazBladEdycji(tekst) {
    editBladEl.hidden = false;
    editBladEl.textContent = tekst;
  }

  editCancelBtn.addEventListener("click", function () {
    wierszDoEdycji = null;
    ukryjOverlay_("edit-modal-overlay");
  });

  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!wierszDoEdycji) return;
    if (!backendSkonfigurowany()) { pokazBrakKonfiguracji(); return; }
    if (!editForm.reportValidity()) return;

    ukryjBladEdycji();

    const dane = {
      akcja: "edytuj",
      wiersz: wierszDoEdycji.wiersz,
      nazwisko: document.getElementById("edit-nazwisko").value.trim(),
      imie: document.getElementById("edit-imie").value.trim(),
      rozmiar: document.getElementById("edit-rozmiar").value,
      numer: document.getElementById("edit-numer").value.trim(),
      uwagi: document.getElementById("edit-uwagi").value.trim()
    };

    editSaveBtn.disabled = true;
    editSaveBtn.textContent = "Zapisywanie…";

    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dane)
    })
      .then(function (resp) { return resp.json(); })
      .then(function (wynik) {
        editSaveBtn.disabled = false;
        editSaveBtn.textContent = "Zapisz zmiany";

        if (wynik.status === "ok") {
          wierszDoEdycji = null;
          ukryjOverlay_("edit-modal-overlay");
          pobierzDane();
          pokazModal("Zapisano!", "Zmiany zostały zapisane.");
        } else if (wynik.status === "conflict") {
          if (wynik.reason === "numer") {
            pokazBladEdycji("Ten numer zawodnika jest już zajęty przez inne zgłoszenie.");
          } else {
            pokazBladEdycji("Zgłoszenie dla tego imienia i nazwiska już istnieje.");
          }
        } else {
          pokazBladEdycji(wynik.message || "Nie udało się zapisać zmian.");
        }
      })
      .catch(function () {
        editSaveBtn.disabled = false;
        editSaveBtn.textContent = "Zapisz zmiany";
        pokazBladEdycji("Błąd połączenia z serwerem. Spróbuj ponownie.");
      });
  });

  // --- Eksport XLSX ---

  function eksportujXlsx() {
    if (aktualneDane.length === 0) return;

    const originalText = exportXlsxBtn.textContent;
    exportXlsxBtn.disabled = true;
    exportXlsxBtn.textContent = "Przygotowywanie…";

    zaladujSkrypt(_vendorUrl("xlsx.full.min.js"))
      .then(function () {
        const naglowki = ["Numer zawodnika", "Nazwisko", "Imię", "Rozmiar", "Uwagi"];
        const wiersze = aktualneDane.map(function (w) {
          return [w.numer, w.nazwisko, w.imie, w.rozmiar, w.uwagi || ""];
        });
        const wszystkieWiersze = [naglowki].concat(wiersze);

        const arkusz = XLSX.utils.aoa_to_sheet(wszystkieWiersze);

        // Automatyczne dopasowanie szerokości kolumn do najdłuższego wpisu.
        arkusz["!cols"] = naglowki.map(function (_, kolIdx) {
          let maxDlugosc = 0;
          wszystkieWiersze.forEach(function (wiersz) {
            const wartosc = wiersz[kolIdx] == null ? "" : String(wiersz[kolIdx]);
            maxDlugosc = Math.max(maxDlugosc, wartosc.length);
          });
          return { wch: Math.min(Math.max(maxDlugosc + 2, 10), 60) };
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, arkusz, "Stroje");
        XLSX.writeFile(workbook, "nowe-stroje.xlsx");
      })
      .catch(function () {
        pokazModal(
          "Błąd eksportu",
          "Nie udało się przygotować pliku Excel. Sprawdź połączenie z internetem i spróbuj ponownie.",
          { typ: "blad" }
        );
      })
      .finally(function () {
        exportXlsxBtn.disabled = false;
        exportXlsxBtn.textContent = originalText;
      });
  }

  // --- Eksport PDF (z osadzoną czcionką DejaVu Sans dla polskich znaków) ---

  function eksportujPdf() {
    if (aktualneDane.length === 0) return;

    const originalText = exportPdfBtn.textContent;
    exportPdfBtn.disabled = true;
    exportPdfBtn.textContent = "Przygotowywanie…";

    Promise.all([
      zaladujSkrypt(_vendorUrl("jspdf.umd.min.js")).then(function () {
        return zaladujSkrypt(_vendorUrl("jspdf.plugin.autotable.min.js"));
      }),
      _pobierzFontBase64()
    ])
      .then(function (wyniki) {
        const fontBase64 = wyniki[1];
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "landscape" });

        doc.addFileToVFS("DejaVuSans.ttf", fontBase64);
        doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
        doc.setFont("DejaVuSans");

        doc.setFontSize(14);
        doc.text("Nowe stroje — zgłoszenia", 14, 15);

        doc.autoTable({
          startY: 22,
          head: [["Numer zawodnika", "Nazwisko", "Imię", "Rozmiar", "Uwagi"]],
          body: aktualneDane.map(function (w) {
            return [w.numer, w.nazwisko, w.imie, w.rozmiar, w.uwagi || ""];
          }),
          styles: { font: "DejaVuSans", fontStyle: "normal", fontSize: 10, cellPadding: 3, overflow: "linebreak" },
          headStyles: { font: "DejaVuSans", fontStyle: "normal", fillColor: [63, 81, 181], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 28 },
            1: { cellWidth: 45 },
            2: { cellWidth: 40 },
            3: { cellWidth: 22 },
            4: { cellWidth: "auto" }
          }
        });

        doc.save("nowe-stroje.pdf");
      })
      .catch(function () {
        pokazModal(
          "Błąd eksportu",
          "Nie udało się przygotować pliku PDF. Sprawdź połączenie z internetem i spróbuj ponownie.",
          { typ: "blad" }
        );
      })
      .finally(function () {
        exportPdfBtn.disabled = false;
        exportPdfBtn.textContent = originalText;
      });
  }

  odswiezBtn.addEventListener("click", pobierzDane);
  exportXlsxBtn.addEventListener("click", eksportujXlsx);
  exportPdfBtn.addEventListener("click", eksportujPdf);

  pobierzDane();
});
