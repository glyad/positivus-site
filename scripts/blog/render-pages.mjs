import { renderBlocks } from "./render-blocks.mjs";
import { articleStructuredData } from "./discovery.mjs";
import { blogBrowsePageRoute, blogRoute, relativeSitePath } from "./routes.mjs";
import { escapeAttribute, escapeHtml, renderDocument } from "./render-shell.mjs";

const copy = {
  en: {
    latest: "Latest insights", featured: "Featured guide", evergreen: "Evergreen learning",
    authors: "Meet the authors", tags: "Explore topics", newsletter: "Keep useful marketing close",
    newsletterBody: "A prototype newsletter signup. It does not send your details yet.", email: "Email address",
    subscribe: "Subscribe", browse: "Browse all insights", search: "Search the blog", categories: "Topics",
    filters: "Filters", activeFilters: "Active filters", clear: "Clear filters", sort: "Sort by",
    newest: "Newest", relevance: "Relevance", oldest: "Oldest", updatedSort: "Recently updated", results: "results", page: "Page", previous: "Previous", next: "Next",
    allInsights: "All insights", by: "By", reviewedBy: "Expert reviewed by", published: "Published",
    updated: "Last edited", read: "min read", level: "Level", format: "Format", audience: "Audience",
    entries: "Entries", totalReading: "Total reading time", overview: "Overview", credentials: "Credentials",
    featuredWork: "Featured work", latestWork: "Latest work", reviewedWork: "Reviewed content", topics: "Topics",
    copyLink: "Copy link", copySucceeded: "Link copied.", copyFailed: "Could not copy the link.", print: "Print", tableOfContents: "On this page", related: "Related reading",
    series: "Part of the series", previousEntry: "Previous entry", nextEntry: "Next entry", comments: "Discussion prototype",
    commentsBody: "This is a local, UI-only prototype.", demoCommentNotice: "Demo comments are not published or stored.", signInToComment: "Sign in to comment", previewSignedIn: "Preview signed-in state", commentGuidance: "Write 2–2000 characters. Your comment stays only on this page until you leave or refresh.", addComment: "Write a comment", submitComment: "Add demo comment", commentAdded: "Demo comment added for this page session.",
    unavailable: "This article is not yet available in Hebrew.", availableEnglish: "Read the English article", backToBlog: "Back to the blog",
    noResults: "Search the blog", noResultsBody: "Use the search and filters to find practical marketing guidance.",
    home: "Knowledge Hub", category: "Category", tag: "Topic", author: "Author", searchPlaceholder: "Search titles, topics, and authors",
    tagIndex: "All topics", backToTagIndex: "Browse all topics", relatedCategories: "Related categories", formats: "Formats", levels: "Levels", apply: "Apply",
    featuredInCategory: "Featured in this category", remainingInCategory: "More in this category", articles: "Articles", guides: "Guides", seriesCount: "Series", authorSearch: "Find an author", authorExpertise: "Expertise", showTopics: "Show topics", publishedFrom: "Published from", publishedThrough: "Published through",
    empty: "New insights are on the way", emptyBody: "Search the blog or browse our topics while we prepare the next practical guide.",
    siteSearch: "Search Positivus", siteSearchBody: "Browse our services, case studies, and practical marketing guides.", services: "Services", useCases: "Case studies"
  },
  he: {
    latest: "תובנות אחרונות", featured: "מדריך נבחר", evergreen: "למידה מתמשכת",
    authors: "הכירו את הכותבים", tags: "חקרו נושאים", newsletter: "להישאר קרובים לשיווק שימושי",
    newsletterBody: "טופס הצטרפות אבטיפוסי. הפרטים עדיין לא נשלחים.", email: "כתובת אימייל",
    subscribe: "הרשמה", browse: "לכל התובנות", search: "חיפוש בבלוג", categories: "נושאים",
    filters: "סינון", activeFilters: "מסננים פעילים", clear: "ניקוי מסננים", sort: "מיון לפי",
    newest: "החדש ביותר", relevance: "רלוונטיות", oldest: "הישן ביותר", updatedSort: "נערך לאחרונה", results: "תוצאות", page: "עמוד", previous: "הקודם", next: "הבא",
    allInsights: "כל התובנות", by: "מאת", reviewedBy: "סקירת מומחה", published: "פורסם",
    updated: "נערך לאחרונה", read: "דקות קריאה", level: "רמה", format: "פורמט", audience: "קהל",
    entries: "פרקים", totalReading: "זמן קריאה כולל", overview: "סקירה", credentials: "הסמכות",
    featuredWork: "עבודה נבחרת", latestWork: "עבודות אחרונות", reviewedWork: "תוכן שנסקר", topics: "נושאים",
    copyLink: "העתקת קישור", copySucceeded: "הקישור הועתק.", copyFailed: "לא הצלחנו להעתיק את הקישור.", print: "הדפסה", tableOfContents: "בעמוד זה", related: "להמשך קריאה",
    series: "חלק מהסדרה", previousEntry: "פרק קודם", nextEntry: "פרק הבא", comments: "אב־טיפוס לדיון",
    commentsBody: "זהו אב־טיפוס מקומי לממשק בלבד.", demoCommentNotice: "Demo comments are not published or stored.", signInToComment: "התחברו כדי להגיב", previewSignedIn: "תצוגה מקדימה של מצב מחובר", commentGuidance: "כתבו 2–2000 תווים. התגובה נשארת רק בעמוד הזה עד לעזיבה או לרענון.", addComment: "כתבו תגובה", submitComment: "הוספת תגובת הדגמה", commentAdded: "תגובת הדגמה נוספה למפגש הנוכחי בעמוד.",
    unavailable: "המאמר הזה עדיין אינו זמין בעברית.", availableEnglish: "לקריאת המאמר באנגלית", backToBlog: "חזרה לבלוג",
    noResults: "חיפוש בבלוג", noResultsBody: "השתמשו בחיפוש ובמסננים כדי למצוא הנחיות שיווק מעשיות.",
    home: "מרכז הידע", category: "קטגוריה", tag: "נושא", author: "כותב", searchPlaceholder: "חיפוש בכותרות, נושאים וכותבים",
    tagIndex: "כל הנושאים", backToTagIndex: "לכל הנושאים", relatedCategories: "קטגוריות קשורות", formats: "פורמטים", levels: "רמות", apply: "החלה",
    featuredInCategory: "נבחר בקטגוריה", remainingInCategory: "עוד בקטגוריה", articles: "מאמרים", guides: "מדריכים", seriesCount: "סדרות", authorSearch: "חיפוש כותב", authorExpertise: "מומחיות", showTopics: "הצגת נושאים", publishedFrom: "פורסם מתאריך", publishedThrough: "פורסם עד תאריך",
    empty: "תובנות חדשות בדרך", emptyBody: "חפשו בבלוג או עיינו בנושאים שלנו בזמן שאנחנו מכינים את המדריך המעשי הבא.",
    siteSearch: "חיפוש בפוזיטיבוס", siteSearchBody: "עיינו בשירותים שלנו, במקרי הבוחן ובמדריכי השיווק המעשיים.", services: "שירותים", useCases: "מקרי בוחן"
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

function documentPage({ model, template, locale, outputPath, alternateOutputPath, title, description, mainHtml, bodyClass = "blog-page", structuredData = [], robots = "index, follow", socialImage = null, socialType = "website" }) {
  const canonicalPath = outputPath.replace(/index\.html$/u, "");
  const alternatePath = alternateOutputPath === undefined
    ? peerPath({ locale: otherLocale(locale), outputPath })
    : alternateOutputPath === null ? null : alternateOutputPath.replace(/index\.html$/u, "");
  return {
    outputPath,
    html: renderDocument({
      template, locale, outputPath, title, description, canonicalPath,
      alternatePath,
      bodyClass, mainHtml, structuredData, robots, socialImage, socialType, siteOrigin: model.settings.siteOrigin
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
  return (model.publicArticles ?? [])
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

function professionalLinkLabel(link, locale) {
  return typeof link?.label === "string" ? link.label : link?.label?.[locale];
}

function isRenderableProfessionalLink(link, locale) {
  const label = professionalLinkLabel(link, locale);
  if (typeof label !== "string" || !label.trim() || typeof link?.href !== "string" || /[\u0000-\u001F\u007F]/u.test(link.href)) return false;
  try {
    const target = new URL(link.href);
    return target.protocol === "https:" && !target.username && !target.password && target.href === link.href;
  } catch {
    return false;
  }
}

function renderProfessionalLinks({ author, locale }) {
  const links = (author.professionalLinks ?? []).filter((link) => isRenderableProfessionalLink(link, locale));
  if (!links.length) return "";
  return `<section data-professional-links><ul>${links.map((link) => `<li><a href="${escapeAttribute(link.href)}" target="_blank" rel="noreferrer noopener">${text(professionalLinkLabel(link, locale))}</a></li>`).join("")}</ul></section>`;
}

function labelsFor(article, locale) {
  const ui = copy[locale];
  return `${text(ui.level)}: ${text(dimension(article.level, locale))} · ${text(ui.format)}: ${text(dimension(article.format, locale))} · ${article.readingMinutes[locale]} ${text(ui.read)}`;
}

export function renderArticleCard({ model, locale, outputPath, article, featured = false }) {
  const content = localized(article, locale);
  const category = localized(categoryFor(model, article), locale);
  const author = localized(authorFor(model, article.primaryAuthor), locale);
  const target = articleRoute(article, locale);
  const ui = copy[locale];
  const artwork = featured ? `<figure class="blog-card__artwork"><img src="${escapeAttribute(asset(outputPath, article.hero.src))}" alt="${escapeAttribute(article.hero.decorative ? "" : article.hero.alt[locale])}" /></figure>` : "";
  return `<article class="blog-card" data-article-card${featured ? " data-featured-card" : ""}>
  ${artwork}
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
  return `<article class="author-card" data-author-card data-author-name="${escapeAttribute(content.name)}" data-author-bio="${escapeAttribute(content.bio)}" data-author-expertise-values="${escapeAttribute((author.expertise ?? []).join(" "))}">
  <img src="${escapeAttribute(asset(outputPath, author.portrait))}" alt="${escapeAttribute(content.name)}" />
  <h3><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "author", slug: content.slug })))}">${text(content.name)}</a></h3>
  <p>${text(content.role)}</p><p>${text(content.bio)}</p>
  <p data-author-expertise>${(Array.isArray(author.expertise) ? author.expertise : []).map((value) => text(expertiseLabel(model, value, locale))).join(", ")}</p>
  <p data-author-count>${articles.length} ${text(ui.entries)}</p>
</article>`;
}

export function renderTagCloud({ model, locale, outputPath }) {
  const ui = copy[locale];
  const articles = articlesFor(model, locale);
  const tags = model.tags
    .filter((tag) => localized(tag, locale))
    .sort((left, right) => localized(left, locale).name.localeCompare(localized(right, locale).name, locale));
  const counts = tags.map((tag) => articles.filter((article) => article.tags.includes(tag.id)).length);
  const maximum = Math.max(...counts, 1);
  const countLabel = (name, count) => locale === "he" ? `${name}: ${count} מאמרים` : `${name}: ${count} article${count === 1 ? "" : "s"}`;
  return `<section class="blog-tag-cloud" aria-labelledby="tag-cloud-title" data-tag-cloud>
  <h2 id="tag-cloud-title">${text(ui.tags)}</h2><button type="button" data-tag-cloud-toggle aria-expanded="true">${text(ui.showTopics)}</button><ul data-tag-cloud-list>${tags.map((tag, index) => {
    const content = localized(tag, locale);
    const count = counts[index];
    const weight = Math.max(1, Math.min(5, Math.ceil((count / maximum) * 5)));
    return `<li><a class="tag-weight-${weight}" aria-label="${escapeAttribute(countLabel(content.name, count))}" href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "tag", slug: content.slug })))}">${text(content.name)} <span>(${count})</span></a></li>`;
  }).join("")}</ul>
</section>`;
}

function renderTagEntries({ model, locale, outputPath }) {
  const articles = articlesFor(model, locale);
  return model.tags
    .filter((tag) => localized(tag, locale))
    .sort((left, right) => localized(left, locale).name.localeCompare(localized(right, locale).name, locale) || left.id.localeCompare(right.id))
    .map((tag) => {
      const content = localized(tag, locale);
      const count = articles.filter((article) => article.tags.includes(tag.id)).length;
      return `<li><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "tag", slug: content.slug })))}">${text(content.name)} <span>(${count})</span></a></li>`;
    }).join("");
}

