import { getGamesPage, searchRemote, getMobileGames, getGameById } from "./api.js";
import { getFavorites, isFavorite, toggleFavorite, getRecent } from "./favorites.js";
import { CATEGORY_PAGES } from "./config.js";
import { filterAndSort, debounce } from "./search.js";
import { getCategory, renderCategoryLinks } from "./categories.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
function make(tag, cls, text) { const el = document.createElement(tag); if (cls) el.className = cls; if (text != null) el.textContent = text; return el; }
function gameCard(game) {
  const article = make("article", "game-card reveal");
  const link = make("a", "game-art"); link.href = `gra.html?idgry=${encodeURIComponent(game.id)}`; link.setAttribute("aria-label", `Graj w ${game.title}`);
  const img = make("img"); img.src = game.thumb || ""; img.alt = `Miniatura gry ${game.title}`; img.loading = "lazy"; img.decoding = "async";
  img.onerror = () => { img.removeAttribute("src"); link.classList.add("image-fallback"); };
  const play = make("span", "play-overlay", "▶ Graj"); link.append(img, play);
  const body = make("div", "game-card-body");
  const heading = make("h3"); const titleLink = make("a", "game-title", game.title); titleLink.href = link.href; heading.append(titleLink);
  const meta = make("p", "game-meta", game.category || (game.tags[0] || "Gra HTML5"));
  const fav = make("button", "favorite-btn", isFavorite(game.id) ? "♥" : "♡"); fav.type = "button";
  fav.setAttribute("aria-label", isFavorite(game.id) ? `Usuń ${game.title} z ulubionych` : `Dodaj ${game.title} do ulubionych`);
  fav.setAttribute("aria-pressed", String(isFavorite(game.id)));
  fav.addEventListener("click", () => { const now = toggleFavorite(game.id); fav.textContent = now ? "♥" : "♡"; fav.setAttribute("aria-pressed", String(now)); fav.setAttribute("aria-label", now ? `Usuń ${game.title} z ulubionych` : `Dodaj ${game.title} do ulubionych`); });
  body.append(heading, meta, fav); article.append(link, body); return article;
}
function renderGames(container, games, emptyText = "Nie znaleziono gier. Spróbuj zmienić wyszukiwanie lub filtry.") {
  container.replaceChildren();
  if (!games.length) { const empty = make("div", "empty-state"); empty.append(make("span", "empty-icon", "⌕"), make("h3", "", "Brak wyników"), make("p", "", emptyText)); container.append(empty); return; }
  games.forEach(game => container.append(gameCard(game)));
  observeReveals();
}
function observeReveals() {
  const items = $$(".reveal:not(.is-visible)");
  if (!("IntersectionObserver" in window)) { items.forEach(el => el.classList.add("is-visible")); return; }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .08 });
  items.forEach(el => observer.observe(el));
}
function skeletons(container, count = 8) {
  container.replaceChildren();
  for (let i=0;i<count;i++) { const s = make("div", "skeleton-card"); s.append(make("div", "skeleton-art"), make("div", "skeleton-line"), make("div", "skeleton-line short")); container.append(s); }
}
function fillCategoryNav() {
  const holder = $("#category-links");
  if (holder) renderCategoryLinks(holder);
}
function wireSearch() {
  const input = $("#global-search");
  if (!input) return;
  const submit = () => { const q = input.value.trim(); location.href = `szukaj.html?q=${encodeURIComponent(q)}`; };
  input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
  const button = $("#search-submit"); if (button) button.addEventListener("click", submit);
  const mobile = $("#mobile-search"); if (mobile) mobile.addEventListener("submit", e => { e.preventDefault(); const q = new FormData(mobile).get("q") || ""; location.href = `szukaj.html?q=${encodeURIComponent(q)}`; });
}
function wireMenu() {
  const toggle = $("#menu-toggle"), panel = $("#mobile-panel");
  if (!toggle || !panel) return;
  toggle.addEventListener("click", () => { const open = toggle.getAttribute("aria-expanded") !== "true"; toggle.setAttribute("aria-expanded", String(open)); panel.hidden = !open; document.body.classList.toggle("menu-open", open); });
}
function wireCategoryPage() {
  const page = document.body.dataset.categoryPage;
  if (!page) return false;
  const category = getCategory(page);
  $("#category-title").textContent = category?.title || "Kategoria gier";
  $("#category-description").textContent = category?.description || "Odkrywaj gry z katalogu.";
  const grid = $("#category-games"), search = $("#category-search"), sort = $("#category-sort"), count = $("#result-count"), more = $("#load-more");
  let all = [], pageNum = 1, busy = false;
  async function load(reset = false) {
    if (busy) return; busy = true;
    if (reset) { pageNum = 1; all = []; skeletons(grid, 8); }
    if (count) count.textContent = "Ładowanie…";
    try {
      let fetched;
      const special = ["angry-birds","spongebob","mario","roblox"].includes(page);
      const mobile = page === "mobilne";
      if (special) fetched = await searchRemote(category.query, pageNum);
      else if (mobile) fetched = await getMobileGames(pageNum);
      else fetched = await getGamesPage(pageNum);
      const seen = new Set(all.map(g => g.id));
      all.push(...fetched.filter(g => !seen.has(g.id) && (special || mobile || !category || fetched.length === 0 || g.category.toLowerCase().includes(category.query) || g.tags.some(t => t.toLowerCase().includes(category.query)))));
      const filtered = filterAndSort(all, { query: search.value, sort: sort.value });
      renderGames(grid, filtered);
      count.textContent = `${filtered.length} ${filtered.length === 1 ? "gra" : "gier"} w załadowanych wynikach`;
      more.hidden = fetched.length < 50;
      if (!all.length) count.textContent = "Źródło nie zwróciło gier dla tej kategorii.";
    } catch (error) {
      renderGames(grid, []); const note = make("p", "api-notice", `${error.message} Jeśli błąd CORS utrzymuje się, przeglądarka blokuje źródło zewnętrzne. Możesz użyć statycznego katalogu demonstracyjnego lub opcjonalnego proxy, np. Cloudflare Worker.`);
      grid.append(note); count.textContent = "Nie udało się pobrać danych.";
    } finally { busy = false; }
  }
  const refilter = debounce(() => { renderGames(grid, filterAndSort(all, { query: search.value, sort: sort.value })); count.textContent = `${filterAndSort(all, { query: search.value, sort: sort.value }).length} wyników`; }, 300);
  search.addEventListener("input", refilter); sort.addEventListener("change", refilter);
  $("#clear-category-filters").addEventListener("click", () => { search.value = ""; sort.value = "source"; refilter(); });
  more.addEventListener("click", () => { pageNum++; load(false); });
  load(true); return true;
}
async function initHome() {
  const sections = [
    ["popular-games", "source"], ["new-games", "source"], ["adventure-games", "adventure"], ["action-games", "action"], ["mobile-games", "mobile"]
  ];
  for (const [id, type] of sections) {
    const grid = document.getElementById(id); if (!grid) continue;
    skeletons(grid, 4);
    try {
      let games = type === "mobile" ? await getMobileGames(1) : await getGamesPage(1);
      if (type === "adventure" || type === "action") games = games.filter(g => `${g.category} ${g.tags.join(" ")}`.toLowerCase().includes(type));
      renderGames(grid, games.slice(0, 8));
    } catch (e) {
      renderGames(grid, []);
      const note = make("p", "api-notice", `Katalog GameMonetize jest chwilowo niedostępny: ${e.message}`);
      grid.append(note);
    }
  }
  const categoryContainer = $("#home-categories"); if (categoryContainer) renderCategoryLinks(categoryContainer);
  const recentGrid = $("#recent-games");
  if (recentGrid) {
    const ids = getRecent();
    if (!ids.length) renderGames(recentGrid, []);
    else {
      const recent = [];
      for (const id of ids.slice(0, 8)) { try { const game = await getGameById(id); if (game) recent.push(game); } catch {} }
      renderGames(recentGrid, recent);
    }
  }
}
async function initSearchPage() {
  const params = new URLSearchParams(location.search), initial = params.get("q") || "";
  const input = $("#search-query"), grid = $("#search-results"), count = $("#search-count"), sort = $("#search-sort");
  input.value = initial;
  let games = [], currentQuery = initial, busy = false;
  async function search() {
    if (busy) return; busy = true; skeletons(grid, 8);
    try {
      games = currentQuery.trim() ? await searchRemote(currentQuery, 1) : await getGamesPage(1);
      const filtered = filterAndSort(games, { query: currentQuery, sort: sort.value });
      renderGames(grid, filtered); count.textContent = `${filtered.length} wyników w pobranej partii`;
      history.replaceState({}, "", `szukaj.html?q=${encodeURIComponent(currentQuery)}`);
    } catch (error) { renderGames(grid, []); grid.append(make("p", "api-notice", error.message)); count.textContent = "Błąd wyszukiwania"; }
    finally { busy = false; }
  }
  const update = debounce(() => { currentQuery = input.value; search(); }, 300);
  input.addEventListener("input", update); sort.addEventListener("change", () => { renderGames(grid, filterAndSort(games, { query: currentQuery, sort: sort.value })); });
  $("#search-form").addEventListener("submit", e => { e.preventDefault(); currentQuery = input.value; search(); });
  search();
}
async function initFavorites() {
  const grid = $("#favorites-grid"); let items = [];
  async function load() {
    const ids = getFavorites(); items = [];
    for (const id of ids) { try { const game = await getGameById(id); if (game) items.push(game); } catch {} }
    renderGames(grid, items);
    if (!items.length) { grid.replaceChildren(); const empty = make("div", "empty-state"); empty.append(make("span", "empty-icon", "♡"), make("h3", "", "Twoja lista jest pusta"), make("p", "", "Dodaj gry do ulubionych, klikając serce na karcie gry.")); grid.append(empty); }
  }
  await load();
  window.addEventListener("gryhtml:favorites-changed", load);
}
function init() {
  fillCategoryNav(); wireSearch(); wireMenu(); observeReveals();
  if (wireCategoryPage()) return;
  if (document.body.dataset.page === "search") initSearchPage();
  else if (document.body.dataset.page === "favorites") initFavorites();
  else if (document.body.dataset.page === "home") initHome();
}
document.addEventListener("DOMContentLoaded", init);
window.addEventListener("gryhtml:favorites-changed", () => {
  $$(".favorite-btn").forEach(button => {
    const card = button.closest(".game-card"), link = card?.querySelector(".game-art");
    const id = new URL(link?.href || location.href).searchParams.get("idgry");
    if (id) button.textContent = isFavorite(id) ? "♥" : "♡";
  });
});
