import { textMatches, sortGames } from "./games.js";
export function filterAndSort(games, { query = "", category = "", tag = "", sort = "source" } = {}) {
  let out = games.filter(g => textMatches(g, query));
  if (category) out = out.filter(g => g.category.toLowerCase() === category.toLowerCase());
  if (tag) out = out.filter(g => g.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  return sortGames(out, sort);
}
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}
