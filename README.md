# Nowe Stroje

Prosta strona (GitHub + Markdown + MkDocs) do zbierania zgłoszeń danych
do nowych strojów sportowych: nazwisko, imię, rozmiar koszulki, rozmiar
spodenek, numer zawodnika i opcjonalne uwagi.

- **Zgłoszenie** (`docs/index.md`) — formularz z walidacją duplikatów
  (numer zawodnika i para imię+nazwisko) oraz podglądem rozmiarówki.
- **Tabela** (`docs/tabela.md`) — lista wszystkich zgłoszeń z eksportem
  do `.xlsx` i `.pdf`.
- **Backend** (`google-apps-script/Code.gs`) — darmowy Google Apps
  Script zapisujący dane do arkusza Google Sheets.

Pełna instrukcja wdrożenia (Google Sheets, GitHub Pages, podmiana
obrazka rozmiarówki) znajduje się w [`INSTRUKCJA.md`](INSTRUKCJA.md).

## Podgląd lokalny

```bash
pip install -r requirements.txt
mkdocs serve
```

Strona będzie dostępna pod `http://127.0.0.1:8000/nowe-stroje/`.