export function renderTagIndexPage({ model, template, locale, outputPath = blogRoute({ locale, kind: "tags" }) }) {
  const ui = copy[locale];
  const mainHtml = `<section class="shell" data-tag-index><h1 id="page-title">${text(ui.tagIndex)}</h1><ul>${renderTagEntries({ model, locale, outputPath })}</ul></section>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: blogRoute({ locale: otherLocale(locale), kind: "tags" }), title: ui.tagIndex, description: ui.tagIndex, mainHtml });
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
  const articleSections = featured
    ? `<section class="shell" aria-labelledby="featured-title"><h2 id="featured-title">${text(ui.featured)}</h2>${renderArticleCard({ model, locale, outputPath, article: featured, featured: true })}</section>
<section class="shell" aria-labelledby="latest-title"><h2 id="latest-title">${text(ui.latest)}</h2>${cards({ model, locale, outputPath, articles: articles.filter((article) => article.id !== featured.id).slice(0, 6) })}<p><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "browse" })))}">${text(ui.browse)}</a></p></section>
<section class="shell" aria-labelledby="evergreen-title"><h2 id="evergreen-title">${text(ui.evergreen)}</h2>${cards({ model, locale, outputPath, articles: articles.slice(-3).reverse() })}</section>`
    : `<section class="shell" data-blog-empty><h2>${text(ui.empty)}</h2><p>${text(ui.emptyBody)}</p><p><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "browse" })))}">${text(ui.browse)}</a></p></section>`;
  const mainHtml = `<section class="blog-home shell" data-blog-home data-build-version="${escapeAttribute(version)}">
  <p>${text(ui.home)}</p><h1 id="page-title">${text(settings.title)}</h1><p>${text(settings.summary)}</p>${renderSearch({ locale, outputPath })}
  <nav aria-label="${text(ui.categories)}"><ul>${categories.map((category) => { const entry = localized(category, locale); return `<li><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "category", slug: entry.slug })))}">${text(entry.name)}</a></li>`; }).join("")}</ul></nav>
