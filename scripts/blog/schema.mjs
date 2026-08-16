const LOCALES = ["en", "he"];
const STATUSES = new Set(["draft", "scheduled", "published", "preview", "archived"]);
const LEVELS = new Set(["beginner", "intermediate", "advanced"]);
const FORMATS = new Set([
  "guide",
  "how-to",
  "framework",
  "checklist",
  "case-analysis",
  "opinion",
  "industry-update"
]);
const AUDIENCES = new Set(["leaders", "practitioners", "specialists"]);
const EXPERTISE_DIMENSIONS = new Set([
  "strategy", "analytics", "content", "social", "paid-media", "email", "lifecycle"
]);
const BLOCK_TYPES = new Set([
  "introduction",
  "keyTakeaways",
  "richText",
  "figure",
  "quote",
  "stat",
  "checklist",
  "steps",
  "table",
  "media",
  "download",
  "citations",
  "callout",
  "faq",
  "consultation"
]);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const wordsIn = (value) => (typeof value === "string" ? value.trim().match(/\S+/gu)?.length ?? 0 : 0);

function textInBlock(block) {
  if (!isObject(block)) return 0;

  let words = 0;
  for (const [key, value] of Object.entries(block)) {
    if (["type", "src", "href", "url", "id", "serviceId"].includes(key)) continue;
    if (typeof value === "string") words += wordsIn(value);
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === "string") words += wordsIn(entry);
        else if (isObject(entry)) words += textInBlock(entry);
      }
    }
  }
  return words;
}

/** Calculate a minimum-one-minute reading estimate from structured visible text. */
export function calculateReadingMinutes(blocks, wordsPerMinute = 220) {
  if (!Array.isArray(blocks) || !Number.isFinite(wordsPerMinute) || wordsPerMinute <= 0) return 1;
  const words = blocks.reduce((total, block) => total + textInBlock(block), 0);
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function createErrorCollector() {
  const errors = [];
  return {
    errors,
    add(id, locale, field, message) {
      errors.push(new Error(`[${id ?? "unknown"}] [${locale ?? "record"}] ${field}: ${message}`));
    }
  };
}

function isSafeAssetPath(value) {
  if (typeof value !== "string") return false;
  const segments = value.split("/");
  return segments.length > 1 &&
    segments[0] === "assets" &&
    segments.every((segment, index) => index === 0 ||
      (segment !== "." && segment !== ".." && /^[A-Za-z0-9_.-]+$/u.test(segment)));
}

function isSafeLink(value) {
  if (typeof value !== "string" || !value.trim() || /[\u0000-\u001F\u007F]/u.test(value)) return false;
  const link = value.trim();
  if (link.startsWith("//")) return false;
  try {
    const target = new URL(link, "https://content.invalid/");
    return ["https:", "http:", "mailto:"].includes(target.protocol) && !target.username && !target.password;
  } catch {
    return false;
  }
}

function isCanonicalHttpsLink(value) {
  if (typeof value !== "string" || !value.trim() || value.trim() !== value || /[\u0000-\u001F\u007F]/u.test(value)) return false;
  try {
    const link = new URL(value);
    return link.protocol === "https:" && !link.username && !link.password && link.href === value;
  } catch {
    return false;
  }
}

function validateProfessionalLinks(author, collector) {
  if (author.professionalLinks === undefined) return;
  if (!Array.isArray(author.professionalLinks)) {
    collector.add(author.id, "record", "professionalLinks", "must be an array of professional links");
    return;
  }

  author.professionalLinks.forEach((link, index) => {
    const field = `professionalLinks[${index}]`;
    if (!isObject(link)) {
      collector.add(author.id, "record", field, "must be an object");
      return;
    }

    if (typeof link.label === "string") {
      if (!link.label.trim()) collector.add(author.id, "record", `${field}.label`, "must be a non-empty string");
    } else if (isObject(link.label)) {
      for (const locale of author.availableLocales) {
        if (typeof link.label[locale] !== "string" || !link.label[locale].trim()) {
          collector.add(author.id, locale, `${field}.label.${locale}`, "must be a non-empty string");
        }
      }
      for (const locale of Object.keys(link.label)) {
        if (!LOCALES.includes(locale)) collector.add(author.id, locale, `${field}.label`, "uses an unsupported locale");
      }
    } else {
      collector.add(author.id, "record", `${field}.label`, "must be a non-empty string or localized object");
    }

    if (!isCanonicalHttpsLink(link.href)) {
      collector.add(author.id, "record", `${field}.href`, "must be a canonical HTTPS link without credentials or control characters");
    }
  });
}

function validateAuthorExpertise(author, indexes, collector) {
  if (!Array.isArray(author.expertise) || author.expertise.length === 0) {
    collector.add(author.id, "record", "expertise", "must be a non-empty array of governed or dimension IDs");
    return;
  }
  author.expertise.forEach((expertise, index) => {
    if (typeof expertise !== "string" || !expertise.trim() ||
        (!indexes.category.has(expertise) && !indexes.tag.has(expertise) && !EXPERTISE_DIMENSIONS.has(expertise))) {
      collector.add(author.id, "record", `expertise[${index}]`, "must be a non-empty governed or dimension ID");
    }
  });
}

function validateLinkFields(value, id, locale, field, collector) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validateLinkFields(entry, id, locale, `${field}[${index}]`, collector));
    return;
  }
  if (!isObject(value)) return;
  for (const [key, entry] of Object.entries(value)) {
    const entryField = `${field}.${key}`;
    if (["href", "url", "link"].includes(key) && typeof entry === "string" && !isSafeLink(entry)) {
      collector.add(id, locale, entryField, "must be a safe link");
    }
    validateLinkFields(entry, id, locale, entryField, collector);
  }
}

