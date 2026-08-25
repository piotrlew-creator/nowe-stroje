# Zgłoszenie danych do stroju

Wypełnij poniższy formularz, aby zgłosić dane do nowego stroju sportowego.

<form id="zgloszenie-form" class="stroj-form" novalidate>

  <div class="field">
    <label for="nazwisko">Nazwisko <span class="wymagane">*</span></label>
    <input type="text" id="nazwisko" name="nazwisko" autocomplete="family-name" required>
  </div>

  <div class="field">
    <label for="imie">Imię <span class="wymagane">*</span></label>
    <input type="text" id="imie" name="imie" autocomplete="given-name" required>
  </div>

  <div class="field">
    <label for="rozmiar">Rozmiar stroju <span class="wymagane">*</span></label>
    <select id="rozmiar" name="rozmiar" required>
      <option value="" disabled selected>Wybierz rozmiar</option>
      <option value="XS">XS</option>
      <option value="S">S</option>
      <option value="M">M</option>
      <option value="L">L</option>
      <option value="XL">XL</option>
      <option value="XXL">XXL</option>
    </select>
  </div>

  <div class="field">
    <label for="numer">Numer zawodnika <span class="wymagane">*</span></label>
    <input type="number" id="numer" name="numer" inputmode="numeric" min="0" step="1" required>
  </div>

  <div class="rozmiarowka-blok">
    <img id="rozmiarowka-miniatura" class="rozmiarowka-miniatura" src="img/rozmiarowka.jpg" alt="Tabela rozmiarów strojów sportowych">
    <span class="rozmiarowka-podpis">Stuknij, aby powiększyć tabelę rozmiarów</span>
  </div>

  <div class="field">
    <label for="uwagi">Uwagi <span style="opacity:.6; font-weight:400;">(opcjonalne)</span></label>
    <textarea id="uwagi" name="uwagi" placeholder="Np. dodatkowe informacje dotyczące zamówienia"></textarea>
  </div>

  <button type="submit" id="zgloszenie-submit" class="stroj-btn">Zatwierdź</button>

</form>

<div id="rozmiarowka-lightbox" class="lightbox" aria-hidden="true">
  <button id="rozmiarowka-close" class="lightbox-close" type="button" aria-label="Zamknij">✕</button>
  <img src="img/rozmiarowka.jpg" alt="Tabela rozmiarów strojów sportowych — powiększenie">
</div>

<div id="app-modal-overlay" class="app-modal-overlay" aria-hidden="true">
  <div class="app-modal" role="dialog" aria-modal="true">
    <div id="app-modal-icon" class="app-modal-icon app-modal-icon--ok">✓</div>
    <h2 id="app-modal-title">Tytuł</h2>
    <p id="app-modal-body">Treść.</p>
    <button id="app-modal-close" type="button" class="stroj-btn">OK</button>
  </div>
</div>
