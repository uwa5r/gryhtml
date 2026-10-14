export const API_BASE = "https://gamemonetize.com/feed.php";
export const CACHE_TTL = 1000 * 60 * 30;
export const PAGE_SIZE = 50;
export const STORAGE_KEYS = {
  favorites: "gryhtml:favorites:v1",
  settings: "gryhtml:settings:v1",
  apiCache: "gryhtml:api-cache:v1",
  recent: "gryhtml:recent:v1"
};
export const CATEGORY_PAGES = [
  { slug: "przygodowe", title: "Gry przygodowe", query: "adventure", description: "Eksploruj światy, rozwiązuj zagadki i odkrywaj kolejne historie." },
  { slug: "akcja", title: "Gry akcji", query: "action", description: "Szybkie tempo, refleks i wyzwania na każdą przerwę." },
  { slug: "arcade", title: "Arcade", query: "arcade", description: "Krótkie rundy, proste zasady i wynik do pobicia." },
  { slug: "wyscigowe", title: "Gry wyścigowe", query: "racing", description: "Wsiadaj za kierownicę i sprawdź swoje umiejętności." },
  { slug: "sportowe", title: "Gry sportowe", query: "sports", description: "Rywalizuj, trenuj celność i walcz o najlepszy wynik." },
  { slug: "logiczne", title: "Gry logiczne", query: "puzzle", description: "Ćwicz spryt i znajdź rozwiązanie każdego poziomu." },
  { slug: "dziewczyny", title: "Gry dla dziewczyn", query: "girls", description: "Moda, projektowanie, gotowanie i inne lekkie gry." },
  { slug: "mobilne", title: "Gry mobilne", query: "mobile", description: "Gry oznaczone przez dostawcę jako dostępne na urządzeniach mobilnych." },
  { slug: "angry-birds", title: "Angry Birds", query: "angry birds", description: "Wyniki wyszukiwania tytułów i tagów powiązanych z Angry Birds. Brak wyników oznacza, że źródło ich obecnie nie udostępnia." },
  { slug: "spongebob", title: "SpongeBob", query: "spongebob", description: "Gry znalezione po tytule lub tagach SpongeBob. GRYHTML nie jest powiązane z właścicielami marki." },
  { slug: "mario", title: "Mario", query: "mario", description: "Gry znalezione po tytule lub tagach Mario. Nie sugerujemy oficjalnego powiązania z marką." },
  { slug: "roblox", title: "Roblox", query: "roblox", description: "Gry znalezione po tytule lub tagach Roblox. Dostępność zależy od katalogu dostawcy." }
];
