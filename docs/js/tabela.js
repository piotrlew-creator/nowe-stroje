/**
 * Obsługa strony Tabela: pobranie danych, render, eksport do XLSX/PDF.
 */

document.addEventListener("DOMContentLoaded", function () {
  const tbody = document.getElementById("tabela-body");
  if (!tbody) return; // nie jesteśmy na stronie tabeli

  const stanEl = document.getElementById("tabela-stan");
  const odswiezBtn = document.getElementById("tabela-odswiez");
  const exportXlsxBtn = document.getElementById("export-xlsx");
  const exportPdfBtn = document.getElementById("export-pdf");

  let aktualneDane = [];

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

      tbody.appendChild(tr);
    });
  }

  function eksportujXlsx() {
    if (aktualneDane.length === 0) return;

    const naglowki = ["Numer zawodnika", "Nazwisko", "Imię", "Rozmiar", "Uwagi"];
    const wiersze = aktualneDane.map(function (w) {
      return [w.numer, w.nazwisko, w.imie, w.rozmiar, w.uwagi || ""];
    });

    const arkusz = XLSX.utils.aoa_to_sheet([naglowki].concat(wiersze));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, arkusz, "Stroje");
    XLSX.writeFile(workbook, "nowe-stroje.xlsx");
  }

  function eksportujPdf() {
    if (aktualneDane.length === 0) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Nowe stroje — zgłoszenia", 14, 15);

    doc.autoTable({
      startY: 22,
      head: [["Numer zawodnika", "Nazwisko", "Imię", "Rozmiar", "Uwagi"]],
      body: aktualneDane.map(function (w) {
        return [w.numer, w.nazwisko, w.imie, w.rozmiar, w.uwagi || ""];
      }),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [63, 81, 181] }
    });

    doc.save("nowe-stroje.pdf");
  }

  odswiezBtn.addEventListener("click", pobierzDane);
  exportXlsxBtn.addEventListener("click", eksportujXlsx);
  exportPdfBtn.addEventListener("click", eksportujPdf);

  pobierzDane();
});
