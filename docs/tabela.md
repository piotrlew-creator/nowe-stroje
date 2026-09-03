# Tabela zgłoszeń

<p id="tabela-stan" class="tabela-stan">Ładowanie danych…</p>

<div class="tabela-akcje">
  <button id="tabela-odswiez" type="button" class="stroj-btn stroj-btn--secondary">↻ Odśwież</button>
  <button id="export-xlsx" type="button" class="stroj-btn stroj-btn--secondary">⬇ Excel (.xlsx)</button>
  <button id="export-pdf" type="button" class="stroj-btn stroj-btn--secondary">⬇ PDF</button>
</div>

<div class="tabela-wrapper">
  <table id="tabela-zawodnicy">
    <thead>
      <tr>
        <th>Numer zawodnika</th>
        <th>Nazwisko</th>
        <th>Imię</th>
        <th>Rozmiar</th>
        <th>Uwagi</th>
        <th>Akcje</th>
      </tr>
    </thead>
    <tbody id="tabela-body"></tbody>
  </table>
</div>

<!-- Popup informacyjny (potwierdzenie / błąd) -->
<div id="app-modal-overlay" class="app-modal-overlay" aria-hidden="true">
  <div class="app-modal" role="dialog" aria-modal="true">
    <div id="app-modal-icon" class="app-modal-icon app-modal-icon--ok">✓</div>
    <h2 id="app-modal-title">Tytuł</h2>
    <p id="app-modal-body">Treść.</p>
    <button id="app-modal-close" type="button" class="stroj-btn">OK</button>
  </div>
</div>

<!-- Popup potwierdzenia usunięcia -->
<div id="confirm-modal-overlay" class="app-modal-overlay" aria-hidden="true">
  <div class="app-modal" role="dialog" aria-modal="true">
    <div class="app-modal-icon app-modal-icon--blad">🗑</div>
    <h2 id="confirm-modal-title">Usunąć zgłoszenie?</h2>
    <p id="confirm-modal-body">Tej operacji nie można cofnąć.</p>
    <div class="app-modal-actions">
      <button id="confirm-modal-cancel" type="button" class="stroj-btn stroj-btn--secondary">Anuluj</button>
      <button id="confirm-modal-ok" type="button" class="stroj-btn stroj-btn--danger">Usuń</button>
    </div>
  </div>
</div>

<!-- Modal edycji wpisu -->
<div id="edit-modal-overlay" class="app-modal-overlay" aria-hidden="true">
  <div class="app-modal app-modal--form" role="dialog" aria-modal="true">
    <h2>Edytuj zgłoszenie</h2>

    <form id="edit-form" class="stroj-form" novalidate>
      <div class="field">
        <label for="edit-nazwisko">Nazwisko <span class="wymagane">*</span></label>
        <input type="text" id="edit-nazwisko" required>
      </div>

      <div class="field">
        <label for="edit-imie">Imię <span class="wymagane">*</span></label>
        <input type="text" id="edit-imie" required>
      </div>

      <div class="field">
        <label for="edit-rozmiar">Rozmiar stroju <span class="wymagane">*</span></label>
        <select id="edit-rozmiar" required>
          <option value="XS">XS</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="2XL">2XL</option>
          <option value="3XL">3XL</option>
          <option value="4XL">4XL</option>
        </select>
      </div>

      <div class="field">
        <label for="edit-numer">Numer zawodnika <span class="wymagane">*</span></label>
        <input type="number" id="edit-numer" inputmode="numeric" min="0" step="1" required>
      </div>

      <div class="field">
        <label for="edit-uwagi">Uwagi <span style="opacity:.6; font-weight:400;">(opcjonalne)</span></label>
        <textarea id="edit-uwagi"></textarea>
      </div>

      <p id="edit-form-blad" class="edit-form-blad" hidden></p>

      <div class="app-modal-actions">
        <button type="button" id="edit-modal-cancel" class="stroj-btn stroj-btn--secondary">Anuluj</button>
        <button type="submit" id="edit-modal-save" class="stroj-btn">Zapisz zmiany</button>
      </div>
    </form>
  </div>
</div>
