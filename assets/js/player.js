import { getGameById } from "./api.js";
import { toggleFavorite, isFavorite, addRecent } from "./favorites.js";
const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const id = params.get("idgry");
const validId = /^[a-zA-Z0-9_-]{1,80}$/.test(id || "");
const player = $("#game-frame"), status = $("#player-status");
function safePlayerUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (!(host === "gamemonetize.com" || host.endsWith(".gamemonetize.com") || host.endsWith(".gamedistribution.com") || host.endsWith(".html5games.com"))) return null;
    return url.href;
  } catch { return null; }
}
function favoriteButton(game) {
  const button = $("#player-favorite");
  const update = () => { button.textContent = isFavorite(game.id) ? "♥ W ulubionych" : "♡ Dodaj do ulubionych"; button.setAttribute("aria-pressed", String(isFavorite(game.id))); };
  update(); button.addEventListener("click", () => { toggleFavorite(game.id); update(); });
}
async function init() {
  if (!validId) { status.textContent = "Brak poprawnego identyfikatora gry. Wróć do katalogu i wybierz grę."; return; }
  status.textContent = "Pobieranie informacji o grze…";
  try {
    const game = await getGameById(id);
    if (!game) { status.textContent = "Nie znaleziono gry o podanym identyfikatorze. Nie uruchomiono innej gry."; $("#player-title").textContent = "Nie znaleziono gry"; return; }
    $("#player-title").textContent = game.title;
    $("#player-description").textContent = game.description || "Dostawca nie udostępnił opisu tej gry.";
    $("#player-instructions").textContent = game.instructions || "Instrukcje sterowania nie zostały udostępnione przez dostawcę.";
    $("#player-category").textContent = game.category;
    $("#player-tags").textContent = game.tags.join(" · ") || "Brak tagów";
    $("#player-back").href = "index.html";
    favoriteButton(game); addRecent(game.id);
    const launch = () => {
      const url = safePlayerUrl(game.url);
      if (!url) { status.textContent = "Dostawca nie podał bezpiecznego adresu HTTPS playera lub domena nie jest obsługiwana."; return; }
      player.src = url; player.hidden = false; $("#player-placeholder").hidden = true;
      status.textContent = "Jeśli gra nie uruchomi się, dostawca może blokować osadzanie w iframe.";
    };
    $("#launch-game").addEventListener("click", launch);
    $("#refresh-game").addEventListener("click", () => { if (player.src) player.src = player.src; else launch(); });
    $("#fullscreen-game").addEventListener("click", async () => {
      try { if (player.requestFullscreen) await player.requestFullscreen(); else status.textContent = "Pełny ekran nie jest obsługiwany przez tę przeglądarkę."; }
      catch { status.textContent = "Przeglądarka nie zezwoliła na pełny ekran."; }
    });
    $("#mute-game").addEventListener("click", () => { status.textContent = "Wyciszenie zależy od implementacji gry; strona nie może sterować dźwiękiem wewnątrz obcego iframe."; });
    $("#player-meta").hidden = false;
    status.textContent = "Gra jest gotowa do uruchomienia.";
    const related = document.querySelector("#similar-games");
    try {
      const { getGamesPage } = await import("./api.js");
      const list = (await getGamesPage(1)).filter(g => g.id !== game.id && (g.category === game.category || g.tags.some(t => game.tags.includes(t)))).slice(0, 4);
      for (const item of list) {
        const a = document.createElement("a"); a.className = "mini-game"; a.href = `gra.html?idgry=${encodeURIComponent(item.id)}`;
        const img = document.createElement("img"); img.loading = "lazy"; img.src = item.thumb; img.alt = ""; img.onerror = () => img.remove();
        const title = document.createElement("span"); title.textContent = item.title; a.append(img, title); related.append(a);
      }
    } catch {}
  } catch (error) { status.textContent = `${error.message} Sprawdź połączenie i ustawienia CORS.`; }
}
init();