</section>
${articleSections}
<section class="shell" aria-labelledby="authors-title"><h2 id="authors-title">${text(ui.authors)}</h2><div class="author-grid">${model.authors.filter((author) => localized(author, locale)).sort((a, b) => localized(a, locale).name.localeCompare(localized(b, locale).name, locale)).map((author) => renderAuthorCard({ model, locale, outputPath, author })).join("")}</div></section>
<div class="shell">${renderTagCloud({ model, locale, outputPath })}${renderNewsletterPanel({ locale })}</div>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: blogRoute({ locale: otherLocale(locale), kind: "home" }), title: settings.title, description: settings.summary, mainHtml, bodyClass: "blog-page blog-home-page" });
}

function renderPagination({ locale, outputPath, articleCount, page = 1 }) {
  const ui = copy[locale];
  const pages = Math.max(1, Math.ceil(articleCount / 12));
  return `<nav aria-label="${text(ui.page)}" data-pagination><ol>${Array.from({ length: pages }, (_, index) => {
    const number = index + 1;
    return `<li><a href="${escapeAttribute(href(outputPath, blogBrowsePageRoute({ locale, page: number })))}"${number === page ? " aria-current=\"page\"" : ""}>${number}</a></li>`;
  }).join("")}</ol></nav>`;
}