function validateId(record, type, collector) {
  if (!isObject(record)) {
    collector.add(type, "record", "record", "must be an object");
    return null;
  }
  if (typeof record.id !== "string" || !ID_PATTERN.test(record.id)) {
    collector.add(record.id ?? type, "record", "id", "must be a lowercase kebab-case identifier");
    return null;
  }
  return record.id;
}

function validateLocales(record, id, collector, requiredFields) {
  const locales = isObject(record.locales) ? record.locales : null;
  if (!locales) {
    collector.add(id, "record", "locales", "must be an object");
    return [];
  }

  const available = [];
  for (const [locale, content] of Object.entries(locales)) {
    if (!LOCALES.includes(locale)) {
      collector.add(id, locale, "locales", "uses an unsupported locale");
      continue;
    }
    if (!isObject(content)) {
      collector.add(id, locale, "locales", "must be an object");
      continue;
    }
    available.push(locale);
    for (const field of requiredFields) {
      const value = content[field];
      if (field === "blocks") {
        if (!Array.isArray(value) || value.length === 0) collector.add(id, locale, field, "must be a non-empty array");
      } else if (field === "slug") {
        if (typeof value !== "string" || !ID_PATTERN.test(value)) collector.add(id, locale, field, "must be a lowercase kebab-case route slug");
      } else if (field === "credentials") {
        if (!Array.isArray(value) || value.length === 0 || value.some((credential) => typeof credential !== "string" || !credential.trim())) {
          collector.add(id, locale, field, "must be a non-empty array of non-empty strings");
        }
      } else if (typeof value !== "string" || !value.trim()) {
        collector.add(id, locale, field, "must be a non-empty string");
      }
    }
  }
  if (available.length === 0) collector.add(id, "record", "locales", "must include at least one supported locale");
  return available;
}

function validateLocalizedSlugs(records, type, collector) {
  for (const locale of LOCALES) {
    const slugs = new Map();
    for (const record of records) {
      const slug = record?.locales?.[locale]?.slug;
      if (slug === undefined) continue;
      if (typeof slug !== "string" || !slug.trim()) continue;
      const owner = slugs.get(slug);
      if (owner) collector.add(record.id, locale, "slug", `duplicates ${type} slug used by ${owner}`);
      else slugs.set(slug, record.id);
    }
  }
}

function isInternalRoute(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") &&
    !value.includes("\\") && !value.split("/").includes("..");
}

