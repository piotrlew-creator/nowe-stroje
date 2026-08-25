/**
 * Wspólne funkcje pomocnicze: popupy (modale) oraz komunikacja z backendem.
 */

// --- Popup informacyjny (OK) ---

function pokazModal(tytul, tresc, opcje) {
  opcje = opcje || {};
  const overlay = document.getElementById("app-modal-overlay");
  const titleEl = document.getElementById("app-modal-title");
  const bodyEl = document.getElementById("app-modal-body");
  const iconEl = document.getElementById("app-modal-icon");

  titleEl.textContent = tytul;
  bodyEl.textContent = tresc;
  iconEl.className = "app-modal-icon " + (opcje.typ === "blad" ? "app-modal-icon--blad" : "app-modal-icon--ok");
  iconEl.textContent = opcje.typ === "blad" ? "!" : "✓";

  pokazOverlay_("app-modal-overlay");
}

function ukryjModal() {
  ukryjOverlay_("app-modal-overlay");
}

function backendSkonfigurowany() {
  return typeof APPS_SCRIPT_URL === "string" &&
    APPS_SCRIPT_URL.indexOf("http") === 0;
}

function pokazBrakKonfiguracji() {
  pokazModal(
    "Backend nie jest skonfigurowany",
    "Adres Google Apps Script nie został jeszcze uzupełniony w pliku docs/js/config.js. Zobacz INSTRUKCJA.md.",
    { typ: "blad" }
  );
}

// --- Generyczna obsługa overlayów (popup, potwierdzenie, edycja) ---

function pokazOverlay_(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add("app-modal-overlay--widoczny");
  overlay.setAttribute("aria-hidden", "false");
}

function ukryjOverlay_(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove("app-modal-overlay--widoczny");
  overlay.setAttribute("aria-hidden", "true");
}

function ukryjWszystkieOverlaye_() {
  document.querySelectorAll(".app-modal-overlay--widoczny").forEach(function (overlay) {
    overlay.classList.remove("app-modal-overlay--widoczny");
    overlay.setAttribute("aria-hidden", "true");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Motyw Material dla MkDocs stosuje CSS "contain" na kontenerze treści,
  // co może psuć "position: fixed" elementów zagnieżdżonych wewnątrz niego.
  // Przenosimy wszystkie overlaye bezpośrednio do <body>, aby poprawnie
  // pokrywały cały ekran niezależnie od miejsca w drzewie DOM.
  document.querySelectorAll(".app-modal-overlay").forEach(function (overlay) {
    if (overlay.parentElement !== document.body) {
      document.body.appendChild(overlay);
    }
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) ukryjOverlay_(overlay.id);
    });
  });

  const zamknij = document.getElementById("app-modal-close");
  if (zamknij) zamknij.addEventListener("click", ukryjModal);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") ukryjWszystkieOverlaye_();
  });
});

// --- Leniwe ładowanie ciężkich bibliotek (tylko wtedy, gdy naprawdę potrzebne) ---

const _zaladowaneSkrypty = {};

function zaladujSkrypt(url) {
  if (_zaladowaneSkrypty[url]) return _zaladowaneSkrypty[url];

  _zaladowaneSkrypty[url] = new Promise(function (resolve, reject) {
    const script = document.createElement("script");
    script.src = url;
    script.addEventListener("load", function () { resolve(); });
    script.addEventListener("error", function () {
      delete _zaladowaneSkrypty[url];
      reject(new Error("Nie udało się załadować: " + url));
    });
    document.head.appendChild(script);
  });

  return _zaladowaneSkrypty[url];
}
