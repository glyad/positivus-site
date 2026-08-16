import { relativeSitePath } from "./routes.mjs";

const DEFAULT_SITE_ORIGIN = "https://glyad.github.io/positivus-site";

const copy = {
  en: {
    brandHome: "Positivus home",
    home: "Home",
    services: "Services",
    useCases: "Use Cases",
    pricing: "Pricing",
    blog: "Blog",
    search: "Search Positivus",
    requestQuote: "Request a quote",
    signIn: "Sign in",
    skip: "Skip to content",
    navigation: "Primary navigation",
    searchTitle: "Search Positivus",
    searchLabel: "Search the Positivus site",
    close: "Close search",
    footer: "Positivus — practical marketing for sustainable growth."
  },
  he: {
    brandHome: "דף הבית של פוזיטיבוס",
    home: "דף הבית",
    services: "שירותים",
    useCases: "מקרי שימוש",
    pricing: "תמחור",
    blog: "בלוג",
    search: "חיפוש בפוזיטיבוס",
    requestQuote: "בקשת הצעת מחיר",
    signIn: "כניסה",
    skip: "דלגו לתוכן",
    navigation: "ניווט ראשי",
    searchTitle: "חיפוש בפוזיטיבוס",
    searchLabel: "חיפוש באתר פוזיטיבוס",
    close: "סגירת החיפוש",
    footer: "פוזיטיבוס — שיווק מעשי לצמיחה יציבה."
  }
};

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export const escapeAttribute = escapeHtml;

function safeCanonicalPath(value, name) {
  if (typeof value !== "string" || !/^(?:[a-z0-9-]+\/)*$/u.test(value)) {
    throw new TypeError(`${name} must be a safe site path ending in a slash`);
  }
  return value;
}

function siteUrl(siteOrigin, path) {
  let origin;
  try {
    origin = new URL(siteOrigin);
  } catch {
    throw new TypeError("siteOrigin must be a valid HTTPS URL");
  }
  const isRootOrigin = origin.pathname === "/";
  if (origin.protocol !== "https:" || origin.username || origin.password || origin.search || origin.hash || (!isRootOrigin && origin.pathname.endsWith("/"))) {
    throw new TypeError("siteOrigin must be a canonical HTTPS origin or base URL");
  }
  const baseUrl = isRootOrigin ? origin.origin : `${origin.origin}${origin.pathname}`;
  return `${baseUrl}/${safeCanonicalPath(path, "canonical path")}`;
}

function linkTo(outputPath, targetOutputPath, fragment = "") {
  return `${relativeSitePath(outputPath, targetOutputPath)}${fragment}`;
}

