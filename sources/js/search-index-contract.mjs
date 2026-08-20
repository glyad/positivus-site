export const SEARCH_INDEX_SCHEMA_VERSION = 1;

const KINDS = new Set(["global-search", "blog-search"]);
const GLOBAL_TYPES = new Set(["page", "service", "case-study", "article", "author"]);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const SAFE_SEGMENT = /^[A-Za-z0-9_-]+$/u;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u;

function fail(message) {
  throw new TypeError(`Invalid search index: ${message}`);
}

function requireText(value, field) {
  if (typeof value !== "string" || !value.trim() || value !== value.trim() || /[\u0000-\u001F\u007F]/u.test(value)) {
    fail(`${field} must be a non-empty safe string`);
  }
}

function requireId(value, field) {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) fail(`${field} must be a kebab-case ID`);
}

function requireTextArray(value, field, { allowEmpty = true, ids = false } = {}) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) fail(`${field} must be an array`);
  value.forEach((entry, index) => ids ? requireId(entry, `${field}[${index}]`) : requireText(entry, `${field}[${index}]`));
}

function requirePerson(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${field} must be a person record`);
  requireId(value.id, `${field}.id`);
  requireText(value.name, `${field}.name`);
}

function requireDate(value, field) {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value) || Number.isNaN(new Date(value).valueOf())) {
    fail(`${field} must be an ISO UTC date-time`);
  }
}

export function isSafeLocalSearchRoute(value, { kind, locale, type } = {}) {
  if (typeof value !== "string" || !value || value !== value.trim() ||
      /[\\?%\u0000-\u001F\u007F]/u.test(value) || value.startsWith("/") || value.startsWith("//")) return false;
  const parts = value.split("#");
  if (parts.length > 2 || (parts[1] !== undefined && !/^[A-Za-z][A-Za-z0-9_-]*$/u.test(parts[1]))) return false;
  const path = parts[0];
  const segments = path.split("/");
  if (segments.some((segment) => segment === "." || segment === ".." || !segment)) return false;
  const safePage = path === "index.html" ||
    (segments.at(-1) === "index.html" && segments.slice(0, -1).every((segment) => SAFE_SEGMENT.test(segment))) ||
    (segments.length === 1 && /^[A-Za-z0-9][A-Za-z0-9_.-]*\.html$/u.test(path));
  if (!safePage) return false;
  if (kind === "blog-search" || ["article", "author"].includes(type)) {
    const prefix = locale === "he" ? "he/blog/" : "blog/";
    if (!path.startsWith(prefix)) return false;
  }
  return true;
}

function validateGlobalRecord(record, index, locale) {
  const field = `records[${index}]`;
  if (!record || typeof record !== "object" || Array.isArray(record)) fail(`${field} must be an object`);
  requireId(record.id, `${field}.id`);
  if (!GLOBAL_TYPES.has(record.type)) fail(`${field}.type is unsupported`);
  if (record.locale !== locale) fail(`${field}.locale must match the envelope locale`);
  requireText(record.title, `${field}.title`);
  requireText(record.summary, `${field}.summary`);
  if (!isSafeLocalSearchRoute(record.href, { kind: "global-search", locale, type: record.type })) {
    fail(`${field}.href must be a safe local route`);
  }
  requireTextArray(record.keywords, `${field}.keywords`);
  if (record.featured !== undefined && typeof record.featured !== "boolean") fail(`${field}.featured must be boolean`);
  if (record.groupOrder !== undefined && !Number.isFinite(record.groupOrder)) fail(`${field}.groupOrder must be finite`);
}

function validateBlogRecord(record, index, locale) {
  validateGlobalRecord(record, index, locale);
  const field = `records[${index}]`;
  if (record.type !== "article") fail(`${field}.type must be article`);
  requireText(record.content, `${field}.content`);
  requireId(record.category, `${field}.category`);
  requireTextArray(record.tags, `${field}.tags`, { ids: true });
  requireTextArray(record.audiences, `${field}.audiences`, { allowEmpty: false, ids: true });
  requireId(record.level, `${field}.level`);
  requireId(record.format, `${field}.format`);
  requireTextArray(record.authors, `${field}.authors`, { allowEmpty: false, ids: true });
  requirePerson(record.primaryAuthor, `${field}.primaryAuthor`);
  if (!Array.isArray(record.coAuthors)) fail(`${field}.coAuthors must be an array`);
  record.coAuthors.forEach((person, personIndex) => requirePerson(person, `${field}.coAuthors[${personIndex}]`));
  requireText(record.categoryLabel, `${field}.categoryLabel`);
  requireText(record.levelLabel, `${field}.levelLabel`);
  requireText(record.formatLabel, `${field}.formatLabel`);
  if (!Number.isInteger(record.readingMinutes) || record.readingMinutes < 1) fail(`${field}.readingMinutes must be a positive integer`);
  requireDate(record.publishedAt, `${field}.publishedAt`);
  requireDate(record.editedAt, `${field}.editedAt`);
}

export function validateSearchIndexEnvelope(payload, { kind, locale } = {}) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) fail("payload must be an envelope object");
  if (payload.schemaVersion !== SEARCH_INDEX_SCHEMA_VERSION) fail(`schema version must be ${SEARCH_INDEX_SCHEMA_VERSION}`);
  if (!KINDS.has(payload.kind) || (kind && payload.kind !== kind)) fail("kind is incompatible");
  if (!["en", "he"].includes(payload.locale) || (locale && payload.locale !== locale)) fail("locale is incompatible");
  if (!Array.isArray(payload.records)) fail("records must be an array");
  const ids = new Set();
  payload.records.forEach((record, index) => {
    if (payload.kind === "blog-search") validateBlogRecord(record, index, payload.locale);
    else validateGlobalRecord(record, index, payload.locale);
    const key = `${record.type}:${record.id}`;
    if (ids.has(key)) fail(`records[${index}] duplicates ${key}`);
    ids.add(key);
  });
  return payload.records;
}

export function createSearchIndexEnvelope({ kind, locale, records }) {
  const envelope = { schemaVersion: SEARCH_INDEX_SCHEMA_VERSION, kind, locale, records };
  validateSearchIndexEnvelope(envelope, { kind, locale });
  return envelope;
}
