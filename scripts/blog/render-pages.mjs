import { renderBlocks } from "./render-blocks.mjs";
import { blogRoute, relativeSitePath } from "./routes.mjs";
import { escapeAttribute, escapeHtml, renderDocument } from "./render-shell.mjs";

const copy = {
  en: {
    latest: "Latest insights", featured: "Featured guide", evergreen: "Evergreen learning",
    authors: "Meet the authors", tags: "Explore topics", newsletter: "Keep useful marketing close",
    newsletterBody: "A prototype newsletter signup. It does not send your details yet.", email: "Email address",
    subscribe: "Subscribe", browse: "Browse all insights", search: "Search the blog", categories: "Topics",
    filters: "Filters", activeFilters: "Active filters", clear: "Clear filters", sort: "Sort by",
    newest: "Newest", relevance: "Relevance", results: "results", page: "Page", previous: "Previous", next: "Next",
    allInsights: "All insights", by: "By", reviewedBy: "Expert reviewed by", published: "Published",
    updated: "Last edited", read: "min read", level: "Level", format: "Format", audience: "Audience",
    entries: "Entries", totalReading: "Total reading time", overview: "Overview", credentials: "Credentials",
    featuredWork: "Featured work", latestWork: "Latest work", reviewedWork: "Reviewed content", topics: "Topics",
    copyLink: "Copy link", print: "Print", tableOfContents: "On this page", related: "Related reading",
    series: "Part of the series", previousEntry: "Previous entry", nextEntry: "Next entry", comments: "Discussion prototype",
    commentsBody: "This is a local, UI-only prototype. Comments are not submitted, stored, or public.", addComment: "Write a comment",
    unavailable: "This article is not yet available in Hebrew.", availableEnglish: "Read the English article", backToBlog: "Back to the blog",
    noResults: "Search the blog", noResultsBody: "Use the search and filters to find practical marketing guidance.",
    home: "Knowledge Hub", category: "Category", tag: "Topic", author: "Author", searchPlaceholder: "Search titles, topics, and authors"
  },
  he: {
    latest: "תובנות אחרונות", featured: "מדריך נבחר", evergreen: "למידה מתמשכת",
    authors: "הכירו את הכותבים", tags: "חקרו נושאים", newsletter: "להישאר קרובים לשיווק שימושי",
    newsletterBody: "טופס הצטרפות אבטיפוסי. הפרטים עדיין לא נשלחים.", email: "כתובת אימייל",
    subscribe: "הרשמה", browse: "לכל התובנות", search: "חיפוש בבלוג", categories: "נושאים",
    filters: "סינון", activeFilters: "מסננים פעילים", clear: "ניקוי מסננים", sort: "מיון לפי",
    newest: "החדש ביותר", relevance: "רלוונטיות", results: "תוצאות", page: "עמוד", previous: "הקודם", next: "הבא",
    allInsights: "כל התובנות", by: "מאת", reviewedBy: "סקירת מומחה", published: "פורסם",
    updated: "נערך לאחרונה", read: "דקות קריאה", level: "רמה", format: "פורמט", audience: "קהל",
    entries: "פרקים", totalReading: "זמן קריאה כולל", overview: "סקירה", credentials: "הסמכות",
    featuredWork: "עבודה נבחרת", latestWork: "עבודות אחרונות", reviewedWork: "תוכן שנסקר", topics: "נושאים",
    copyLink: "העתקת קישור", print: "הדפסה", tableOfContents: "בעמוד זה", related: "להמשך קריאה",
    series: "חלק מהסדרה", previousEntry: "פרק קודם", nextEntry: "פרק הבא", comments: "אב־טיפוס לדיון",
    commentsBody: "זהו אב־טיפוס מקומי לממשק בלבד. תגובות אינן נשלחות, נשמרות או פומביות.", addComment: "כתבו תגובה",
    unavailable: "המאמר הזה עדיין אינו זמין בעברית.", availableEnglish: "לקריאת המאמר באנגלית", backToBlog: "חזרה לבלוג",
    noResults: "חיפוש בבלוג", noResultsBody: "השתמשו בחיפוש ובמסננים כדי למצוא הנחיות שיווק מעשיות.",
    home: "מרכז הידע", category: "קטגוריה", tag: "נושא", author: "כותב", searchPlaceholder: "חיפוש בכותרות, נושאים וכותבים"
  }
};

