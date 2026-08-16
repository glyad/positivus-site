import {
  groupSiteResults,
  searchSiteDocuments,
  siteSearchRecoveryGuidance,
  shouldInterceptSiteSearchSubmit
} from "./site-search-core.mjs";

const copy = {
  en: {
    curated: "Popular resources",
    resultCount: (count) => `${count} result${count === 1 ? "" : "s"}`,
    types: { page: "Pages", service: "Services", "case-study": "Case studies", article: "Articles", author: "Authors" }
  },
  he: {
    curated: "משאבים מומלצים",
    resultCount: (count) => `${count} תוצאות`,
    types: { page: "עמודים", service: "שירותים", "case-study": "מקרי בוחן", article: "מאמרים", author: "כותבים" }
  }
};

const dialog = document.querySelector("[data-site-search-dialog]");
const input = document.querySelector("[data-site-search-input]");
const resultsRegion = document.querySelector("[data-site-search-results]");
const status = document.querySelector("[data-site-search-status]");
const triggers = [...document.querySelectorAll("[data-site-search-open]")];

if (dialog && input && resultsRegion && status && triggers.length) {
  let documents = null;
  let indexUrl = null;
  let trigger = null;
  let debounceTimer = null;
  let locale = document.documentElement.lang === "he" ? "he" : "en";

  const canEnhance = typeof dialog.showModal === "function" && typeof fetch === "function";
  const text = () => copy[locale];
  const searchForm = input.form;

  function currentIndexUrl() {
    return new URL(dialog.dataset.siteSearchIndex, document.baseURI).href;
  }

  function clearResults() {
    resultsRegion.replaceChildren();
  }

  function recoveryRoutes() {
    const resolveRoute = (value) => new URL(value ?? "", document.baseURI).href;
    return {
      fallback: resolveRoute(searchForm?.getAttribute("action")),
      topics: resolveRoute(dialog.dataset.siteSearchTopics),
      services: resolveRoute(dialog.dataset.siteSearchServices),
      blog: resolveRoute(dialog.dataset.siteSearchBlog)
    };
  }

  function renderRecovery(kind) {
    const guidance = siteSearchRecoveryGuidance(locale, recoveryRoutes())[kind];
    clearResults();
    status.textContent = guidance.message;
    const actions = document.createElement("ul");
    for (const action of guidance.actions) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = action.href;
      link.textContent = action.label;
      item.append(link);
      actions.append(item);
    }
    resultsRegion.append(actions);
  }

  function createLink(result) {
    const link = document.createElement("a");
    link.href = new URL(result.href ?? "", indexUrl ?? document.baseURI).href;
    const title = document.createElement("strong");
    title.textContent = result.title ?? "";
    const summary = document.createElement("span");
    summary.textContent = result.summary ?? "";
    link.append(title, summary);
    return link;
  }

  function renderResults(query) {
    clearResults();
    const found = searchSiteDocuments(documents ?? [], query, { limit: 12 });
    const groups = groupSiteResults(found);
    status.textContent = query.trim() ? (found.length ? text().resultCount(found.length) : "") : text().curated;

    if (!found.length && query.trim()) {
      renderRecovery("noResults");
      return;
    }

    for (const [type, entries] of groups) {
      const section = document.createElement("section");
      const heading = document.createElement("h3");
      heading.textContent = text().types[type];
      const list = document.createElement("ul");
      for (const result of entries) {
        const item = document.createElement("li");
        item.append(createLink(result));
        list.append(item);
      }
      section.append(heading, list);
      resultsRegion.append(section);
    }
  }

  async function loadIndex() {
    const nextIndexUrl = currentIndexUrl();
    if (documents && indexUrl === nextIndexUrl) return documents;
    const response = await fetch(nextIndexUrl, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Could not load search index (${response.status})`);
    const nextDocuments = await response.json();
    if (!Array.isArray(nextDocuments)) throw new TypeError("Search index must be an array");
    documents = nextDocuments;
    indexUrl = nextIndexUrl;
    return documents;
  }

  async function openSearch(openingTrigger) {
    trigger = openingTrigger;
    dialog.showModal();
    status.textContent = "";
    clearResults();
    input.focus();
    try {
      await loadIndex();
      renderResults(input.value);
    } catch {
      renderRecovery("unavailable");
    }
  }

  function applyLanguage(nextLocale) {
    locale = nextLocale === "he" ? "he" : "en";
    dialog.dataset.siteSearchIndex = dialog.dataset[`siteSearchIndex${locale === "he" ? "He" : "En"}`] ?? dialog.dataset.siteSearchIndex;
    const fallback = dialog.dataset[`siteSearchFallback${locale === "he" ? "He" : "En"}`];
    if (fallback && searchForm) searchForm.action = fallback;
    for (const name of ["Topics", "Services", "Blog"]) {
      dialog.dataset[`siteSearch${name}`] = dialog.dataset[`siteSearch${name}${locale === "he" ? "He" : "En"}`] ?? dialog.dataset[`siteSearch${name}`];
    }
    for (const item of triggers) {
      if (fallback) item.href = fallback;
      item.setAttribute("aria-label", locale === "he" ? "חיפוש בפוזיטיבוס" : "Search Positivus");
    }
    documents = null;
    indexUrl = null;
    if (dialog.open) {
      void loadIndex().then(() => renderResults(input.value)).catch(() => {
        renderRecovery("unavailable");
      });
    }
  }

  for (const item of triggers) {
    item.addEventListener("click", (event) => {
      if (!canEnhance) return;
      event.preventDefault();
      void openSearch(item);
    });
  }

  input.addEventListener("input", () => {
    if (!documents) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => renderResults(input.value), 150);
  });

  searchForm?.addEventListener("submit", (event) => {
    if (!shouldInterceptSiteSearchSubmit({ canEnhance, indexLoaded: Array.isArray(documents) })) return;
    event.preventDefault();
    renderResults(input.value);
  });

  dialog.addEventListener("close", () => {
    clearTimeout(debounceTimer);
    trigger?.focus();
  });

  document.addEventListener("positivus:languagechange", (event) => applyLanguage(event.detail?.language));
  applyLanguage(locale);
}