function renderFilterOptions(records, locale, valueOf, labelOf) {
  return records.map((record) => `<option value="${escapeAttribute(valueOf(record))}">${text(labelOf(record))}</option>`).join("");
}

function renderBrowseFilters({ model, locale, articles }) {
  const ui = copy[locale];
  const formats = [...new Set(articles.map((article) => article.format))].sort();
  const audiences = [...new Set(articles.flatMap((article) => article.audiences))].sort();
  const levels = [...new Set(articles.map((article) => article.level))].sort();
  const authors = model.authors.filter((author) => localized(author, locale)).sort((left, right) => localized(left, locale).name.localeCompare(localized(right, locale).name, locale));
  const controls = (prefix) => {
    const select = (id, label, options, legacy = "") => `<label for="${prefix}-filter-${id}">${text(label)}<select id="${prefix}-filter-${id}" data-filter-${id}${legacy ? ` data-filter-${legacy}` : ""} multiple>${options}</select></label>`;
    const date = (id, label, legacy = "") => `<label for="${prefix}-filter-${id}">${text(label)}<input id="${prefix}-filter-${id}" data-filter-${id}${legacy ? ` data-filter-${legacy}` : ""} type="date" /></label>`;
    return `${select("category", ui.category, renderFilterOptions(model.categories.filter((category) => localized(category, locale)), locale, (category) => category.id, (category) => localized(category, locale).name))}${select("format", ui.format, formats.map((value) => `<option value="${escapeAttribute(value)}">${text(dimension(value, locale))}</option>`).join(""))}${select("audience", ui.audience, audiences.map((value) => `<option value="${escapeAttribute(value)}">${text(dimension(value, locale))}</option>`).join(""))}${select("level", ui.level, levels.map((value) => `<option value="${escapeAttribute(value)}">${text(dimension(value, locale))}</option>`).join(""))}${select("author", ui.author, renderFilterOptions(authors, locale, (author) => author.id, (author) => localized(author, locale).name))}${select("duration", ui.read, `<option value="short">${text(locale === "he" ? "1–5 דקות" : "1–5 minutes")}</option><option value="medium">${text(locale === "he" ? "6–10 דקות" : "6–10 minutes")}</option><option value="long">${text(locale === "he" ? "11+ דקות" : "11+ minutes")}</option>`, "reading-duration")}${date("from", ui.publishedFrom, "publication-date")}${date("to", ui.publishedThrough)}`;
  };
  return `<aside aria-label="${text(ui.filters)}" data-filter-panel><h2>${text(ui.filters)}</h2><button type="button" data-filter-toggle aria-expanded="false">${text(ui.filters)}</button><div data-active-filters aria-live="polite">${text(ui.activeFilters)}: 0</div><div data-filter-controls>${controls("desktop")}</div></aside><div data-filter-drawer role="dialog" aria-modal="true" aria-label="${text(ui.filters)}" hidden tabindex="-1"><div data-active-filters aria-live="polite">${text(ui.activeFilters)}: 0</div><div data-filter-controls>${controls("drawer")}</div><button type="button" data-filter-apply>${text(ui.apply)}</button><button type="button" data-filter-clear>${text(ui.clear)}</button></div>`;
}