const dimensions = {
  en: {
    beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced",
    guide: "Guide", "how-to": "How-to", framework: "Framework", checklist: "Checklist", "case-analysis": "Case analysis", opinion: "Opinion", "industry-update": "Industry update",
    leaders: "Leaders", practitioners: "Practitioners", specialists: "Specialists",
    strategy: "Strategy", analytics: "Analytics", content: "Content", social: "Social", "paid-media": "Paid media", email: "Email", lifecycle: "Lifecycle"
  },
  he: {
    beginner: "מתחילים", intermediate: "בינוניים", advanced: "מתקדמים",
    guide: "מדריך", "how-to": "איך עושים", framework: "מסגרת", checklist: "רשימת בדיקה", "case-analysis": "ניתוח מקרה", opinion: "דעה", "industry-update": "עדכון ענפי",
    leaders: "מנהלים", practitioners: "עוסקים", specialists: "מומחים",
    strategy: "אסטרטגיה", analytics: "אנליטיקה", content: "תוכן", social: "רשתות חברתיות", "paid-media": "מדיה ממומנת", email: "אימייל", lifecycle: "מחזור חיים"
  }
};

const otherLocale = (locale) => locale === "en" ? "he" : "en";
const localized = (record, locale) => record?.locales?.[locale] ?? null;
const text = (value) => escapeHtml(value ?? "");
const asset = (outputPath, source) => relativeSitePath(outputPath, source);
const href = (outputPath, target) => relativeSitePath(outputPath, target);

function dateLabel(date, locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(date);
}

function time(date, locale) {
  return `<time datetime="${escapeAttribute(date.toISOString())}">${text(dateLabel(date, locale))}</time>`;
}

function documentPage({ model, template, locale, outputPath, alternateOutputPath, title, description, mainHtml, bodyClass = "blog-page", structuredData = [] }) {
  const canonicalPath = outputPath.replace(/index\.html$/u, "");
  return {
    outputPath,
    html: renderDocument({
      template, locale, outputPath, title, description, canonicalPath,
      alternatePath: (alternateOutputPath ?? peerPath({ locale: otherLocale(locale), outputPath })).replace(/index\.html$/u, ""),
      bodyClass, mainHtml, structuredData, siteOrigin: model.settings.siteOrigin
    })
  };
}

function peerPath({ locale, outputPath }) {
  const parts = outputPath.split("/");
  if (locale === "en") parts.shift();
  else if (parts[0] !== "he") parts.unshift("he");
  return parts.join("/").replace(/index\.html$/u, "");
}

function articleRoute(article, locale) {
  const content = localized(article, locale);
  return content ? blogRoute({ locale, kind: "article", slug: content.slug }) : null;
}

function articlesFor(model, locale) {
  return model.publicArticles
    .filter((article) => localized(article, locale))
    .sort((left, right) => right.publishedAt - left.publishedAt || left.id.localeCompare(right.id));
}

function categoryFor(model, article) { return model.byId.category.get(article.primaryCategory); }
function authorFor(model, id) { return model.byId.author.get(id); }
function tagFor(model, id) { return model.byId.tag.get(id); }

function dimension(value, locale) { return dimensions[locale][value] ?? value; }

function expertiseLabel(model, value, locale) {
  const record = model.byId.category.get(value) ?? model.byId.tag.get(value);
  return localized(record, locale)?.name ?? dimension(value, locale);
}

function labelsFor(article, locale) {
  const ui = copy[locale];
  return `${text(ui.level)}: ${text(dimension(article.level, locale))} · ${text(ui.format)}: ${text(dimension(article.format, locale))} · ${article.readingMinutes[locale]} ${text(ui.read)}`;
}

export function renderArticleCard({ model, locale, outputPath, article }) {
  const content = localized(article, locale);
  const category = localized(categoryFor(model, article), locale);
  const author = localized(authorFor(model, article.primaryAuthor), locale);
  const target = articleRoute(article, locale);
  const ui = copy[locale];
  return `<article class="blog-card" data-article-card>
  <p class="blog-card__category">${text(category.name)}</p>
  <h3><a href="${escapeAttribute(href(outputPath, target))}">${text(content.title)}</a></h3>
  <p>${text(content.summary)}</p>
  <p class="blog-card__meta"><span>${text(ui.by)} ${text(author.name)}</span> · ${time(article.publishedAt, locale)}</p>
  <p class="blog-card__details">${labelsFor(article, locale)}</p>
</article>`;
}