function isSafeSiteBasePath(value) {
  return typeof value === "string" &&
    /^\/(?:[A-Za-z0-9_-]+\/)*$/u.test(value) &&
    !value.includes("%") &&
    !/[\u0000-\u001F\u007F\\?#]/u.test(value);
}

function validateSettingsLocation(settings, id, collector) {
  const basePath = settings.basePath;
  const hasSafeBasePath = isSafeSiteBasePath(basePath);
  if (!hasSafeBasePath) {
    collector.add(id, "record", "settings.basePath", "must be a safe absolute base path ending in a slash");
  }

  if (typeof settings.siteOrigin !== "string") {
    collector.add(id, "record", "settings.siteOrigin", "must be a canonical HTTPS site origin");
    return;
  }

  let siteUrl;
  try {
    siteUrl = new URL(settings.siteOrigin);
  } catch {
    collector.add(id, "record", "settings.siteOrigin", "must be a canonical HTTPS site origin");
    return;
  }

  const expectedSiteOrigin = hasSafeBasePath
    ? `${siteUrl.origin}${basePath === "/" ? "" : basePath.slice(0, -1)}`
    : null;
  if (siteUrl.protocol !== "https:" || siteUrl.username || siteUrl.password ||
      siteUrl.search || siteUrl.hash || siteUrl.pathname.includes("%") ||
      !hasSafeBasePath || settings.siteOrigin !== expectedSiteOrigin) {
    collector.add(id, "record", "settings.siteOrigin", "must be a canonical HTTPS site origin matching basePath");
  }
}

function validateArchivedResolution(article, collector) {
  const { id, redirect, withdrawal } = article;
  if (redirect !== undefined && withdrawal !== undefined) {
    collector.add(id, "record", "redirect", "archived articles may define either a redirect or a withdrawal, not both");
    return;
  }
  if (redirect !== undefined) {
    if (!isObject(redirect)) {
      collector.add(id, "record", "redirect", "must be a documented redirect object");
      return;
    }
    if (!LOCALES.includes(redirect.locale)) collector.add(id, "record", "redirect.locale", "must be a supported locale");
    if (!isInternalRoute(redirect.oldPath)) collector.add(id, "record", "redirect.oldPath", "must be a safe absolute site path");
    if (!isInternalRoute(redirect.replacementPath)) collector.add(id, "record", "redirect.replacementPath", "must be a safe absolute site path");
    if (![301, 302, 307, 308].includes(redirect.statusCode)) collector.add(id, "record", "redirect.statusCode", "must be a supported redirect status code");
    if (typeof redirect.reason !== "string" || !redirect.reason.trim()) collector.add(id, "record", "redirect.reason", "must document the redirect reason");
    return;
  }
  if (withdrawal !== undefined) {
    if (!isObject(withdrawal)) {
      collector.add(id, "record", "withdrawal", "must be a documented withdrawal object");
      return;
    }
    if (!LOCALES.includes(withdrawal.locale)) collector.add(id, "record", "withdrawal.locale", "must be a supported locale");
    if (![404, 410].includes(withdrawal.statusCode)) collector.add(id, "record", "withdrawal.statusCode", "must be a withdrawal response status code");
    if (typeof withdrawal.reason !== "string" || !withdrawal.reason.trim()) collector.add(id, "record", "withdrawal.reason", "must document the withdrawal reason");
    return;
  }
  collector.add(id, "record", "withdrawal", "archived articles require a redirect or documented withdrawal response");
}

function parseDate(value, id, field, collector) {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) {
    collector.add(id, "record", field, "must be an ISO UTC date-time");
    return null;
  }
  const date = new Date(value);
  const normalizedInput = value.replace(".000Z", "Z");
  const normalizedDate = Number.isNaN(date.valueOf()) ? null : date.toISOString().replace(".000Z", "Z");
  if (normalizedDate !== normalizedInput) {
    collector.add(id, "record", field, "must be a valid date");
    return null;
  }
  return date;
}

function validateHero(hero, id, locales, collector) {
  if (!isObject(hero)) {
    collector.add(id, "record", "hero", "must be an object");
    return;
  }
  if (!isSafeAssetPath(hero.src)) collector.add(id, "record", "hero.src", "must be a safe local asset path");
  if (hero.decorative === true) return;
  if (!isObject(hero.alt)) {
    for (const locale of locales) collector.add(id, locale, "hero.alt", "must be a localized non-empty string or hero must be decorative");
    return;
  }
  for (const locale of locales) {
    if (typeof hero.alt[locale] !== "string" || !hero.alt[locale].trim()) {
      collector.add(id, locale, "hero.alt", "must be a non-empty string or hero must be decorative");
    }
  }
}

