import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { blogRoute } from "./routes.mjs";
import { createSearchIndexEnvelope } from "../../sources/js/search-index-contract.mjs";

const LOCALES = ["en", "he"];
const localized = (record, locale) => record?.locales?.[locale] ?? null;
const dimensionLabels = {
  en: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", guide: "Guide", "how-to": "How-to", framework: "Framework", checklist: "Checklist", "case-analysis": "Case analysis", opinion: "Opinion", "industry-update": "Industry update" },
  he: { beginner: "מתחילים", intermediate: "בינוניים", advanced: "מתקדמים", guide: "מדריך", "how-to": "איך עושים", framework: "מסגרת", checklist: "רשימת בדיקה", "case-analysis": "ניתוח מקרה", opinion: "דעה", "industry-update": "עדכון ענפי" }
};

function stripMarkup(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function textIn(value, key = "") {
  if (typeof value === "string") return ["href", "src", "url", "id", "serviceId", "type"].includes(key) ? [] : [stripMarkup(value)];
  if (Array.isArray(value)) return value.flatMap((entry) => textIn(entry));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([entryKey, entry]) => textIn(entry, entryKey));
  return [];
}

function articlePath(article, locale) {
  const content = localized(article, locale);
  return content ? blogRoute({ locale, kind: "article", slug: content.slug }) : null;
}

function siteUrl(siteOrigin, outputPath) {
  const origin = new URL(siteOrigin);
  const base = origin.pathname === "/" ? origin.origin : `${origin.origin}${origin.pathname}`;
  const path = outputPath === "index.html" ? "" : outputPath.replace(/index\.html$/u, "");
  return `${base}/${path}`;
}

function xml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function publicArticles(model, locale) {
  return (model.publicArticles ?? [])
    .filter((article) => localized(article, locale))
    .sort((left, right) => right.publishedAt - left.publishedAt || left.id.localeCompare(right.id));
}

function articleKeywords(model, article, locale) {
  const category = localized(model.byId.category.get(article.primaryCategory), locale)?.name;
  const tags = article.tags.map((id) => localized(model.byId.tag.get(id), locale)?.name).filter(Boolean);
  const authors = [article.primaryAuthor, ...(article.coAuthors ?? [])]
    .map((id) => localized(model.byId.author.get(id), locale)?.name)
    .filter(Boolean);
  return { category, tags, authors };
}

/** Create the lightweight cross-site index for one locale. */
export function createGlobalSearchIndex({ model, siteDocuments, locale }) {
  const site = (Array.isArray(siteDocuments) ? siteDocuments : []).flatMap((document) => {
    const content = localized(document, locale);
    return content ? [{
      id: document.id,
      type: document.type,
      locale,
      title: stripMarkup(content.title),
      summary: stripMarkup(content.summary),
      href: content.href,
      keywords: Array.isArray(document.keywords) ? document.keywords.map(stripMarkup) : [],
      ...(document.featured === true ? { featured: true } : {}),
      ...(Number.isFinite(document.groupOrder) ? { groupOrder: document.groupOrder } : {})
    }] : [];
  });
  const articles = publicArticles(model, locale);
  const authorIds = new Set(articles.flatMap((article) => [article.primaryAuthor, ...(article.coAuthors ?? [])]));
  const authors = [...authorIds]
    .map((id) => model.byId.author.get(id))
    .filter((author) => localized(author, locale))
    .sort((left, right) => localized(left, locale).name.localeCompare(localized(right, locale).name, locale) || left.id.localeCompare(right.id))
    .map((author) => {
      const content = localized(author, locale);
      return {
        id: author.id,
        type: "author",
        locale,
        title: stripMarkup(content.name),
        summary: stripMarkup(content.bio),
        href: blogRoute({ locale, kind: "author", slug: content.slug }),
        keywords: [...(author.expertise ?? []), stripMarkup(content.role)]
      };
    });
  const articleDocuments = articles.map((article) => {
    const content = localized(article, locale);
    const metadata = articleKeywords(model, article, locale);
    return {
      id: article.id,
      type: "article",
      locale,
      title: stripMarkup(content.title),
      summary: stripMarkup(content.summary),
      href: articlePath(article, locale),
      keywords: [metadata.category, ...metadata.tags, ...metadata.authors].filter(Boolean).map(stripMarkup)
    };
  });
  return createSearchIndexEnvelope({ kind: "global-search", locale, records: [...site, ...authors, ...articleDocuments] });
}

