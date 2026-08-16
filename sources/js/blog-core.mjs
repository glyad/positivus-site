const DIMENSIONS = {
  categories: ["strategy-growth", "seo", "paid-media", "content-creative", "social-media", "email-lifecycle", "analytics-optimization"],
  formats: ["guide", "how-to", "framework", "checklist", "case-analysis", "opinion", "industry-update"],
  audiences: ["leaders", "practitioners", "specialists"],
  levels: ["beginner", "intermediate", "advanced"],
  duration: ["short", "medium", "long"],
  sort: ["newest", "relevance", "oldest", "updated"]
};
const DESKTOP_FILTER_FACETS = new Set(["category", "format", "audience", "level", "author", "duration", "from", "to"]);
const TOKEN_BOUNDARY = /[^\p{L}\p{N}]+/u;
const COMBINING_MARKS = /\p{M}+/gu;

function normalize(value) {
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
  return normalize(value).split(TOKEN_BOUNDARY).filter(Boolean);
}

function timestamps(value) {
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

function allowlists(documents) {
  const records = Array.isArray(documents) ? documents : [];
  return {
    categories: records.length ? new Set(records.map((document) => document.category).filter(Boolean)) : new Set(DIMENSIONS.categories),
    formats: records.length ? new Set(records.map((document) => document.format).filter(Boolean)) : new Set(DIMENSIONS.formats),
    audiences: records.length ? new Set(records.flatMap((document) => document.audiences ?? [])) : new Set(DIMENSIONS.audiences),
    levels: records.length ? new Set(records.map((document) => document.level).filter(Boolean)) : new Set(DIMENSIONS.levels),
    authors: records.length ? new Set(records.flatMap((document) => document.authors ?? [])) : null
  };
}

function selected(params, key, allowed) {
  const unique = [...new Set(params.getAll(key).map((value) => value.trim()).filter(Boolean))];
  return allowed ? unique.filter((value) => allowed.has(value)) : unique;
}

function dateBoundary(value, end = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return "";
  return `${value}T${end ? "23:59:59.999" : "00:00:00.000"}Z`;
}

/** Parse shareable blog search state, accepting only governed facet values. */
export function parseBlogSearchState(search = "", documents) {
  const params = new URLSearchParams(String(search).replace(/^\?/u, ""));
  const allowed = allowlists(documents);
  const query = params.get("q")?.trim() ?? "";
  const requestedSort = params.get("sort") ?? "";
  const sort = DIMENSIONS.sort.includes(requestedSort) ? requestedSort : query ? "relevance" : "newest";
  const pageValue = Number.parseInt(params.get("page") ?? "1", 10);
  return {
    query,
    categories: selected(params, "category", allowed.categories),
    formats: selected(params, "format", allowed.formats),
    audiences: selected(params, "audience", allowed.audiences),
    levels: selected(params, "level", allowed.levels),
    authors: selected(params, "author", allowed.authors),
    duration: selected(params, "duration", new Set(DIMENSIONS.duration)),
    from: dateBoundary(params.get("from") ?? ""),
    to: dateBoundary(params.get("to") ?? "", true),
    sort,
    page: Number.isFinite(pageValue) ? Math.max(1, pageValue) : 1
  };
}

function intersects(values, selection) {
  return !selection.length || values.some((value) => selection.includes(value));
}

function inDuration(minutes, durations) {
  if (!durations.length) return true;
  return durations.some((duration) =>
    (duration === "short" && minutes >= 1 && minutes <= 5) ||
    (duration === "medium" && minutes >= 6 && minutes <= 10) ||
    (duration === "long" && minutes >= 11)
  );
}

function documentScore(document, query) {
  const normalized = normalize(query);
  const queryTokens = tokens(normalized);
  if (!normalized || !queryTokens.length) return 0;
  const containsAll = (value) => {
    const fieldTokens = new Set(tokens(value));
    return queryTokens.every((token) => fieldTokens.has(token));
  };
  const title = normalize(document.title);
  if (title === normalized) return 600;
  if (title.startsWith(normalized)) return 500;
  if (containsAll(document.title)) return 400;
  if ((document.keywords ?? []).some((keyword) => containsAll(keyword))) return 300;
  if (containsAll(document.summary)) return 200;
  if (containsAll(document.content)) return 100;
  return 0;
}

/** Filter public blog-index records using OR within a facet and AND across facets. */
export function filterBlogDocuments(documents, state) {
  const records = Array.isArray(documents) ? documents : [];
  return records.filter((document) => {
    if (!document || document.type && document.type !== "article") return false;
    if (state.query && !documentScore(document, state.query)) return false;
    if (state.categories.length && !state.categories.includes(document.category)) return false;
    if (state.formats.length && !state.formats.includes(document.format)) return false;
    if (!intersects(document.audiences ?? [], state.audiences)) return false;
    if (state.levels.length && !state.levels.includes(document.level)) return false;
    if (!intersects(document.authors ?? [], state.authors)) return false;
    if (!inDuration(Number(document.readingMinutes), state.duration)) return false;
    const published = timestamps(document.publishedAt);
    if (state.from && published < timestamps(state.from)) return false;
    if (state.to && published > timestamps(state.to)) return false;
    return true;
  });
}

/** Sort filtered records without relying on insertion order. */
export function sortBlogDocuments(documents, state) {
  const records = Array.isArray(documents) ? documents : [];
  const compareId = (left, right) => String(left.id ?? "").localeCompare(String(right.id ?? ""));
  return [...records].sort((left, right) => {
    if (state.sort === "relevance") {
      const score = documentScore(right, state.query) - documentScore(left, state.query);
      if (score) return score;
    }
    const dateField = state.sort === "updated" ? "editedAt" : "publishedAt";
    const direction = state.sort === "oldest" ? 1 : -1;
    const date = direction * (timestamps(left[dateField]) - timestamps(right[dateField]));
    return date || compareId(left, right);
  });
}

/** Return a bounded, numbered page of results. */
export function paginate(items, page, pageSize = 12) {
  const records = Array.isArray(items) ? items : [];
  const size = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 12;
  const pageCount = Math.max(1, Math.ceil(records.length / size));
  const requested = Number.isFinite(page) ? Math.floor(page) : 1;
  const currentPage = Math.min(pageCount, Math.max(1, requested));
  const start = (currentPage - 1) * size;
  return { items: records.slice(start, start + size), page: currentPage, pageCount, total: records.length };
}

function byPublicationDate(left, right) {
  return right.publishedAt - left.publishedAt || left.id.localeCompare(right.id);
}

/** Select related articles with editorial choices before governed automatic relationships. */
export function relatedArticleIds(article, model, limit = 3) {
  if (!article || !model) return [];
  const available = (model.publicArticles ?? []).filter((candidate) => candidate.id !== article.id);
  const selected = [];
  const add = (candidate) => {
    if (candidate && !selected.some((entry) => entry.id === candidate.id) && selected.length < limit) selected.push(candidate);
  };
  for (const id of article.relatedArticles ?? []) add(available.find((candidate) => candidate.id === id));
  if (article.series) {
    const series = model.byId?.series?.get(article.series);
    for (const id of series?.articleIds ?? []) add(available.find((candidate) => candidate.id === id));
  }
  const automatic = (predicate) => available.filter(predicate).sort(byPublicationDate).forEach(add);
  automatic((candidate) => candidate.primaryCategory === article.primaryCategory && candidate.tags.some((tag) => article.tags.includes(tag)));
  automatic((candidate) => candidate.level === article.level && candidate.audiences.some((audience) => article.audiences.includes(audience)));
  return selected.map((candidate) => candidate.id);
}

/** Filter localized author records by a text query and one governed expertise value. */
export function filterAuthors(authors, { query = "", expertise = "" } = {}) {
  const records = Array.isArray(authors) ? authors : [];
  const queryTokens = tokens(query);
  const governed = new Set(records.flatMap((author) => author.expertise ?? []));
  if (expertise && !governed.has(expertise)) return [];
  return records.filter((author) => {
    if (expertise && !author.expertise?.includes(expertise)) return false;
    const haystack = Object.values(author.locales ?? {}).flatMap((locale) => [locale.name, locale.bio]).join(" ");
    const authorTokens = new Set(tokens(haystack));
    return queryTokens.every((token) => authorTokens.has(token));
  });
}

/** Describe the focus action for a keyboard event in the mobile filter drawer. */
export function drawerFocusAction({ key, index, count, shiftKey = false }) {
  if (key === "Escape") return "close";
  if (key !== "Tab" || count < 1) return "none";
  if (shiftKey && index === 0) return "last";
  if (!shiftKey && index === count - 1) return "first";
  return "none";
}

/** Keep desktop updates scoped to intentional Blog filter changes. */
export function shouldApplyDesktopFilterChange({ type, facet }) {
  return type === "change" && DESKTOP_FILTER_FACETS.has(facet);
}

/** Supply a localized, action-oriented empty-result state without saved search data. */
export function noResultsRecovery(locale) {
  return locale === "he"
    ? { message: "לא נמצאו מאמרים תואמים. נקו מסננים כדי לעיין בכל התובנות.", action: "ניקוי מסננים" }
    : { message: "No matching articles. Clear filters to browse every insight.", action: "Clear filters" };
}

export function scoreBlogDocument(document, query) {
  return documentScore(document, query);
}
