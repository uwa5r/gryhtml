import { CATEGORY_PAGES } from "./config.js";
export function getCategory(slug) { return CATEGORY_PAGES.find(c => c.slug === slug) || null; }
export function renderCategoryLinks(container) {
  for (const category of CATEGORY_PAGES) {
    const a = document.createElement("a"); a.className = "category-chip";
    a.href = `${category.slug}.html`; a.textContent = category.title; container.append(a);
  }
}