export function renderAuthorCard({ model, locale, outputPath, author }) {
  const content = localized(author, locale);
  const articles = articlesFor(model, locale).filter((article) => article.primaryAuthor === author.id || article.coAuthors?.includes(author.id));
  const ui = copy[locale];
  return `<article class="author-card" data-author-card>
  <img src="${escapeAttribute(asset(outputPath, author.portrait))}" alt="${text(content.name)}" />
  <h3><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "author", slug: content.slug })))}">${text(content.name)}</a></h3>
  <p>${text(content.role)}</p><p>${text(content.bio)}</p>
  <p data-author-expertise>${author.expertise.map((value) => text(expertiseLabel(model, value, locale))).join(", ")}</p>
  <p data-author-count>${articles.length} ${text(ui.entries)}</p>
</article>`;
}

export function renderTagCloud({ model, locale, outputPath }) {
  const ui = copy[locale];
  const articles = articlesFor(model, locale);
  const tags = model.tags
    .filter((tag) => localized(tag, locale))
    .sort((left, right) => localized(left, locale).name.localeCompare(localized(right, locale).name, locale));
  return `<section class="blog-tag-cloud" aria-labelledby="tag-cloud-title" data-tag-cloud>
  <h2 id="tag-cloud-title">${text(ui.tags)}</h2><ul>${tags.map((tag) => {
    const content = localized(tag, locale);
    const count = articles.filter((article) => article.tags.includes(tag.id)).length;
    return `<li><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "tag", slug: content.slug })))}">${text(content.name)} <span>(${count})</span></a></li>`;
  }).join("")}</ul>
</section>`;
}

export function renderNewsletterPanel({ locale }) {
  const ui = copy[locale];
  return `<section class="blog-newsletter" aria-labelledby="newsletter-title">
  <h2 id="newsletter-title">${text(ui.newsletter)}</h2><p>${text(ui.newsletterBody)}</p>
  <form data-newsletter-form data-prototype="true"><label for="newsletter-email">${text(ui.email)}</label><input id="newsletter-email" name="email" type="email" autocomplete="email" required /><button type="submit">${text(ui.subscribe)}</button></form>
</section>`;
}

export function renderBreadcrumbs({ locale, outputPath, items }) {
  const ui = copy[locale];
  return `<nav aria-label="${text(ui.home)}" data-breadcrumbs><ol>${items.map((item, index) => {
    const label = text(item.label);
    return index === items.length - 1 ? `<li aria-current="page">${label}</li>` : `<li><a href="${escapeAttribute(href(outputPath, item.outputPath))}">${label}</a></li>`;
  }).join("")}</ol></nav>`;
}

function renderSearch({ locale, outputPath }) {
  const ui = copy[locale];
  return `<form action="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "browse" })))}" method="get" role="search" data-blog-search-form>
  <label for="blog-search-input">${text(ui.search)}</label><input id="blog-search-input" name="q" type="search" placeholder="${escapeAttribute(ui.searchPlaceholder)}" /><button type="submit">${text(ui.search)}</button>
</form>`;
}

function cards({ model, locale, outputPath, articles }) {
  return `<div class="blog-card-grid">${articles.map((article) => renderArticleCard({ model, locale, outputPath, article })).join("")}</div>`;
}

export function renderBlogHome({ model, template, locale, version = "", outputPath = blogRoute({ locale, kind: "home" }) }) {
  const ui = copy[locale];
  const settings = localized(model.settings, locale);
  const articles = articlesFor(model, locale);
  const featured = articles.find((article) => article.id === model.settings.featuredArticle) ?? articles[0];
  const categories = model.categories.filter((category) => localized(category, locale));
  const mainHtml = `<section class="blog-home shell" data-blog-home data-build-version="${escapeAttribute(version)}">
  <p>${text(ui.home)}</p><h1 id="page-title">${text(settings.title)}</h1><p>${text(settings.summary)}</p>${renderSearch({ locale, outputPath })}
  <nav aria-label="${text(ui.categories)}"><ul>${categories.map((category) => { const entry = localized(category, locale); return `<li><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "category", slug: entry.slug })))}">${text(entry.name)}</a></li>`; }).join("")}</ul></nav>
