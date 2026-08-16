const RESULT_TYPES = ["page", "service", "case-study", "article", "author"];
const TOKEN_BOUNDARY = /[^\p{L}\p{N}]+/u;
const COMBINING_MARKS = /\p{M}+/gu;
const RECOVERY_COPY = {
  en: {
    noResults: "No matching results. Check your spelling, explore related topics or our services, or visit the Blog.",
    unavailable: "Search is unavailable right now. Use the links below to continue.",
    fallback: "Search page", topics: "Related topics", services: "Services", blog: "Blog"
  },
  he: {
    noResults: "לא נמצאו תוצאות תואמות. בדקו את האיות, הכירו נושאים קשורים או את השירותים שלנו, או עברו לבלוג.",
    unavailable: "החיפוש אינו זמין כרגע. אפשר להשתמש בקישורים שלמטה כדי להמשיך.",
    fallback: "דף החיפוש", topics: "נושאים קשורים", services: "שירותים", blog: "בלוג"
  }
};

/** Normalize text for locale-independent Latin and Hebrew search comparisons. */
export function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/gu, " ");
}

function tokens(value) {
  return normalizeSearchText(value).split(TOKEN_BOUNDARY).filter(Boolean);
}

function includesAllTokens(value, queryTokens) {
  const searchableTokens = new Set(tokens(value));
  return queryTokens.every((token) => searchableTokens.has(token));
}

function scoreDocument(document, normalizedQuery, queryTokens) {
  const title = normalizeSearchText(document.title);
  if (title === normalizedQuery) return 600;
  if (title.startsWith(normalizedQuery)) return 500;
  if (includesAllTokens(document.title, queryTokens)) return 400;
  if (Array.isArray(document.keywords) && document.keywords.some((keyword) => includesAllTokens(keyword, queryTokens))) return 300;
  if (includesAllTokens(document.summary, queryTokens)) return 200;
  if (includesAllTokens(document.content, queryTokens)) return 100;
  return 0;
}

/** Search public, locale-specific site documents with deterministic field precedence. */
export function searchSiteDocuments(documents, query, { limit = 12 } = {}) {
  const records = Array.isArray(documents) ? documents : [];
  const normalizedQuery = normalizeSearchText(query);
  const cappedLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 12;

  if (!normalizedQuery) {
    return records
      .filter((document) => document?.featured === true)
      .slice(0, cappedLimit)
      .map((document) => ({ ...document, score: 0 }));
  }

  const queryTokens = tokens(normalizedQuery);
  return records
    .filter((document) => document && typeof document === "object")
    .map((document) => ({ ...document, score: scoreDocument(document, normalizedQuery, queryTokens) }))
    .filter((document) => document.score > 0)
    .sort((left, right) => right.score - left.score || String(left.id ?? "").localeCompare(String(right.id ?? "")))
    .slice(0, cappedLimit);
}

/** Group sorted site-search results in the stable shared-navigation order. */
export function groupSiteResults(results) {
  const groups = new Map();
  for (const type of RESULT_TYPES) {
    const entries = (Array.isArray(results) ? results : []).filter((result) => result?.type === type);
    if (entries.length) groups.set(type, entries);
  }
  return groups;
}

/** Return localized, route-backed recovery guidance without using query history. */
export function siteSearchRecoveryGuidance(locale, routes = {}) {
  const text = RECOVERY_COPY[locale === "he" ? "he" : "en"];
  const action = (id, label) => ({ id, label, href: String(routes[id] ?? "") });
  return {
    noResults: {
      message: text.noResults,
      actions: [action("topics", text.topics), action("services", text.services), action("blog", text.blog)]
    },
    unavailable: {
      message: text.unavailable,
      actions: [action("fallback", text.fallback), action("topics", text.topics), action("services", text.services), action("blog", text.blog)]
    }
  };
}

/** Keep static form submission available until progressive data is loaded. */
export function shouldInterceptSiteSearchSubmit({ canEnhance, indexLoaded }) {
  return canEnhance === true && indexLoaded === true;
}
