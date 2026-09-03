# Nowe stroje dla U15

Wypełnij poniższy formularz, aby zgłosić dane do nowego stroju sportowego.

<div class="rozmiarowka-blok">
  <p class="rozmiarowka-cena">Cena za dwa komplety strojów meczowych: <strong>290 zł</strong></p>

  <figure class="rozmiarowka-figura">
    <img class="rozmiarowka-miniatura" data-lightbox src="img/rozmiarowka-koszulki.jpg" alt="Rozmiary koszulek">
    <figcaption class="rozmiarowka-podpis">Rozmiary koszulek — stuknij, aby powiększyć</figcaption>
  </figure>

  <figure class="rozmiarowka-figura">
    <img class="rozmiarowka-miniatura" data-lightbox src="img/rozmiarowka-spodenki.jpg" alt="Rozmiary spodenek">
    <figcaption class="rozmiarowka-podpis">Rozmiary spodenek — stuknij, aby powiększyć</figcaption>
  </figure>
</div>

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
    <label for="rozmiar-koszulki">Rozmiar koszulki <span class="wymagane">*</span></label>
    <select id="rozmiar-koszulki" name="rozmiar-koszulki" required>
      <option value="" disabled selected>Wybierz rozmiar</option>
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
    <label for="rozmiar-spodenek">Rozmiar spodenek <span class="wymagane">*</span></label>
    <select id="rozmiar-spodenek" name="rozmiar-spodenek" required>
      <option value="" disabled selected>Wybierz rozmiar</option>
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
    <label for="numer">Numer zawodnika <span class="wymagane">*</span></label>
    <input type="number" id="numer" name="numer" inputmode="numeric" min="0" step="1" required>
  </div>

  <div class="field">
    <label for="uwagi">Uwagi <span style="opacity:.6; font-weight:400;">(opcjonalne)</span></label>
    <textarea id="uwagi" name="uwagi" placeholder="Np. dodatkowe informacje dotyczące zamówienia"></textarea>
  </div>

  <button type="submit" id="zgloszenie-submit" class="stroj-btn">Zatwierdź</button>

</form>

<div id="rozmiarowka-lightbox" class="lightbox" aria-hidden="true">
  <button id="rozmiarowka-close" class="lightbox-close" type="button" aria-label="Zamknij">✕</button>
  <img id="rozmiarowka-lightbox-img" src="" alt="">
</div>

<div id="app-modal-overlay" class="app-modal-overlay" aria-hidden="true">
  <div class="app-modal" role="dialog" aria-modal="true">
    <div id="app-modal-icon" class="app-modal-icon app-modal-icon--ok">✓</div>
    <h2 id="app-modal-title">Tytuł</h2>
    <p id="app-modal-body">Treść.</p>
    <button id="app-modal-close" type="button" class="stroj-btn">OK</button>
  </div>
</div>