</section>
<section class="shell" aria-labelledby="featured-title"><h2 id="featured-title">${text(ui.featured)}</h2>${renderArticleCard({ model, locale, outputPath, article: featured })}</section>
<section class="shell" aria-labelledby="latest-title"><h2 id="latest-title">${text(ui.latest)}</h2>${cards({ model, locale, outputPath, articles: articles.filter((article) => article.id !== featured.id).slice(0, 6) })}<p><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "browse" })))}">${text(ui.browse)}</a></p></section>
<section class="shell" aria-labelledby="evergreen-title"><h2 id="evergreen-title">${text(ui.evergreen)}</h2>${cards({ model, locale, outputPath, articles: articles.slice(-3).reverse() })}</section>
<section class="shell" aria-labelledby="authors-title"><h2 id="authors-title">${text(ui.authors)}</h2><div class="author-grid">${model.authors.filter((author) => localized(author, locale)).sort((a, b) => localized(a, locale).name.localeCompare(localized(b, locale).name, locale)).map((author) => renderAuthorCard({ model, locale, outputPath, author })).join("")}</div></section>
<div class="shell">${renderTagCloud({ model, locale, outputPath })}${renderNewsletterPanel({ locale })}</div>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: blogRoute({ locale: otherLocale(locale), kind: "home" }), title: settings.title, description: settings.summary, mainHtml, bodyClass: "blog-page blog-home-page" });
}

function renderPagination({ locale, articleCount }) {
  const ui = copy[locale];
  const pages = Math.max(1, Math.ceil(articleCount / 12));
  return `<nav aria-label="${text(ui.page)}" data-pagination><ol>${Array.from({ length: pages }, (_, index) => `<li><a href="?page=${index + 1}"${index === 0 ? " aria-current=\"page\"" : ""}>${index + 1}</a></li>`).join("")}</ol></nav>`;
}

export function renderBrowsePage({ model, template, locale, outputPath = blogRoute({ locale, kind: "browse" }) }) {
  const ui = copy[locale];
  const articles = articlesFor(model, locale);
  const mainHtml = `<section class="shell" data-blog-browse><h1 id="page-title">${text(ui.allInsights)}</h1>${renderSearch({ locale, outputPath })}
  <aside aria-label="${text(ui.filters)}" data-filter-panel><h2>${text(ui.filters)}</h2><button type="button" data-filter-toggle>${text(ui.filters)}</button><div data-active-filters aria-live="polite">${text(ui.activeFilters)}: 0</div><button type="button" data-clear-filters>${text(ui.clear)}</button></aside>
  <label>${text(ui.sort)} <select data-blog-sort><option value="newest">${text(ui.newest)}</option><option value="relevance">${text(ui.relevance)}</option></select></label><p data-result-count>${articles.length} ${text(ui.results)}</p>
  ${cards({ model, locale, outputPath, articles: articles.slice(0, 12) })}${renderPagination({ locale, articleCount: articles.length })}</section>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: blogRoute({ locale: otherLocale(locale), kind: "browse" }), title: ui.allInsights, description: ui.noResultsBody, mainHtml });
}

export function renderCategoryPage({ model, template, locale, category, outputPath = blogRoute({ locale, kind: "category", slug: localized(category, locale).slug }) }) {
  const ui = copy[locale]; const content = localized(category, locale);
  const articles = articlesFor(model, locale).filter((article) => article.primaryCategory === category.id);
  const mainHtml = `${renderBreadcrumbs({ locale, outputPath, items: [{ label: ui.home, outputPath: blogRoute({ locale, kind: "home" }) }, { label: content.name }] })}<section class="shell" data-category-page><p>${text(ui.category)}</p><h1 id="page-title">${text(content.name)}</h1><p>${text(content.description)}</p>${cards({ model, locale, outputPath, articles })}</section>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: blogRoute({ locale: otherLocale(locale), kind: "category", slug: localized(category, otherLocale(locale)).slug }), title: content.name, description: content.description, mainHtml });
}