function renderHeader({ locale, outputPath, alternatePath }) {
  const text = copy[locale];
  const home = linkTo(outputPath, "index.html");
  const blog = linkTo(outputPath, locale === "he" ? "he/blog/index.html" : "blog/index.html");
  const search = linkTo(outputPath, locale === "he" ? "he/search/index.html" : "search/index.html");
  const signIn = linkTo(outputPath, "sign-in.html");
  const peer = linkTo(outputPath, `${safeCanonicalPath(alternatePath, "alternatePath")}index.html`);
  const label = locale === "he" ? "English" : "עברית";

  return `<header class="site-header blog-site-header">
  <div class="site-header__inner shell">
    <a class="brand" href="${escapeAttribute(home)}" aria-label="${escapeAttribute(text.brandHome)}"><span class="brand__mark icon-mask icon-mask--star" aria-hidden="true"></span><span class="brand__name">Positivus</span></a>
    <nav class="site-nav" aria-label="${escapeAttribute(text.navigation)}">
      <ul class="site-nav__list">
        <li><a href="${escapeAttribute(home)}">${escapeHtml(text.home)}</a></li>
        <li><a href="${escapeAttribute(`${home}#services`)}">${escapeHtml(text.services)}</a></li>
        <li><a href="${escapeAttribute(`${home}#use-cases`)}">${escapeHtml(text.useCases)}</a></li>
        <li><a href="${escapeAttribute(`${home}#pricing`)}">${escapeHtml(text.pricing)}</a></li>
        <li><a href="${escapeAttribute(blog)}" aria-current="page">${escapeHtml(text.blog)}</a></li>
      </ul>
      <a class="site-search-trigger" href="${escapeAttribute(search)}" data-site-search-open>${escapeHtml(text.search)}</a>
      <a class="button button--outline site-nav__cta" href="${escapeAttribute(`${home}#contact`)}">${escapeHtml(text.requestQuote)}</a>
      <a class="site-nav__login" href="${escapeAttribute(signIn)}">${escapeHtml(text.signIn)}</a>
      <a class="language-toggle" href="${escapeAttribute(peer)}" lang="${locale === "he" ? "en" : "he"}">${escapeHtml(label)}</a>
    </nav>
  </div>
  <dialog data-site-search-dialog aria-labelledby="site-search-title">
    <form method="dialog"><button type="submit" aria-label="${escapeAttribute(text.close)}">×</button></form>
    <h2 id="site-search-title">${escapeHtml(text.searchTitle)}</h2>
    <form action="${escapeAttribute(search)}" role="search"><label for="site-search-input">${escapeHtml(text.searchLabel)}</label><input id="site-search-input" name="q" type="search" data-site-search-input /><button type="submit">${escapeHtml(text.search)}</button></form>
    <div data-site-search-status aria-live="polite"></div><div data-site-search-results></div>
  </dialog>
</header>`;
}

function renderFooter(locale) {
  return `<footer class="site-footer"><div class="shell"><p>${escapeHtml(copy[locale].footer)}</p></div></footer>`;
}

function renderStructuredData(structuredData) {
  return structuredData.map((item) => {
    const json = JSON.stringify(item).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026");
    return `<script type="application/ld+json">${json}</script>`;
  }).join("\n");
}

function renderScripts(outputPath, scripts) {
  const paths = ["js/site-search.js", "js/blog.js", ...scripts.map((script) => typeof script === "string" ? script : script.src)];
  return paths.map((path) => {
    if (typeof path !== "string" || !/^[A-Za-z0-9_./-]+\.js$/u.test(path) || path.includes("..")) {
      throw new TypeError("scripts must use safe local JavaScript paths");
    }
    return `<script type="module" src="${escapeAttribute(linkTo(outputPath, path))}"></script>`;
  }).join("\n");
}

/** Compose a safe, locale-aware shared document around trusted rendered markup. */
export function renderDocument({
  template,
  locale,
  outputPath,
  title,
  description,
  canonicalPath,
  alternatePath,
  bodyClass,
  mainHtml,
  structuredData = [],
  scripts = [],
  siteOrigin = DEFAULT_SITE_ORIGIN
}) {
  if (!(locale in copy)) throw new TypeError("locale must be en or he");
  if (typeof template !== "string" || typeof mainHtml !== "string") throw new TypeError("template and mainHtml must be strings");
  if (!Array.isArray(structuredData) || !Array.isArray(scripts)) throw new TypeError("structuredData and scripts must be arrays");

  const canonicalUrl = siteUrl(siteOrigin, canonicalPath);
  const alternateUrl = siteUrl(siteOrigin, alternatePath);
  const asset = (path) => linkTo(outputPath, path);
  const text = copy[locale];
  const otherLocale = locale === "en" ? "he" : "en";
  const head = `<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="${escapeAttribute(description)}" />
<title>${escapeHtml(title)} — Positivus</title>
<link rel="icon" href="${escapeAttribute(asset("assets/icons/star.svg"))}" type="image/svg+xml" />
<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />
<link rel="alternate" hreflang="${otherLocale}" href="${escapeAttribute(alternateUrl)}" />
<link rel="alternate" hreflang="${locale}" href="${escapeAttribute(canonicalUrl)}" />
<link rel="stylesheet" href="${escapeAttribute(asset("css/main.css"))}" />
<link rel="stylesheet" href="${escapeAttribute(asset("css/blog.css"))}" />
${renderStructuredData(structuredData)}`;
  const replacements = {
    "%%HTML_ATTRIBUTES%%": `lang="${locale}" dir="${locale === "he" ? "rtl" : "ltr"}"`,
    "%%HEAD%%": head,
    "%%BODY_CLASS%%": escapeAttribute(bodyClass),
    "%%SKIP_LINK%%": `<a class="skip-link" href="#main-content">${escapeHtml(text.skip)}</a>`,
    "%%HEADER%%": renderHeader({ locale, outputPath, alternatePath }),
    "%%MAIN%%": mainHtml,
    "%%FOOTER%%": renderFooter(locale),
    "%%SCRIPTS%%": renderScripts(outputPath, scripts)
  };
  let document = template;
  for (const [sentinel, value] of Object.entries(replacements)) document = document.replaceAll(sentinel, value);
  if (document.includes("%%")) throw new Error("Rendered document contains an unresolved template sentinel");
  return document;
}
