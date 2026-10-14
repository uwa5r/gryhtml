import { API_BASE, CACHE_TTL, PAGE_SIZE, STORAGE_KEYS } from "./config.js";

const memory = new Map();
const safeText = value => typeof value === "string" ? value.trim() : value == null ? "" : String(value);
function cacheRead(key) {
  try {
    const item = JSON.parse(localStorage.getItem(STORAGE_KEYS.apiCache) || "{}")[key];
    if (item && Date.now() - item.time < CACHE_TTL) return item.data;
  } catch {}
  return null;
}
function cacheWrite(key, data) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.apiCache) || "{}");
    all[key] = { time: Date.now(), data };
    const keys = Object.keys(all).sort((a,b) => all[b].time - all[a].time).slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.apiCache, JSON.stringify(Object.fromEntries(keys.map(k => [k, all[k]]))));
  } catch {}
}
export function normalizeGame(raw) {
  if (!raw || raw.id == null || !String(raw.id).trim()) return null;
  const id = String(raw.id).trim();
  const tags = Array.isArray(raw.tags) ? raw.tags : safeText(raw.tags).split(/[,;|]/);
  let category = safeText(raw.category);
  return {
    id, title: safeText(raw.title) || "Gra bez tytułu",
    description: safeText(raw.description), instructions: safeText(raw.instructions),
    url: safeText(raw.url), thumb: safeText(raw.thumb),
    category: category || "Inne",
    tags: [...new Set(tags.map(safeText).map(t => t.trim()).filter(Boolean))],
    width: Number(raw.width) || 800, height: Number(raw.height) || 600,
    platform: raw.platform ?? null
  };
}
function unique(games) {
  const map = new Map();
  for (const raw of games || []) { const game = normalizeGame(raw); if (game && !map.has(game.id)) map.set(game.id, game); }
  return [...map.values()];
}
async function request(params, { allowCache = true } = {}) {
  const url = new URL(API_BASE);
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v)); });
  const key = url.toString();
  if (memory.has(key)) return memory.get(key);
  if (allowCache) { const cached = cacheRead(key); if (cached) { memory.set(key, cached); return cached; } }
  let response;
  try {
    response = await fetch(key, { headers: { Accept: "application/json" }, mode: "cors" });
  } catch (error) {
    const err = new Error("Nie udało się połączyć z katalogiem GameMonetize. Możliwy problem z siecią lub CORS.");
    err.cause = error; throw err;
  }
  if (!response.ok) throw new Error(`Katalog gier zwrócił HTTP ${response.status}.`);
  let json;
  try { json = await response.json(); } catch { throw new Error("Źródło gier zwróciło niepoprawny JSON."); }
  const data = Array.isArray(json) ? unique(json) : json && typeof json === "object" ? unique([json]) : [];
  memory.set(key, data); cacheWrite(key, data); return data;
}
export async function getGamesPage(page = 1, extra = {}) {
  return request({ format: 0, num: PAGE_SIZE, page, ...extra });
}
export async function searchRemote(name, page = 1) {
  return request({ format: 0, name, num: PAGE_SIZE, page });
}
export async function getMobileGames(page = 1) {
  return request({ format: 0, platform: 1, links: 0, num: PAGE_SIZE, page });
}
export async function getGameById(id) {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(String(id || ""))) return null;
  for (const list of memory.values()) { const found = list.find(g => g.id === String(id)); if (found) return found; }
  const data = await request({ format: 0, id: String(id) });
  return data.find(g => g.id === String(id)) || null;
}
export function clearApiMemory() { memory.clear(); }