export function renderTagPage({ model, template, locale, tag, outputPath = blogRoute({ locale, kind: "tag", slug: localized(tag, locale).slug }) }) {
  const ui = copy[locale]; const content = localized(tag, locale);
  const articles = articlesFor(model, locale).filter((article) => article.tags.includes(tag.id));
  const mainHtml = `${renderBreadcrumbs({ locale, outputPath, items: [{ label: ui.home, outputPath: blogRoute({ locale, kind: "home" }) }, { label: content.name }] })}<section class="shell" data-tag-page><p>${text(ui.tag)}</p><h1 id="page-title">${text(content.name)}</h1>${content.description ? `<p>${text(content.description)}</p>` : ""}${cards({ model, locale, outputPath, articles })}</section>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: blogRoute({ locale: otherLocale(locale), kind: "tag", slug: localized(tag, otherLocale(locale)).slug }), title: content.name, description: content.description ?? content.name, mainHtml });
}

function seriesEntries(model, series, locale) {
  return series.articleIds.map((id) => model.byId.article.get(id)).filter((article) => article?.status === "published" && localized(article, locale));
}

export function renderSeriesPage({ model, template, locale, series, outputPath = blogRoute({ locale, kind: "series", slug: localized(series, locale).slug }) }) {
  const ui = copy[locale]; const content = localized(series, locale); const entries = seriesEntries(model, series, locale);
  const total = entries.reduce((sum, article) => sum + article.readingMinutes[locale], 0);
  const mainHtml = `${renderBreadcrumbs({ locale, outputPath, items: [{ label: ui.home, outputPath: blogRoute({ locale, kind: "home" }) }, { label: content.title }] })}<section class="shell" data-series-page><h1 id="page-title">${text(content.title)}</h1><p>${text(content.description)}</p><dl><dt>${text(ui.audience)}</dt><dd>${series.audiences.map((value) => text(dimension(value, locale))).join(", ")}</dd><dt>${text(ui.level)}</dt><dd>${text(dimension(series.level, locale))}</dd><dt>${text(ui.totalReading)}</dt><dd>${total} ${text(ui.read)}</dd></dl><ol data-series-entries>${entries.map((article) => `<li>${renderArticleCard({ model, locale, outputPath, article })}</li>`).join("")}</ol></section>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: blogRoute({ locale: otherLocale(locale), kind: "series", slug: localized(series, otherLocale(locale)).slug }), title: content.title, description: content.description, mainHtml });
}

