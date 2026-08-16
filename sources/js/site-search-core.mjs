const RESULT_TYPES = ["page", "service", "case-study", "article", "author"];
const TOKEN_BOUNDARY = /[^\p{L}\p{N}]+/u;
const COMBINING_MARKS = /\p{M}+/gu;

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
