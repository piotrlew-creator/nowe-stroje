# Instrukcja wdrożenia

Strona jest już gotowa w Twoim folderze. Zostały trzy rzeczy do zrobienia
ręcznie, ponieważ wymagają Twojego konta Google / GitHub: **(1)** uruchomienie
darmowego backendu w Google Sheets, **(2)** wysłanie plików na GitHub i
włączenie GitHub Pages, **(3)** opcjonalnie — podmiana obrazka rozmiarówki.

---

## 1. Backend: Google Sheets + Google Apps Script

Strona nie ma własnego serwera (MkDocs generuje statyczną stronę), więc
jako prostą i darmową "bazę danych" wykorzystujemy arkusz Google Sheets
sterowany skryptem Google Apps Script.

1. Wejdź na [sheets.google.com](https://sheets.google.com) i utwórz nowy,
   pusty arkusz. Nazwij go np. **"Nowe Stroje — dane"**.
2. W menu wybierz **Rozszerzenia → Apps Script**.
3. Usuń domyślną zawartość edytora kodu (`Code.gs`) i wklej w to miejsce
   całą zawartość pliku [`google-apps-script/Code.gs`](google-apps-script/Code.gs)
   z tego repozytorium.
4. Zapisz projekt (ikona dyskietki lub `Ctrl+S`). Możesz nadać mu nazwę,
   np. "Nowe Stroje — backend".
5. Kliknij niebieski przycisk **Wdróż (Deploy) → Nowe wdrożenie**.
6. Przy "Wybierz typ" kliknij ikonę koła zębatego i wybierz
   **Aplikacja internetowa (Web app)**.
7. Ustaw:
   - **Wykonaj jako:** Ja (Twój adres e-mail)
   - **Kto ma dostęp:** Każdy (Anyone)
8. Kliknij **Wdróż**. Google poprosi o autoryzację — zaakceptuj uprawnienia
   (to normalne, że pojawi się ostrzeżenie "Google nie zweryfikował tej
   aplikacji" — to Twój własny skrypt, kliknij "Zaawansowane" → "Przejdź
   do (nazwa projektu), niebezpieczne").
9. Po wdrożeniu Google pokaże **adres URL aplikacji internetowej**
   (kończy się na `/exec`). Skopiuj go.
10. W tym repozytorium otwórz plik `docs/js/config.js` i wklej skopiowany
    adres w miejsce `WKLEJ_TUTAJ_URL_Z_GOOGLE_APPS_SCRIPT`, np.:

    ```js
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/XXXXXXX/exec";
    ```

11. Zapisz plik.

**Ważne:** jeśli w przyszłości zmienisz kod `Code.gs`, musisz utworzyć
**nowe wdrożenie** (Wdróż → Zarządzaj wdrożeniami → ✏️ → Nowa wersja),
inaczej zmiany nie zostaną uwzględnione pod tym samym adresem URL.

Arkusz automatycznie utworzy zakładkę **"Zawodnicy"** z nagłówkami
(Numer zawodnika, Nazwisko, Imię, Rozmiar, Uwagi) przy pierwszym
zapisanym zgłoszeniu.

---

## 2. Publikacja na GitHub Pages

1. Otwórz Git Bash / terminal w folderze projektu:

   ```bash
   cd "C:\Users\piotr\Desktop\Projekty GitHub\nowe-stroje"
   ```

2. Sprawdź, czy folder jest już połączony ze zdalnym repozytorium:

   ```bash
   git remote -v
   ```

   Jeśli nie widzisz `piotrlew-creator/nowe-stroje`, dodaj je:

   ```bash
   git remote add origin https://github.com/piotrlew-creator/nowe-stroje.git
   ```

3. Dodaj i wyślij pliki:

   ```bash
   git add .
   git commit -m "Dodaj strone zgloszeniowa (MkDocs)"
   git branch -M main
   git push -u origin main
   ```

4. Wejdź na stronę repozytorium na GitHub:
   `https://github.com/piotrlew-creator/nowe-stroje`
5. Przejdź do **Settings → Pages**.
6. W sekcji **Build and deployment → Source** wybierz **Deploy from a
   branch**.
7. W sekcji **Branch** wybierz `gh-pages` / `(root)` i kliknij **Save**.
   (Gałąź `gh-pages` pojawi się automatycznie po pierwszym uruchomieniu
   workflow z kroku 3 — może to potrwać 1–2 minuty; jeśli jej jeszcze nie
   widać, sprawdź zakładkę **Actions** w repozytorium, czy proces
   "Deploy MkDocs do GitHub Pages" zakończył się sukcesem, i odśwież
   stronę Ustawień).
8. Po chwili strona będzie dostępna pod adresem:
   `https://piotrlew-creator.github.io/nowe-stroje/`

Każdy kolejny `git push` na gałąź `main` automatycznie przebuduje i
opublikuje stronę (dzięki `.github/workflows/deploy.yml`).

---

## 3. Podmiana obrazka rozmiarówki

W repozytorium znajduje się tymczasowy obrazek zastępczy:
`docs/img/rozmiarowka.jpg`.

Aby wstawić docelowe zdjęcie tabeli rozmiarów:

1. Przygotuj plik `.jpg` z rozmiarówką.
2. Zamień nim plik `docs/img/rozmiarowka.jpg` (zachowaj dokładnie tę samą
   nazwę pliku — wtedy nie trzeba nic zmieniać w kodzie).
3. Zapisz, zatwierdź i wyślij zmianę:

   ```bash
   git add docs/img/rozmiarowka.jpg
   git commit -m "Dodaj docelowy obrazek rozmiarowki"
   git push
   ```

Strona automatycznie się przebuduje z nowym obrazkiem.

---

## Jak to działa (skrót)

- Formularz (`docs/index.md` + `docs/js/form.js`) wysyła dane do Twojego
  Google Apps Script, który sprawdza duplikaty numeru zawodnika oraz
  pary imię+nazwisko i zapisuje wiersz w arkuszu Google Sheets.
- Zakładka Tabela (`docs/tabela.md` + `docs/js/tabela.js`) pobiera
  aktualne dane z tego samego skryptu i renderuje tabelę oraz obsługuje
  eksport do `.xlsx` (biblioteka SheetJS) i `.pdf` (biblioteka jsPDF).
- Cała strona jest statyczna (MkDocs + Material) i hostowana za darmo na
  GitHub Pages — jedynym "serwerem" jest darmowy Google Apps Script.

## Rozwiązywanie problemów

- **Popup "Backend nie jest skonfigurowany"** — nie uzupełniono jeszcze
  `APPS_SCRIPT_URL` w `docs/js/config.js` (patrz krok 1.10).
- **Błąd połączenia z serwerem** — sprawdź, czy wdrożenie Google Apps
  Script ma ustawione "Kto ma dostęp: Każdy" (krok 1.7), oraz czy
  używasz adresu kończącego się na `/exec` (nie `/dev`).
- **Strona GitHub Pages pokazuje 404** — poczekaj na zakończenie
  workflow w zakładce **Actions**, upewnij się że w **Settings → Pages**
  wybrana jest gałąź `gh-pages`.