export function renderAuthorsPage({ model, template, locale, outputPath = blogRoute({ locale, kind: "authors" }) }) {
  const ui = copy[locale]; const authors = model.authors.filter((author) => localized(author, locale)).sort((a, b) => localized(a, locale).name.localeCompare(localized(b, locale).name, locale));
  const mainHtml = `<section class="shell" data-authors-page><h1 id="page-title">${text(ui.authors)}</h1><div class="author-grid">${authors.map((author) => renderAuthorCard({ model, locale, outputPath, author })).join("")}</div></section>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: blogRoute({ locale: otherLocale(locale), kind: "authors" }), title: ui.authors, description: ui.authors, mainHtml });
}

export function renderAuthorPage({ model, template, locale, author, outputPath = blogRoute({ locale, kind: "author", slug: localized(author, locale).slug }) }) {
  const ui = copy[locale]; const content = localized(author, locale);
  const authored = articlesFor(model, locale).filter((article) => article.primaryAuthor === author.id || article.coAuthors?.includes(author.id));
  const reviewed = articlesFor(model, locale).filter((article) => article.reviewer === author.id);
  const topics = [...new Set(authored.flatMap((article) => article.tags))].map((id) => localized(tagFor(model, id), locale)?.name).filter(Boolean);
  const mainHtml = `${renderBreadcrumbs({ locale, outputPath, items: [{ label: ui.authors, outputPath: blogRoute({ locale, kind: "authors" }) }, { label: content.name }] })}<section class="shell" data-author-page><img src="${escapeAttribute(asset(outputPath, author.portrait))}" alt="${text(content.name)}" /><h1 id="page-title">${text(content.name)}</h1><p>${text(content.role)}</p><p>${text(content.bio)}</p><h2>${text(ui.credentials)}</h2><ul>${author.credentials.map((credential) => `<li>${text(credential)}</li>`).join("")}</ul><p data-author-count>${authored.length} ${text(ui.entries)}</p><h2>${text(ui.featuredWork)}</h2>${cards({ model, locale, outputPath, articles: authored.slice(0, 1) })}<h2>${text(ui.latestWork)}</h2>${cards({ model, locale, outputPath, articles: authored })}<h2>${text(ui.topics)}</h2><p>${topics.map(text).join(", ")}</p>${reviewed.length ? `<section data-reviewed-content><h2>${text(ui.reviewedWork)}</h2>${cards({ model, locale, outputPath, articles: reviewed })}</section>` : ""}</section>${renderNewsletterPanel({ locale })}`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: blogRoute({ locale: otherLocale(locale), kind: "author", slug: localized(author, otherLocale(locale)).slug }), title: content.name, description: content.bio, mainHtml });
}

function relatedArticles(model, article, locale) {
  const available = articlesFor(model, locale).filter((candidate) => candidate.id !== article.id);
  const related = []; const add = (candidate) => { if (candidate && !related.some((item) => item.id === candidate.id)) related.push(candidate); };
  for (const id of article.relatedArticles ?? []) add(available.find((candidate) => candidate.id === id));
  if (article.series) for (const candidate of seriesEntries(model, model.byId.series.get(article.series), locale)) add(candidate);
  for (const candidate of available.filter((candidate) => candidate.primaryCategory === article.primaryCategory && candidate.tags.some((tag) => article.tags.includes(tag)))) add(candidate);
  for (const candidate of available.filter((candidate) => candidate.level === article.level && candidate.audiences.some((audience) => article.audiences.includes(audience)))) add(candidate);
  return related.slice(0, 3);
}

function renderSeriesNavigation({ model, article, locale, outputPath }) {
  if (!article.series) return "";
  const ui = copy[locale]; const series = model.byId.series.get(article.series); const entries = seriesEntries(model, series, locale); const index = entries.findIndex((entry) => entry.id === article.id);
  const content = localized(series, locale);
  const previous = entries[index - 1]; const next = entries[index + 1];
  return `<nav data-series-navigation aria-label="${text(ui.series)}"><p>${text(ui.series)}: <a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "series", slug: content.slug })))}">${text(content.title)}</a></p>${previous ? `<a rel="prev" href="${escapeAttribute(href(outputPath, articleRoute(previous, locale)))}">${text(ui.previousEntry)}</a>` : ""}${next ? `<a rel="next" href="${escapeAttribute(href(outputPath, articleRoute(next, locale)))}">${text(ui.nextEntry)}</a>` : ""}</nav>`;
}