/** Create the full-text, filterable Blog index for one locale. */
export function createBlogSearchIndex({ model, locale }) {
  const records = publicArticles(model, locale).map((article) => {
    const content = localized(article, locale);
    const metadata = articleKeywords(model, article, locale);
    const primaryAuthor = model.byId.author.get(article.primaryAuthor);
    const coAuthors = (article.coAuthors ?? []).map((id) => model.byId.author.get(id));
    return {
      id: article.id,
      type: "article",
      locale,
      title: stripMarkup(content.title),
      summary: stripMarkup(content.summary),
      href: articlePath(article, locale),
      keywords: [metadata.category, ...metadata.tags, ...metadata.authors].filter(Boolean).map(stripMarkup),
      content: textIn(content.blocks).filter(Boolean).join(" ").replace(/\s+/gu, " ").trim(),
      category: article.primaryCategory,
      tags: [...article.tags],
      audiences: [...article.audiences],
      level: article.level,
      format: article.format,
      authors: [article.primaryAuthor, ...(article.coAuthors ?? [])],
      primaryAuthor: { id: primaryAuthor.id, name: stripMarkup(localized(primaryAuthor, locale).name) },
      coAuthors: coAuthors.map((author) => ({ id: author.id, name: stripMarkup(localized(author, locale).name) })),
      categoryLabel: stripMarkup(metadata.category),
      levelLabel: dimensionLabels[locale][article.level],
      formatLabel: dimensionLabels[locale][article.format],
      readingMinutes: article.readingMinutes[locale],
      publishedAt: article.publishedAt.toISOString(),
      editedAt: article.editedAt.toISOString()
    };
  });
  return createSearchIndexEnvelope({ kind: "blog-search", locale, records });
}