function validateBlock(block, id, locale, index, collector) {
  const field = `blocks[${index}]`;
  if (!isObject(block)) {
    collector.add(id, locale, field, "must be an object");
    return;
  }
  if (!BLOCK_TYPES.has(block.type)) collector.add(id, locale, `${field}.type`, "is not a supported block type");
  for (const assetKey of ["src", "image", "thumbnail"]) {
    if (assetKey in block && !isSafeAssetPath(block[assetKey])) {
      collector.add(id, locale, `${field}.${assetKey}`, "must be a safe local asset path");
    }
  }
  if (["figure", "media"].includes(block.type) && block.decorative !== true &&
      (typeof block.alt !== "string" || !block.alt.trim())) {
    collector.add(id, locale, `${field}.alt`, "must be a non-empty string or media must be decorative");
  }
  validateLinkFields(block, id, locale, field, collector);
}

function indexRecords(records, type, collector) {
  if (!Array.isArray(records)) {
    collector.add(type, "record", type, "must be an array");
    return new Map();
  }
  const index = new Map();
  for (const record of records) {
    const id = validateId(record, type, collector);
    if (!id) continue;
    if (index.has(id)) collector.add(id, "record", "id", `duplicates an existing ${type} ID`);
    else index.set(id, record);
  }
  return index;
}

function validateCollectionRecords(raw, indexes, collector) {
  for (const category of indexes.category.values()) {
    const locales = validateLocales(category, category.id, collector, ["name", "slug", "description"]);
    if (!Number.isInteger(category.order) || category.order < 1) collector.add(category.id, "record", "order", "must be a positive integer");
    if (category.artwork && !isSafeAssetPath(category.artwork)) collector.add(category.id, "record", "artwork", "must be a safe local asset path");
    category.availableLocales = locales;
  }
  for (const tag of indexes.tag.values()) {
    tag.availableLocales = validateLocales(tag, tag.id, collector, ["name", "slug"]);
    if (tag.status !== undefined && !["active", "retired"].includes(tag.status)) collector.add(tag.id, "record", "status", "must be active or retired");
  }
  for (const tag of indexes.tag.values()) {
    if (tag.status !== "retired") continue;
    const seen = new Set([tag.id]);
    let current = tag;
    while (current.status === "retired") {
      const replacementId = current.replacementTag;
      const replacement = indexes.tag.get(replacementId);
      if (typeof replacementId !== "string" || !replacement || seen.has(replacementId)) {
        collector.add(tag.id, "record", "replacementTag", "must resolve to an active replacement tag without a cycle");
        break;
      }
      seen.add(replacementId);
      current = replacement;
    }
    if (current.status !== undefined && current.status !== "active" && current.status !== "retired") {
      collector.add(tag.id, "record", "replacementTag", "must resolve to an active replacement tag without a cycle");
    }
  }
  for (const author of indexes.author.values()) {
    author.availableLocales = validateLocales(author, author.id, collector, ["name", "slug", "role", "bio", "credentials"]);
    if (!isSafeAssetPath(author.portrait)) collector.add(author.id, "record", "portrait", "must be a safe local asset path");
    validateAuthorExpertise(author, indexes, collector);
    validateProfessionalLinks(author, collector);
  }
  for (const series of indexes.series.values()) {
    series.availableLocales = validateLocales(series, series.id, collector, ["title", "slug", "description"]);
    if (series.artwork && !isSafeAssetPath(series.artwork)) collector.add(series.id, "record", "artwork", "must be a safe local asset path");
    if (!Array.isArray(series.articleIds) || series.articleIds.length === 0) {
      collector.add(series.id, "record", "articleIds", "must be a non-empty array of valid unique article IDs");
    } else {
      if (new Set(series.articleIds).size !== series.articleIds.length) collector.add(series.id, "record", "articleIds", "must not contain duplicate article IDs");
      series.articleIds.forEach((articleId, index) => {
        if (typeof articleId !== "string" || !indexes.article.has(articleId)) {
          collector.add(series.id, "record", `articleIds[${index}]`, "must reference a valid article ID");
        }
      });
    }
    if (!Array.isArray(series.audiences) || series.audiences.length === 0) {
      collector.add(series.id, "record", "audiences", "must be a non-empty array of supported audiences");
    } else {
      if (new Set(series.audiences).size !== series.audiences.length) collector.add(series.id, "record", "audiences", "must not contain duplicate audiences");
      series.audiences.forEach((audience, index) => {
        if (!AUDIENCES.has(audience)) collector.add(series.id, "record", `audiences[${index}]`, "must be a supported audience");
      });
    }
    if (!LEVELS.has(series.level)) collector.add(series.id, "record", "level", "must be a supported level");
  }

  validateLocalizedSlugs([...indexes.category.values()], "category", collector);
  validateLocalizedSlugs([...indexes.tag.values()], "tag", collector);
  validateLocalizedSlugs([...indexes.author.values()], "author", collector);
  validateLocalizedSlugs([...indexes.series.values()], "series", collector);
}

