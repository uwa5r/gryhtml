import { STORAGE_KEYS } from "./config.js";
function read(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
}
export function getFavorites() { return read(STORAGE_KEYS.favorites, []); }
export function isFavorite(id) { return getFavorites().includes(String(id)); }
export function toggleFavorite(id) {
  const key = String(id), items = getFavorites();
  const next = items.includes(key) ? items.filter(x => x !== key) : [...items, key];
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("gryhtml:favorites-changed", { detail: next }));
  return next.includes(key);
}
export function getRecent() { return read(STORAGE_KEYS.recent, []); }
export function addRecent(id) {
  const next = [String(id), ...getRecent().filter(x => x !== String(id))].slice(0, 12);
  localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(next));
}