export function renderArticlePage({ model, template, locale, article, outputPath = articleRoute(article, locale) }) {
  const ui = copy[locale]; const content = localized(article, locale); const category = localized(categoryFor(model, article), locale); const author = authorFor(model, article.primaryAuthor); const authorContent = localized(author, locale);
  const reviewer = article.reviewer ? localized(authorFor(model, article.reviewer), locale) : null;
  const headings = content.blocks.filter((block) => ["keyTakeaways", "richText", "figure", "quote", "stat", "checklist", "steps", "table", "media", "callout", "faq"].includes(block.type) && block.heading).map((block, index) => ({ id: `section-${index + 1}`, label: block.heading }));
  const hero = `<figure class="article-hero"><img src="${escapeAttribute(asset(outputPath, article.hero.src))}" alt="${text(article.hero.decorative ? "" : article.hero.alt[locale])}" /></figure>`;
  const metadata = `<div class="article-meta"><p data-article-author>${text(ui.by)} ${text(authorContent.name)}${article.coAuthors?.length ? `, ${article.coAuthors.map((id) => text(localized(authorFor(model, id), locale).name)).join(", ")}` : ""}</p>${reviewer ? `<p>${text(ui.reviewedBy)} ${text(reviewer.name)}</p>` : ""}<p><span>${text(ui.published)} </span>${time(article.publishedAt, locale)}</p><p><span>${text(ui.updated)} </span><time itemprop="dateModified" datetime="${escapeAttribute(article.editedAt.toISOString())}">${text(dateLabel(article.editedAt, locale))}</time></p><meta itemprop="datePublished" content="${escapeAttribute(article.publishedAt.toISOString())}" /><p>${labelsFor(article, locale)}</p></div>`;
  const tags = article.tags.map((id) => { const tag = localized(tagFor(model, id), locale); return `<li><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "tag", slug: tag.slug })))}">${text(tag.name)}</a></li>`; }).join("");
  const body = renderBlocks(content.blocks, { locale, resolveAsset: (source) => asset(outputPath, source), consultation: article.relatedService ? { serviceId: article.relatedService } : null });
  const anchoredBody = body.replace(/<section class="article-block /gu, (match, offset) => `${match}id="section-${(body.slice(0, offset).match(/<section class="article-block /gu) ?? []).length + 1}" `);
  const mainHtml = `${renderBreadcrumbs({ locale, outputPath, items: [{ label: ui.home, outputPath: blogRoute({ locale, kind: "home" }) }, { label: category.name, outputPath: blogRoute({ locale, kind: "category", slug: category.slug }) }, { label: content.title }] })}<article class="shell article-page" data-article-page itemscope itemtype="https://schema.org/Article"><header><p>${text(category.name)} · ${text(dimension(article.level, locale))}</p><h1 id="page-title" itemprop="headline">${text(content.title)}</h1><p itemprop="description">${text(content.summary)}</p>${metadata}${hero}<div class="article-tools"><button type="button" data-copy-link>${text(ui.copyLink)}</button><button type="button" data-print-article>${text(ui.print)}</button></div></header><aside data-article-toc><h2>${text(ui.tableOfContents)}</h2><ol>${headings.map((heading) => `<li><a href="#${heading.id}">${text(heading.label)}</a></li>`).join("")}</ol></aside><div class="article-body" itemprop="articleBody">${anchoredBody}</div><section data-article-tags><h2>${text(ui.tags)}</h2><ul>${tags}</ul></section>${article.correctionNote?.[locale] ? `<p data-correction-note>${text(article.correctionNote[locale])}</p>` : ""}${renderSeriesNavigation({ model, article, locale, outputPath })}<section data-related-content><h2>${text(ui.related)}</h2>${cards({ model, locale, outputPath, articles: relatedArticles(model, article, locale) })}</section>${renderNewsletterPanel({ locale })}<section data-demo-comments data-prototype="true"><h2>${text(ui.comments)}</h2><p>${text(ui.commentsBody)}</p><form><label for="demo-comment">${text(ui.addComment)}</label><textarea id="demo-comment" name="comment"></textarea><button type="button" disabled>${text(ui.addComment)}</button></form></section></article>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: articleRoute(article, otherLocale(locale)), title: content.title, description: content.summary, mainHtml, structuredData: [{ "@context": "https://schema.org", "@type": "Article", headline: content.title, datePublished: article.publishedAt.toISOString(), dateModified: article.editedAt.toISOString() }] });
}

export function renderSearchFallbackPage({ model, template, locale, outputPath = blogRoute({ locale, kind: "browse" }) }) {
  const ui = copy[locale];
  const mainHtml = `<section class="shell" data-blog-search-fallback><h1 id="page-title">${text(ui.noResults)}</h1><p>${text(ui.noResultsBody)}</p>${renderSearch({ locale, outputPath })}</section>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: blogRoute({ locale: otherLocale(locale), kind: "browse" }), title: ui.noResults, description: ui.noResultsBody, mainHtml });
}

export function renderMissingTranslationPage({ model, template, article, outputPath }) {
  const locale = "he"; const ui = copy.he; const englishRoute = articleRoute(article, "en");
  const mainHtml = `<section class="shell" data-missing-translation><h1 id="page-title">${text(ui.unavailable)}</h1><p>${text(ui.unavailable)}</p><p><a href="${escapeAttribute(href(outputPath, englishRoute))}">${text(ui.availableEnglish)}</a></p><p><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "home" })))}">${text(ui.backToBlog)}</a></p></section>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: englishRoute, title: ui.unavailable, description: ui.unavailable, mainHtml });
}