export function renderBrowsePage({ model, template, locale, page = 1, outputPath = blogBrowsePageRoute({ locale, page }), alternateOutputPath = blogBrowsePageRoute({ locale: otherLocale(locale), page }) }) {
  const ui = copy[locale];
  const articles = articlesFor(model, locale);
  const pages = Math.max(1, Math.ceil(articles.length / 12));
  const currentPage = Math.min(Math.max(1, page), pages);
  const index = href(outputPath, `blog/search-index-${locale}.json`);
  const mainHtml = `<section class="shell" data-blog-browse data-blog-static-page="${currentPage}" data-blog-index="${escapeAttribute(index)}"><h1 id="page-title">${text(ui.allInsights)}</h1>${renderSearch({ locale, outputPath })}
  ${renderBrowseFilters({ model, locale, articles })}
  <label>${text(ui.sort)} <select data-blog-sort><option value="newest">${text(ui.newest)}</option><option value="relevance">${text(ui.relevance)}</option><option value="oldest">${text(ui.oldest)}</option><option value="updated">${text(ui.updatedSort)}</option></select></label><h2 data-results-heading tabindex="-1">${text(ui.allInsights)}</h2><p data-result-count aria-live="polite">${articles.length} ${text(ui.results)}</p>
  ${cards({ model, locale, outputPath, articles: articles.slice((currentPage - 1) * 12, currentPage * 12) })}${renderPagination({ locale, outputPath, articleCount: articles.length, page: currentPage })}${renderTagCloud({ model, locale, outputPath })}</section>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath, title: ui.allInsights, description: ui.noResultsBody, mainHtml, robots: "noindex, follow" });
}

export function renderCategoryPage({ model, template, locale, category, outputPath = blogRoute({ locale, kind: "category", slug: localized(category, locale).slug }) }) {
  const ui = copy[locale]; const content = localized(category, locale);
  const articles = articlesFor(model, locale).filter((article) => article.primaryCategory === category.id);
  const featured = articles[0];
  const formats = [...new Set(articles.map((article) => article.format))];
  const levels = [...new Set(articles.map((article) => article.level))];
  const filterLink = (name, value) => `${href(outputPath, blogRoute({ locale, kind: "browse" }))}?${name}=${encodeURIComponent(value)}`;
  const mainHtml = `${renderBreadcrumbs({ locale, outputPath, items: [{ label: ui.home, outputPath: blogRoute({ locale, kind: "home" }) }, { label: content.name }] })}<section class="shell" data-category-page><p>${text(ui.category)}</p><h1 id="page-title">${text(content.name)}</h1><p>${text(content.description)}</p><nav data-category-facets aria-label="${text(content.name)}"><section><h2>${text(ui.formats)}</h2><ul>${formats.map((value) => `<li><a href="${escapeAttribute(filterLink("format", value))}">${text(dimension(value, locale))}</a></li>`).join("")}</ul></section><section><h2>${text(ui.levels)}</h2><ul>${levels.map((value) => `<li><a href="${escapeAttribute(filterLink("level", value))}">${text(dimension(value, locale))}</a></li>`).join("")}</ul></section></nav>${featured ? `<section data-category-featured><h2>${text(ui.featuredInCategory)}</h2>${renderArticleCard({ model, locale, outputPath, article: featured })}</section>` : ""}<section data-category-remaining><h2>${text(ui.remainingInCategory)}</h2>${cards({ model, locale, outputPath, articles: articles.slice(1) })}</section></section>`;
  const peer = localized(category, otherLocale(locale));
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: peer ? blogRoute({ locale: otherLocale(locale), kind: "category", slug: peer.slug }) : null, title: content.name, description: content.description, mainHtml });
}

export function renderTagPage({ model, template, locale, tag, outputPath = blogRoute({ locale, kind: "tag", slug: localized(tag, locale).slug }) }) {
  const ui = copy[locale]; const content = localized(tag, locale);
  const articles = articlesFor(model, locale).filter((article) => article.tags.includes(tag.id));
  const categories = [...new Set(articles.map((article) => article.primaryCategory))].map((id) => model.byId.category.get(id)).sort((left, right) => left.order - right.order);
  const mainHtml = `${renderBreadcrumbs({ locale, outputPath, items: [{ label: ui.home, outputPath: blogRoute({ locale, kind: "home" }) }, { label: content.name }] })}<section class="shell" data-tag-page><p><a data-tag-index-link href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "tags" })))}">${text(ui.backToTagIndex)}</a></p><p>${text(ui.tag)}</p><h1 id="page-title">${text(content.name)}</h1>${content.description ? `<p>${text(content.description)}</p>` : ""}<nav data-tag-categories aria-label="${text(ui.relatedCategories)}"><h2>${text(ui.relatedCategories)}</h2><ul>${categories.map((category) => { const item = localized(category, locale); return `<li><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "category", slug: item.slug })))}">${text(item.name)}</a></li>`; }).join("")}</ul></nav>${cards({ model, locale, outputPath, articles })}</section>`;
  const peer = localized(tag, otherLocale(locale));
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: peer ? blogRoute({ locale: otherLocale(locale), kind: "tag", slug: peer.slug }) : null, title: content.name, description: content.description ?? content.name, mainHtml });
}

function seriesEntries(model, series, locale) {
  const publicArticleIds = new Set((model.publicArticles ?? []).map((article) => article.id));
  return (Array.isArray(series?.articleIds) ? series.articleIds : []).map((id) => model.byId.article.get(id)).filter((article) => publicArticleIds.has(article?.id) && localized(article, locale));
}

