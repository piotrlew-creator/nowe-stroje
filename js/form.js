/**
 * Obsługa formularza zgłoszeniowego (strona główna).
 */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("zgloszenie-form");
  if (!form) return; // nie jesteśmy na stronie formularza

  const submitBtn = document.getElementById("zgloszenie-submit");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    wyslijZgloszenie();
  });

  function wyslijZgloszenie() {
    if (!backendSkonfigurowany()) {
      pokazBrakKonfiguracji();
      return;
    }

    if (!form.reportValidity()) return;

    const dane = {
      nazwisko: document.getElementById("nazwisko").value.trim(),
      imie: document.getElementById("imie").value.trim(),
      rozmiarKoszulki: document.getElementById("rozmiar-koszulki").value,
      rozmiarSpodenek: document.getElementById("rozmiar-spodenek").value,
      numer: document.getElementById("numer").value.trim(),
      uwagi: document.getElementById("uwagi").value.trim()
    };

    ustawStanWysylania(true);

    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dane)
    })
      .then(function (resp) { return resp.json(); })
      .then(function (wynik) {
        ustawStanWysylania(false);

        if (wynik.status === "ok") {
          form.reset();
          pokazModal("Zapisano!", "Dane zostały pomyślnie zapisane. Dziękujemy!");
        } else if (wynik.status === "conflict") {
          if (wynik.reason === "numer") {
            pokazModal(
              "Numer już zajęty",
              "Zawodnik z tym numerem został już wcześniej zapisany. Sprawdź numer i spróbuj ponownie.",
              { typ: "blad" }
            );
          } else {
            pokazModal(
              "Zawodnik już istnieje",
              "Zgłoszenie dla tego imienia i nazwiska zostało już wcześniej zapisane.",
              { typ: "blad" }
            );
          }
        } else {
          pokazModal(
            "Błąd zapisu",
            wynik.message || "Nie udało się zapisać danych. Spróbuj ponownie.",
            { typ: "blad" }
          );
        }
      })
      .catch(function () {
        ustawStanWysylania(false);
        pokazModal(
          "Błąd połączenia",
          "Nie udało się połączyć z serwerem. Sprawdź połączenie z internetem i spróbuj ponownie.",
          { typ: "blad" }
        );
      });
  }

  function ustawStanWysylania(wysyla) {
    submitBtn.disabled = wysyla;
    submitBtn.textContent = wysyla ? "Zapisywanie…" : "Zatwierdź";
  }

  // --- Lightbox z rozmiarówkami (obsługuje dowolną liczbę miniatur) ---
  const miniatury = document.querySelectorAll(".rozmiarowka-miniatura[data-lightbox]");
  const lightbox = document.getElementById("rozmiarowka-lightbox");
  const lightboxImg = document.getElementById("rozmiarowka-lightbox-img");
  const lightboxClose = document.getElementById("rozmiarowka-close");

  if (miniatury.length && lightbox) {
    // Patrz komentarz w common.js: przenosimy lightbox do <body>, żeby
    // "position: fixed" poprawnie pokrywał cały ekran w motywie Material.
    if (lightbox.parentElement !== document.body) {
      document.body.appendChild(lightbox);
    }

    miniatury.forEach(function (miniatura) {
      miniatura.addEventListener("click", function () {
        lightboxImg.src = miniatura.src;
        lightboxImg.alt = miniatura.alt;
        lightbox.classList.add("lightbox--widoczny");
        lightbox.setAttribute("aria-hidden", "false");
      });
    });

    lightboxClose.addEventListener("click", zamknijLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) zamknijLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") zamknijLightbox();
    });
  }

  function zamknijLightbox() {
    lightbox.classList.remove("lightbox--widoczny");
    lightbox.setAttribute("aria-hidden", "true");
  }
});
