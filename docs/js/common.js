/**
 * Wspólne funkcje pomocnicze: modal (popup) oraz komunikacja z backendem.
 */

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

  overlay.classList.add("app-modal-overlay--widoczny");
  overlay.setAttribute("aria-hidden", "false");
}

function ukryjModal() {
  const overlay = document.getElementById("app-modal-overlay");
  overlay.classList.remove("app-modal-overlay--widoczny");
  overlay.setAttribute("aria-hidden", "true");
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

document.addEventListener("DOMContentLoaded", function () {
  const zamknij = document.getElementById("app-modal-close");
  const overlay = document.getElementById("app-modal-overlay");

  // Motyw Material dla MkDocs stosuje CSS "contain" na kontenerze treści,
  // co psuje "position: fixed" elementów zagnieżdżonych wewnątrz niego.
  // Przenosimy overlay bezpośrednio do <body>, aby poprawnie pokrywał cały ekran.
  if (overlay && overlay.parentElement !== document.body) {
    document.body.appendChild(overlay);
  }

  if (zamknij) zamknij.addEventListener("click", ukryjModal);
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) ukryjModal();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") ukryjModal();
  });
});