function validateSeriesMembership(indexes, collector) {
  for (const series of indexes.series.values()) {
    if (!Array.isArray(series.articleIds)) continue;
    series.articleIds.forEach((articleId, index) => {
      const article = indexes.article.get(articleId);
      if (article && article.series !== series.id) {
        collector.add(series.id, "record", `articleIds[${index}]`, `article ${articleId} must reference this series`);
      }
    });
  }

  for (const article of indexes.article.values()) {
    if (typeof article.series !== "string") continue;
    const series = indexes.series.get(article.series);
    if (!series) continue;
    const entries = Array.isArray(series.articleIds) ? series.articleIds : [];
    if (entries.filter((articleId) => articleId === article.id).length !== 1) {
      collector.add(article.id, "record", "series", `must be listed exactly once in series ${article.series}`);
    }
  }
}

function validateArticleLocaleRelationships(article, locales, indexes, collector) {
  const availableInLocale = (record, locale) => record?.availableLocales?.includes(locale);
  const requireLocale = (locale, field, record, type) => {
    if (record && !availableInLocale(record, locale)) {
      collector.add(article.id, locale, field, `must reference a ${type} available in the article locale`);
    }
  };

  for (const locale of locales) {
    requireLocale(locale, "primaryCategory", indexes.category.get(article.primaryCategory), "category");
    if (Array.isArray(article.tags)) {
      article.tags.forEach((tagId, index) => requireLocale(locale, `tags[${index}]`, indexes.tag.get(tagId), "tag"));
    }
    requireLocale(locale, "primaryAuthor", indexes.author.get(article.primaryAuthor), "author");
    if (Array.isArray(article.coAuthors)) {
      article.coAuthors.forEach((authorId, index) => requireLocale(locale, `coAuthors[${index}]`, indexes.author.get(authorId), "author"));
    }
    if (typeof article.reviewer === "string") requireLocale(locale, "reviewer", indexes.author.get(article.reviewer), "author");
    if (typeof article.series === "string") requireLocale(locale, "series", indexes.series.get(article.series), "series");
  }
}