export function renderSeriesPage({ model, template, locale, series, outputPath = blogRoute({ locale, kind: "series", slug: localized(series, locale).slug }) }) {
  const ui = copy[locale]; const content = localized(series, locale); const entries = seriesEntries(model, series, locale); const audiences = Array.isArray(series.audiences) ? series.audiences : [];
  const total = entries.reduce((sum, article) => sum + article.readingMinutes[locale], 0);
  const mainHtml = `${renderBreadcrumbs({ locale, outputPath, items: [{ label: ui.home, outputPath: blogRoute({ locale, kind: "home" }) }, { label: content.title }] })}<section class="shell" data-series-page><h1 id="page-title">${text(content.title)}</h1><p>${text(content.description)}</p><dl><dt>${text(ui.audience)}</dt><dd>${audiences.map((value) => text(dimension(value, locale))).join(", ")}</dd><dt>${text(ui.level)}</dt><dd>${text(dimension(series.level, locale))}</dd><dt>${text(ui.totalReading)}</dt><dd>${total} ${text(ui.read)}</dd></dl><ol data-series-entries>${entries.map((article) => `<li>${renderArticleCard({ model, locale, outputPath, article })}</li>`).join("")}</ol></section>`;
  const peer = localized(series, otherLocale(locale));
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: peer ? blogRoute({ locale: otherLocale(locale), kind: "series", slug: peer.slug }) : null, title: content.title, description: content.description, mainHtml });
}

