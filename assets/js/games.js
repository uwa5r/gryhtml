import { getGamesPage, searchRemote, getMobileGames } from "./api.js";
import { CATEGORY_PAGES, PAGE_SIZE } from "./config.js";

export function textMatches(game, query) {
  const q = String(query || "").toLocaleLowerCase("pl").trim();
  if (!q) return true;
  return [game.title, game.description, game.category, ...(game.tags || [])].join(" ").toLocaleLowerCase("pl").includes(q);
}
export function sortGames(games, mode = "source") {
  const result = [...games];
  if (mode === "title") result.sort((a,b) => a.title.localeCompare(b.title, "pl"));
  if (mode === "title-desc") result.sort((a,b) => b.title.localeCompare(a.title, "pl"));
  return result;
}
export async function loadCollection({ category, query = "", page = 1, mobile = false } = {}) {
  let games;
  if (mobile) games = await getMobileGames(page);
  else if (query.trim()) games = await searchRemote(query.trim(), page);
  else games = await getGamesPage(page);
  if (category) {
    const cat = CATEGORY_PAGES.find(x => x.slug === category);
    if (cat) {
      if (["angry-birds","spongebob","mario","roblox"].includes(category)) {
        if (!query) games = await searchRemote(cat.query, page);
      } else {
        const terms = [cat.query, cat.title].map(x => x.toLowerCase());
        games = games.filter(g => terms.some(t => g.category.toLowerCase().includes(t) || g.tags.some(tag => tag.toLowerCase().includes(t))));
      }
    }
  }
  return games.filter(g => textMatches(g, query));
}
export { PAGE_SIZE };