function validateArticle(article, indexes, collector) {
  const id = article.id;
  const locales = validateLocales(article, id, collector, ["slug", "title", "summary", "blocks"]);
  article.availableLocales = locales.sort((a, b) => LOCALES.indexOf(a) - LOCALES.indexOf(b));

  if (!STATUSES.has(article.status)) collector.add(id, "record", "status", "must be a supported publication status");
  if (!indexes.category.has(article.primaryCategory)) collector.add(id, "record", "primaryCategory", "must reference a valid category");
  if (!Array.isArray(article.tags)) collector.add(id, "record", "tags", "must be an array");
  else {
    if (article.tags.length > 5) collector.add(id, "record", "tags", "must contain no more than five tags");
    if (new Set(article.tags).size !== article.tags.length) collector.add(id, "record", "tags", "must not contain duplicate tags");
    for (const tag of article.tags) if (!indexes.tag.has(tag)) collector.add(id, "record", "tags", `references unknown tag ${tag}`);
  }
  if (!Array.isArray(article.audiences) || article.audiences.length === 0) collector.add(id, "record", "audiences", "must be a non-empty array");
  else {
    if (new Set(article.audiences).size !== article.audiences.length) collector.add(id, "record", "audiences", "must not contain duplicates");
    for (const audience of article.audiences) if (!AUDIENCES.has(audience)) collector.add(id, "record", "audiences", `uses unsupported audience ${audience}`);
  }
  if (!LEVELS.has(article.level)) collector.add(id, "record", "level", "must be a supported level");
  if (!FORMATS.has(article.format)) collector.add(id, "record", "format", "must be a supported format");
  if (!indexes.author.has(article.primaryAuthor)) collector.add(id, "record", "primaryAuthor", "must reference a valid author");
  for (const field of ["coAuthors", "reviewer"]) {
    const people = field === "reviewer" && article[field] ? [article[field]] : article[field] ?? [];
    if (!Array.isArray(people)) collector.add(id, "record", field, "must be an author ID or array of author IDs");
    else for (const authorId of people) if (!indexes.author.has(authorId)) collector.add(id, "record", field, `references unknown author ${authorId}`);
  }
  if (article.series !== undefined && !indexes.series.has(article.series)) collector.add(id, "record", "series", "must reference a valid series");
  if (article.relatedArticles !== undefined && !Array.isArray(article.relatedArticles)) {
    collector.add(id, "record", "relatedArticles", "must be an array of article IDs");
  } else {
    for (const relatedId of article.relatedArticles ?? []) {
      if (!indexes.article.has(relatedId)) collector.add(id, "record", "relatedArticles", `references unknown article ${relatedId}`);
    }
  }
  if (article.relatedService && typeof article.relatedService !== "string") collector.add(id, "record", "relatedService", "must be a service ID string");

  validateArticleLocaleRelationships(article, locales, indexes, collector);

  const publishedAt = parseDate(article.publishedAt, id, "publishedAt", collector);
  const editedAt = parseDate(article.editedAt, id, "editedAt", collector);
  if (publishedAt && editedAt && editedAt < publishedAt) collector.add(id, "record", "editedAt", "must not precede publishedAt");
  article.publishedAt = publishedAt;
  article.editedAt = editedAt;
  if (article.status === "archived") validateArchivedResolution(article, collector);

  validateHero(article.hero, id, locales, collector);
  for (const locale of locales) {
    const blocks = article.locales[locale].blocks;
    if (Array.isArray(blocks)) blocks.forEach((block, index) => validateBlock(block, id, locale, index, collector));
  }
  article.readingMinutes = Object.fromEntries(locales.map((locale) => {
    const override = isObject(article.readingMinutesOverride)
      ? article.readingMinutesOverride[locale]
      : article.readingMinutesOverride;
    const minutes = Number.isInteger(override) && override > 0
      ? override
      : calculateReadingMinutes(article.locales[locale].blocks);
    article.locales[locale].readingMinutes = minutes;
    return [locale, minutes];
  }));
}

/**
 * Normalize and validate CMS-neutral blog records for a deterministic static build.
 * Invalid source content is rejected as one AggregateError so editorial teams can
 * correct all record problems in a single pass.
 */
export function createBlogModel(raw, { now = new Date() } = {}) {
  const collector = createErrorCollector();
  if (!isObject(raw)) {
    throw new AggregateError([new Error("[blog] [record] raw: must be an object")], "Invalid blog content");
  }
  // Parsing dates and adding derived fields must not change the adapter's raw
  // source; callers may reuse it for another deterministic build.
  const content = structuredClone(raw);
  if (!isObject(content.settings)) collector.add("blog", "record", "settings", "must be an object");
  else {
    if (typeof content.settings.id !== "string" || !ID_PATTERN.test(content.settings.id)) {
      collector.add(content.settings.id ?? "blog", "record", "settings.id", "must be a lowercase kebab-case identifier");
    }
    validateLocales(content.settings, content.settings.id ?? "blog", collector, ["title", "summary"]);
    validateSettingsLocation(content.settings, content.settings.id ?? "blog", collector);
  }

  const indexes = {
    category: indexRecords(content.categories, "category", collector),
    tag: indexRecords(content.tags, "tag", collector),
    author: indexRecords(content.authors, "author", collector),
    series: indexRecords(content.series, "series", collector),
    article: indexRecords(content.articles, "article", collector)
  };
  validateCollectionRecords(content, indexes, collector);
  validateSeriesMembership(indexes, collector);
  for (const article of indexes.article.values()) validateArticle(article, indexes, collector);
  validateLocalizedSlugs([...indexes.article.values()], "article", collector);

  if (collector.errors.length) {
    throw new AggregateError(collector.errors, `Invalid blog content: ${collector.errors.map((error) => error.message).join("; ")}`);
  }

  const buildTime = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(buildTime.valueOf())) throw new TypeError("now must be a valid date");
  const articles = [...indexes.article.values()];
  return {
    settings: content.settings,
    categories: [...indexes.category.values()].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)),
    tags: [...indexes.tag.values()],
    authors: [...indexes.author.values()],
    series: [...indexes.series.values()],
    articles,
    publicArticles: articles.filter((article) => article.status === "published" && article.publishedAt <= buildTime),
    byId: indexes
  };
}
