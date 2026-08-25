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
      </tr>
    </thead>
    <tbody id="tabela-body"></tbody>
  </table>
</div>

<div id="app-modal-overlay" class="app-modal-overlay" aria-hidden="true">
  <div class="app-modal" role="dialog" aria-modal="true">
    <div id="app-modal-icon" class="app-modal-icon app-modal-icon--ok">✓</div>
    <h2 id="app-modal-title">Tytuł</h2>
    <p id="app-modal-body">Treść.</p>
    <button id="app-modal-close" type="button" class="stroj-btn">OK</button>
  </div>
</div>