export function renderAuthorsPage({ model, template, locale, outputPath = blogRoute({ locale, kind: "authors" }) }) {
  const ui = copy[locale]; const authors = model.authors.filter((author) => localized(author, locale)).sort((a, b) => localized(a, locale).name.localeCompare(localized(b, locale).name, locale));
  const expertise = [...new Set(authors.flatMap((author) => author.expertise ?? []))].sort();
  const mainHtml = `<section class="shell" data-authors-page data-author-directory><h1 id="page-title">${text(ui.authors)}</h1><label>${text(ui.authorSearch)} <input type="search" data-author-query /></label><label>${text(ui.authorExpertise)} <select data-author-expertise><option value="">${text(ui.authorExpertise)}</option>${expertise.map((value) => `<option value="${escapeAttribute(value)}">${text(expertiseLabel(model, value, locale))}</option>`).join("")}</select></label><p data-author-result-count aria-live="polite"></p><div class="author-grid">${authors.map((author) => renderAuthorCard({ model, locale, outputPath, author })).join("")}</div></section>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: blogRoute({ locale: otherLocale(locale), kind: "authors" }), title: ui.authors, description: ui.authors, mainHtml });
}

export function renderAuthorPage({ model, template, locale, author, outputPath = blogRoute({ locale, kind: "author", slug: localized(author, locale).slug }) }) {
  const ui = copy[locale]; const content = localized(author, locale);
  const authored = articlesFor(model, locale).filter((article) => article.primaryAuthor === author.id || article.coAuthors?.includes(author.id));
  const reviewed = articlesFor(model, locale).filter((article) => article.reviewer === author.id);
  const topics = [...new Set(authored.flatMap((article) => article.tags))].map((id) => localized(tagFor(model, id), locale)?.name).filter(Boolean);
  const expertise = (Array.isArray(author.expertise) ? author.expertise : []).map((value) => expertiseLabel(model, value, locale));
  const guideCount = authored.filter((article) => article.format === "guide").length;
  const seriesCount = new Set(authored.map((article) => article.series).filter(Boolean)).size;
  const mainHtml = `${renderBreadcrumbs({ locale, outputPath, items: [{ label: ui.authors, outputPath: blogRoute({ locale, kind: "authors" }) }, { label: content.name }] })}<section class="shell" data-author-page><img src="${escapeAttribute(asset(outputPath, author.portrait))}" alt="${escapeAttribute(content.name)}" /><h1 id="page-title">${text(content.name)}</h1><p>${text(content.role)}</p><p>${text(content.bio)}</p><h2>${text(ui.credentials)}</h2><ul>${content.credentials.map((credential) => `<li>${text(credential)}</li>`).join("")}</ul><section data-author-profile-expertise><h2>${text(ui.topics)}</h2><p>${expertise.map(text).join(", ")}</p></section>${renderProfessionalLinks({ author, locale })}<dl data-author-counts><dt>${text(ui.articles)}</dt><dd>${authored.length}</dd><dt>${text(ui.guides)}</dt><dd>${guideCount}</dd><dt>${text(ui.seriesCount)}</dt><dd>${seriesCount}</dd></dl><h2>${text(ui.featuredWork)}</h2>${cards({ model, locale, outputPath, articles: authored.slice(0, 1) })}<h2>${text(ui.latestWork)}</h2>${cards({ model, locale, outputPath, articles: authored })}<h2>${text(ui.topics)}</h2><p>${topics.map(text).join(", ")}</p>${reviewed.length ? `<section data-reviewed-content><h2>${text(ui.reviewedWork)}</h2>${cards({ model, locale, outputPath, articles: reviewed })}</section>` : ""}</section>${renderNewsletterPanel({ locale })}`;
  const peer = localized(author, otherLocale(locale));
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: peer ? blogRoute({ locale: otherLocale(locale), kind: "author", slug: peer.slug }) : null, title: content.name, description: content.bio, mainHtml });
}

function relatedArticles(model, article, locale) {
  const available = articlesFor(model, locale).filter((candidate) => candidate.id !== article.id);
  const related = []; const add = (candidate) => { if (candidate && candidate.id !== article.id && !related.some((item) => item.id === candidate.id)) related.push(candidate); };
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

function anchorRenderedHeadings(html) {
  const headings = [];
  const anchoredHtml = html.replace(/<section class="([^"]+)"><h2>([\s\S]*?)<\/h2>/gu, (match, classes, label) => {
    const id = `section-${headings.length + 1}`;
    headings.push({ id, label });
    return `<section class="${classes}" id="${id}"><h2>${label}</h2>`;
  });
  return { html: anchoredHtml, headings };
}

export function renderArticlePage({ model, template, locale, article, outputPath = articleRoute(article, locale) }) {
  const ui = copy[locale]; const content = localized(article, locale); const category = localized(categoryFor(model, article), locale); const author = authorFor(model, article.primaryAuthor); const authorContent = localized(author, locale);
  const reviewer = article.reviewer ? localized(authorFor(model, article.reviewer), locale) : null;
  const hero = `<figure class="article-hero"><img src="${escapeAttribute(asset(outputPath, article.hero.src))}" alt="${escapeAttribute(article.hero.decorative ? "" : article.hero.alt[locale])}" /></figure>`;
  const metadata = `<div class="article-meta"><p data-article-author>${text(ui.by)} ${text(authorContent.name)}${article.coAuthors?.length ? `, ${article.coAuthors.map((id) => text(localized(authorFor(model, id), locale).name)).join(", ")}` : ""}</p>${reviewer ? `<p>${text(ui.reviewedBy)} ${text(reviewer.name)}</p>` : ""}<p><span>${text(ui.published)} </span>${time(article.publishedAt, locale)}</p><p><span>${text(ui.updated)} </span><time itemprop="dateModified" datetime="${escapeAttribute(article.editedAt.toISOString())}">${text(dateLabel(article.editedAt, locale))}</time></p><meta itemprop="datePublished" content="${escapeAttribute(article.publishedAt.toISOString())}" /><p>${labelsFor(article, locale)}</p></div>`;
  const tags = article.tags.map((id) => { const tag = localized(tagFor(model, id), locale); return `<li><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "tag", slug: tag.slug })))}">${text(tag.name)}</a></li>`; }).join("");
  const body = renderBlocks(content.blocks, { locale, resolveAsset: (source) => asset(outputPath, source), consultation: article.relatedService ? { serviceId: article.relatedService } : null });
  const anchored = anchorRenderedHeadings(body);
  const returnPath = `${outputPath}?commenter=demo#comments`;
  const signInHref = `${href(outputPath, "sign-in.html")}?return=${encodeURIComponent(returnPath)}`;
  const toc = anchored.headings.map((heading, index) => `<li${index === 0 ? " data-toc-current" : ""}><a href="#${heading.id}">${heading.label}</a></li>`).join("");
  const comments = `<section id="comments" data-demo-comments data-prototype="true" data-demo-comment-state="signed-out"><h2>${text(ui.comments)}</h2><p>${text(ui.commentsBody)}</p><p lang="en" data-demo-comment-notice>${text(ui.demoCommentNotice)}</p><div data-demo-comment-signed-out><a data-demo-comment-sign-in href="${escapeAttribute(signInHref)}">${text(ui.signInToComment)}</a><a data-demo-comment-preview href="?commenter=demo#comments">${text(ui.previewSignedIn)}</a></div><form data-demo-comment-form hidden><label for="demo-comment">${text(ui.addComment)}</label><textarea id="demo-comment" name="comment" minlength="2" maxlength="2000" required aria-describedby="demo-comment-guidance demo-comment-status"></textarea><p id="demo-comment-guidance">${text(ui.commentGuidance)}</p><button type="submit">${text(ui.submitComment)}</button></form><p data-demo-comment-status role="status" aria-live="polite"></p><ol data-demo-comment-list></ol></section>`;
  const mainHtml = `${renderBreadcrumbs({ locale, outputPath, items: [{ label: ui.home, outputPath: blogRoute({ locale, kind: "home" }) }, { label: category.name, outputPath: blogRoute({ locale, kind: "category", slug: category.slug }) }, { label: content.title }] })}<article class="shell article-page" data-article-page itemscope itemtype="https://schema.org/Article"><header><p>${text(category.name)} · ${text(dimension(article.level, locale))}</p><h1 id="page-title" itemprop="headline">${text(content.title)}</h1><p itemprop="description">${text(content.summary)}</p>${metadata}${hero}<div class="article-tools"><button type="button" data-copy-link>${text(ui.copyLink)}</button><button type="button" data-print-article>${text(ui.print)}</button><p data-article-tools-status role="status" aria-live="polite"></p></div></header><aside data-article-toc><h2>${text(ui.tableOfContents)}</h2><ol>${toc}</ol></aside><div class="article-body" itemprop="articleBody">${anchored.html}</div><section data-article-tags><h2>${text(ui.tags)}</h2><ul>${tags}</ul></section>${article.correctionNote?.[locale] ? `<p data-correction-note>${text(article.correctionNote[locale])}</p>` : ""}${renderSeriesNavigation({ model, article, locale, outputPath })}<section data-related-content><h2>${text(ui.related)}</h2>${cards({ model, locale, outputPath, articles: relatedArticles(model, article, locale) })}</section>${renderNewsletterPanel({ locale })}${comments}</article>`;
  const peer = articleRoute(article, otherLocale(locale)) ?? (locale === "en" ? blogRoute({ locale: "he", kind: "article", slug: content.slug }) : null);
  const canonicalUrl = new URL(outputPath.replace(/index\.html$/u, ""), `${model.settings.siteOrigin}/`).href;
  const authorUrl = new URL(blogRoute({ locale, kind: "author", slug: authorContent.slug }).replace(/index\.html$/u, ""), `${model.settings.siteOrigin}/`).href;
  const categoryUrl = new URL(blogRoute({ locale, kind: "category", slug: category.slug }).replace(/index\.html$/u, ""), `${model.settings.siteOrigin}/`).href;
  const homeUrl = new URL(blogRoute({ locale, kind: "home" }).replace(/index\.html$/u, ""), `${model.settings.siteOrigin}/`).href;
  const structuredData = [
    { ...articleStructuredData({ article, locale, canonicalUrl }), image: new URL(article.hero.src, `${model.settings.siteOrigin}/`).href, author: { "@type": "Person", name: authorContent.name, url: authorUrl } },
    { "@context": "https://schema.org", "@type": "Person", name: authorContent.name, description: authorContent.role, url: authorUrl },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: copy[locale].home, item: homeUrl }, { "@type": "ListItem", position: 2, name: category.name, item: categoryUrl }, { "@type": "ListItem", position: 3, name: content.title, item: canonicalUrl }] },
    { "@context": "https://schema.org", "@type": "Organization", name: "Positivus", url: model.settings.siteOrigin }
  ];
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: peer, title: content.title, description: content.summary, mainHtml, structuredData, socialImage: article.hero.src, socialType: "article" });
}

