# GRYHTML

Statyczny portal z grami przeglądarkowymi, przygotowany do publikacji na GitHub Pages. Nie wymaga Node.js, backendu ani procesu budowania.

## Struktura

- Osobne pliki HTML dla strony głównej, wyszukiwarki, ulubionych, kategorii i playera.
- `assets/js/api.js` — wspólne API GameMonetize, normalizacja danych, cache pamięciowy i LocalStorage.
- `assets/js/main.js` — karty, nawigacja, wyszukiwarka, kategorie i widoki katalogu.
- `assets/js/player.js` — walidacja ID, kontrola domen playera, iframe, fullscreen i podobne gry.
- `assets/css/style.css` — responsywny dark UI bez gradientów.

## Uruchomienie lokalne

Moduły ES i `fetch` mogą być blokowane przy otwieraniu plików przez `file://`. Uruchom prosty serwer statyczny, np. w VS Code rozszerzenie Live Server, albo opublikuj repozytorium na GitHub Pages. Nie jest wymagany backend aplikacji.

## Publikacja przez GitHub Pages

1. Utwórz repozytorium o nazwie `gryhtml`.
2. Wgraj wszystkie pliki i katalogi z projektu do głównego katalogu repozytorium.
3. Otwórz **Settings → Pages**.
4. W sekcji **Build and deployment** wybierz **Deploy from a branch**.
5. Wybierz gałąź `main` i katalog `/(root)`, następnie zapisz.
6. Po zakończeniu publikacji otwórz adres `https://TWOJ-LOGIN.github.io/gryhtml/`.
7. Sprawdź bezpośrednio `gra.html?idgry=88462`, wyszukiwarkę i ulubione. Dany identyfikator jest przykładem testowym; jeśli dostawca nie zwróci gry, player pokaże czytelny komunikat.

## API i CORS

Projekt próbuje pobierać dane bezpośrednio z:

- `https://gamemonetize.com/feed.php?format=0&num=50&page=1`
- `https://gamemonetize.com/feed.php?format=0&id=...`
- `https://gamemonetize.com/feed.php?format=0&name=...&num=50&page=1`
- `https://gamemonetize.com/feed.php?format=0&platform=1&links=0&num=50&page=1`

Dostępność zależy od sieci, konfiguracji CORS i aktualnego zachowania dostawcy. Jeśli konsola przeglądarki zgłasza błąd CORS, strona statyczna nie może go obejść sama. Wtedy można dodać opcjonalny publiczny proxy, np. Cloudflare Worker z własnymi limitami i zasadami bezpieczeństwa, ale nie jest on wymagany przez podstawową architekturę. Nie należy udawać, że gry zostały pobrane — interfejs wyświetla komunikat błędu.

Nie każda gra pozwala na osadzanie w `iframe`; dostawca może blokować embedding nagłówkami CSP lub `X-Frame-Options`. Dźwiękiem wewnątrz obcego iframe nie da się sterować z poziomu strony, jeśli gra nie udostępnia takiego API. Pełny ekran zależy od przeglądarki i uprawnień.

## Dane i prywatność

Ulubione, ostatnio grane i cache katalogu są przechowywane w LocalStorage. Nie są to dane konta i nie synchronizują się między urządzeniami. Strona polityki prywatności wyjaśnia podstawowe zachowanie lokalnego zapisu.

## Kontrola jakości

- Wszystkie odnośniki wewnętrzne używają ścieżek względnych, więc działają w podkatalogu repozytorium.
- Identyfikator z URL jest walidowany, a brak gry nie uruchamia losowego tytułu.
- URL iframe musi być HTTPS i pochodzić z jawnie dopuszczonej domeny dostawcy.
- Treści z API są wstawiane przez `textContent` i bezpieczne tworzenie elementów.
- Karty i wyniki są deduplikowane po `id`; ulubione współdzielone są przez wszystkie strony na tym samym originie.
- Nie ma fikcyjnych ocen, liczników użytkowników ani etykiet popularności opartych na zgadywaniu.
- Style nie używają gradientów; animacje respektują `prefers-reduced-motion`.