/** Render a locale-specific RSS feed for all, category, or author articles. */
export function renderRss({ model, locale, scope }) {
  let articles = publicArticles(model, locale);
  let title = localized(model.settings, locale).title;
  if (scope.startsWith("category:")) {
    const id = scope.slice("category:".length);
    articles = articles.filter((article) => article.primaryCategory === id);
    title = `${title} — ${localized(model.byId.category.get(id), locale)?.name ?? id}`;
  } else if (scope.startsWith("author:")) {
    const id = scope.slice("author:".length);
    articles = articles.filter((article) => article.primaryAuthor === id || article.coAuthors?.includes(id));
    title = `${title} — ${localized(model.byId.author.get(id), locale)?.name ?? id}`;
  } else if (scope !== "all") {
    throw new TypeError("scope must be all, category:<id>, or author:<id>");
  }
  const origin = model.settings.siteOrigin;
  const channelUrl = siteUrl(origin, blogRoute({ locale, kind: "home" }));
  const items = articles.map((article) => {
    const content = localized(article, locale);
    const url = siteUrl(origin, articlePath(article, locale));
    return `<item><title>${xml(content.title)}</title><link>${xml(url)}</link><guid isPermaLink="true">${xml(url)}</guid><description>${xml(content.summary)}</description><pubDate>${xml(article.publishedAt.toUTCString())}</pubDate><lastBuildDate>${xml(article.editedAt.toUTCString())}</lastBuildDate></item>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${xml(title)}</title><link>${xml(channelUrl)}</link><description>${xml(localized(model.settings, locale).summary)}</description>${items}</channel></rss>\n`;
}

/** Render an XML sitemap from absolute URL entries. */
export function renderSitemap({ entries, siteOrigin }) {
  new URL(siteOrigin);
  const items = [...entries]
    .sort((left, right) => left.loc.localeCompare(right.loc))
    .map((entry) => `<url><loc>${xml(entry.loc)}</loc>${entry.lastmod ? `<lastmod>${xml(entry.lastmod)}</lastmod>` : ""}</url>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>\n`;
}

/** Return Article JSON-LD for one localized public article. */
export function articleStructuredData({ article, locale, canonicalUrl }) {
  const content = localized(article, locale);
  if (!content) throw new TypeError("article must be available in locale");
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: stripMarkup(content.title),
    description: stripMarkup(content.summary),
    url: canonicalUrl,
    inLanguage: locale,
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.editedAt.toISOString()
  };
}

function sitemapEntries(model, siteDocuments, locale, siteOrigin) {
  const entries = [];
  const add = (outputPath, lastmod) => entries.push({ loc: siteUrl(siteOrigin, outputPath), ...(lastmod ? { lastmod } : {}) });
  for (const document of Array.isArray(siteDocuments) ? siteDocuments : []) {
    const content = localized(document, locale);
    if (content?.href && !content.href.includes("#")) add(content.href);
  }
  add(blogRoute({ locale, kind: "home" }));
  add(blogRoute({ locale, kind: "tags" }));
  add(blogRoute({ locale, kind: "authors" }));
  const articles = publicArticles(model, locale);
  const articleIds = new Set(articles.map((article) => article.id));
  for (const category of model.categories.filter((record) => localized(record, locale) && articles.some((article) => article.primaryCategory === record.id))) add(blogRoute({ locale, kind: "category", slug: localized(category, locale).slug }));
  for (const tag of model.tags.filter((record) => localized(record, locale) && articles.some((article) => article.tags.includes(record.id)))) add(blogRoute({ locale, kind: "tag", slug: localized(tag, locale).slug }));
  for (const series of model.series.filter((record) => localized(record, locale) && record.articleIds?.some((id) => articleIds.has(id)))) add(blogRoute({ locale, kind: "series", slug: localized(series, locale).slug }));
  for (const author of model.authors.filter((record) => localized(record, locale) && articles.some((article) => article.primaryAuthor === record.id || article.coAuthors?.includes(record.id)))) add(blogRoute({ locale, kind: "author", slug: localized(author, locale).slug }));
  for (const article of articles) add(articlePath(article, locale), article.editedAt.toISOString());
  return entries;
}

function outputPathForInternalPath(path, siteOrigin, name) {
  const destination = new URL(path, siteOrigin);
  const base = new URL(siteOrigin).pathname.replace(/\/$/u, "");
  if (!destination.pathname.startsWith(`${base}/`)) throw new TypeError(`${name} must be inside the site base path`);
  if (destination.search || destination.hash || destination.pathname.includes("%")) throw new TypeError(`${name} must be a clean public page path`);
  const relative = destination.pathname.slice(base.length + 1).replace(/\/$/u, "");
  if (!relative) return "index.html";
  const parts = relative.split("/");
  if (parts.some((part) => !/^[A-Za-z0-9_-]+$/u.test(part))) {
    if (parts.length === 1 && /^[A-Za-z0-9][A-Za-z0-9_.-]*\.html$/u.test(relative)) return relative;
    throw new TypeError(`${name} must identify a safe page`);
  }
  return `${relative}/index.html`;
}

function derivedPublicRoutePaths(model) {
  const paths = new Set();
  for (const locale of LOCALES) {
    paths.add(blogRoute({ locale, kind: "home" }));
    paths.add(blogRoute({ locale, kind: "browse" }));
    paths.add(blogRoute({ locale, kind: "tags" }));
    paths.add(blogRoute({ locale, kind: "authors" }));
    for (const category of model.categories.filter((record) => localized(record, locale))) paths.add(blogRoute({ locale, kind: "category", slug: localized(category, locale).slug }));
    for (const tag of model.tags.filter((record) => localized(record, locale))) paths.add(blogRoute({ locale, kind: "tag", slug: localized(tag, locale).slug }));
    for (const series of model.series.filter((record) => localized(record, locale))) paths.add(blogRoute({ locale, kind: "series", slug: localized(series, locale).slug }));
    for (const author of model.authors.filter((record) => localized(record, locale))) paths.add(blogRoute({ locale, kind: "author", slug: localized(author, locale).slug }));
    for (const article of publicArticles(model, locale)) paths.add(articlePath(article, locale));
  }
  for (const article of publicArticles(model, "en").filter((record) => !localized(record, "he"))) {
    paths.add(blogRoute({ locale: "he", kind: "article", slug: localized(article, "en").slug }));
  }
  return paths;
}

function validateRedirects({ model, siteOrigin, publicRoutePaths }) {
  const publicPaths = new Set(publicRoutePaths ?? derivedPublicRoutePaths(model));
  const sources = new Set();
  return (model.articles ?? []).flatMap((article) => {
    if (!article.redirect) return [];
    const sourcePath = outputPathForInternalPath(article.redirect.oldPath, siteOrigin, "redirect oldPath");
    const replacementPath = outputPathForInternalPath(article.redirect.replacementPath, siteOrigin, "replacementPath");
    if (!publicPaths.has(replacementPath)) throw new Error(`redirect replacementPath does not resolve to an emitted public route: ${article.redirect.replacementPath}`);
    if (publicPaths.has(sourcePath)) throw new Error(`redirect oldPath collides with an emitted public route: ${article.redirect.oldPath}`);
    if (sources.has(sourcePath)) throw new Error(`duplicate redirect oldPath: ${article.redirect.oldPath}`);
    sources.add(sourcePath);
    return [{ outputPath: sourcePath, redirect: article.redirect }];
  });
}

function validateSearchRecordRoutes(searchIndexes, publicRoutePaths) {
  if (publicRoutePaths === undefined) return;
  const publicPaths = new Set(publicRoutePaths);
  for (const index of searchIndexes) {
    for (const record of index.records) {
      const outputPath = record.href.split("#")[0];
      if (!publicPaths.has(outputPath)) {
        throw new Error(`search record href does not resolve to an emitted public route: ${record.href}`);
      }
    }
  }
}

function renderRedirect({ redirect, siteOrigin }) {
  const destination = new URL(redirect.replacementPath, siteOrigin).href;
  const hebrew = redirect.locale === "he";
  const title = hebrew ? "העמוד הועבר" : "Page moved";
  const message = hebrew ? "העמוד הזה הועבר." : "This page has moved.";
  const action = hebrew ? "המשך לעמוד הנוכחי" : "Continue to the current page";
  return `<!doctype html><html lang="${xml(redirect.locale)}" dir="${hebrew ? "rtl" : "ltr"}"><head><meta charset="UTF-8"><meta name="robots" content="noindex, nofollow"><link rel="canonical" href="${xml(destination)}"><meta http-equiv="refresh" content="0; url=${xml(destination)}"><title>${xml(title)}</title></head><body><main><p>${xml(message)} <a href="${xml(destination)}">${xml(action)}</a>.</p></main></body></html>\n`;
}

async function emitFile(outputDir, outputPath, content, paths) {
  await mkdir(dirname(resolve(outputDir, outputPath)), { recursive: true });
  await writeFile(resolve(outputDir, outputPath), content);
  paths.push(outputPath);
}

/** Emit deterministic locale-specific search, feed, sitemap, and redirect artifacts. */
export async function emitDiscoveryArtifacts({ model, siteDocuments, outputDir, siteOrigin, publicRoutePaths }) {
  const redirects = validateRedirects({ model, siteOrigin, publicRoutePaths });
  const searchIndexes = LOCALES.map((locale) => ({
    locale,
    global: createGlobalSearchIndex({ model, siteDocuments, locale }),
    blog: createBlogSearchIndex({ model, locale })
  }));
  validateSearchRecordRoutes(searchIndexes.flatMap(({ global, blog }) => [global, blog]), publicRoutePaths);
  const paths = [];
  for (const { locale, global, blog } of searchIndexes) {
    await emitFile(outputDir, `search-index-${locale}.json`, `${JSON.stringify(global, null, 2)}\n`, paths);
    const prefix = locale === "he" ? "he/blog" : "blog";
    await emitFile(outputDir, `blog/search-index-${locale}.json`, `${JSON.stringify(blog, null, 2)}\n`, paths);
    await emitFile(outputDir, `${prefix}/rss-${locale}.xml`, renderRss({ model, locale, scope: "all" }), paths);
    for (const category of model.categories.filter((record) => localized(record, locale))) {
      await emitFile(outputDir, `${prefix}/category/${localized(category, locale).slug}/rss-${locale}.xml`, renderRss({ model, locale, scope: `category:${category.id}` }), paths);
    }
    for (const author of model.authors.filter((record) => localized(record, locale))) {
      await emitFile(outputDir, `${prefix}/authors/${localized(author, locale).slug}/rss-${locale}.xml`, renderRss({ model, locale, scope: `author:${author.id}` }), paths);
    }
    await emitFile(outputDir, `sitemap-${locale}.xml`, renderSitemap({ entries: sitemapEntries(model, siteDocuments, locale, siteOrigin), siteOrigin }), paths);
  }
  for (const { outputPath, redirect } of redirects) {
    await emitFile(outputDir, outputPath, renderRedirect({ redirect, siteOrigin }), paths);
  }
  return paths.sort();
}