export function renderSearchFallbackPage({ model, template, locale, outputPath = blogRoute({ locale, kind: "browse" }) }) {
  const ui = copy[locale];
  const mainHtml = `<section class="shell" data-blog-search-fallback><h1 id="page-title">${text(ui.noResults)}</h1><p>${text(ui.noResultsBody)}</p>${renderSearch({ locale, outputPath })}</section>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: blogRoute({ locale: otherLocale(locale), kind: "browse" }), title: ui.noResults, description: ui.noResultsBody, mainHtml, robots: "noindex, follow" });
}

/** Render a no-script entry point for the shared site search. */
export function renderSiteSearchFallbackPage({ model, template, locale, outputPath = locale === "he" ? "he/search/index.html" : "search/index.html" }) {
  const ui = copy[locale];
  const services = href(outputPath, "index.html#services");
  const cases = href(outputPath, "index.html#use-cases");
  const blog = href(outputPath, blogRoute({ locale, kind: "home" }));
  const mainHtml = `<section class="shell" data-site-search-fallback><h1 id="page-title">${text(ui.siteSearch)}</h1><p>${text(ui.siteSearchBody)}</p><form action="${escapeAttribute(href(outputPath, outputPath))}" method="get" role="search"><label for="site-search-fallback-input">${text(ui.siteSearch)}</label><input id="site-search-fallback-input" name="q" type="search" /><button type="submit">${text(ui.siteSearch)}</button></form><nav aria-label="${text(ui.siteSearch)}"><ul><li><a href="${escapeAttribute(services)}">${text(ui.services)}</a></li><li><a href="${escapeAttribute(cases)}">${text(ui.useCases)}</a></li><li><a href="${escapeAttribute(blog)}">${text(ui.browse)}</a></li></ul></nav></section>`;
  const alternateOutputPath = locale === "he" ? "search/index.html" : "he/search/index.html";
  return documentPage({ model, template, locale, outputPath, alternateOutputPath, title: ui.siteSearch, description: ui.siteSearchBody, mainHtml, bodyClass: "blog-page site-search-page", robots: "noindex, follow" });
}

export function renderMissingTranslationPage({ model, template, article, outputPath }) {
  const locale = "he"; const ui = copy.he; const englishRoute = articleRoute(article, "en");
  const mainHtml = `<section class="shell" data-missing-translation><h1 id="page-title">${text(ui.unavailable)}</h1><p>${text(ui.unavailable)}</p><p><a href="${escapeAttribute(href(outputPath, englishRoute))}">${text(ui.availableEnglish)}</a></p><p><a href="${escapeAttribute(href(outputPath, blogRoute({ locale, kind: "home" })))}">${text(ui.backToBlog)}</a></p></section>`;
  return documentPage({ model, template, locale, outputPath, alternateOutputPath: englishRoute, title: ui.unavailable, description: ui.unavailable, mainHtml, robots: "noindex, follow" });
}
