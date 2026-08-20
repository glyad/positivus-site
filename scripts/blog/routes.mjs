import { dirname, relative } from "node:path/posix";

const LOCALES = new Set(["en", "he"]);
const KINDS = new Set([
  "home",
  "browse",
  "tags",
  "category",
  "tag",
  "series",
  "authors",
  "author",
  "article"
]);
const SLUG_KINDS = new Set(["category", "tag", "series", "author", "article"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

function assertOutputPath(path, name) {
  if (typeof path !== "string" || !path || path.startsWith("/") || path.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new TypeError(`${name} must be a safe path relative to dist`);
  }
}

/** Return the stable, locale-aware HTML output path for a blog page. */
export function blogRoute({ locale, kind, slug = "" }) {
  if (!LOCALES.has(locale)) throw new TypeError("locale must be en or he");
  if (!KINDS.has(kind)) throw new TypeError("kind must be a supported blog route");
  if (SLUG_KINDS.has(kind) && (typeof slug !== "string" || !SLUG_PATTERN.test(slug))) {
    throw new TypeError(`${kind} routes require a lowercase kebab-case slug`);
  }

  const prefix = locale === "he" ? "he/blog" : "blog";
  const patterns = {
    home: `${prefix}/index.html`,
    browse: `${prefix}/search/index.html`,
    tags: `${prefix}/tags/index.html`,
    category: `${prefix}/category/${slug}/index.html`,
    tag: `${prefix}/tag/${slug}/index.html`,
    series: `${prefix}/series/${slug}/index.html`,
    authors: `${prefix}/authors/index.html`,
    author: `${prefix}/authors/${slug}/index.html`,
    article: `${prefix}/${slug}/index.html`
  };

  return patterns[kind];
}

/** Return an emitted, no-script fallback route for a numbered Blog browse page. */
export function blogBrowsePageRoute({ locale, page = 1 }) {
  if (!LOCALES.has(locale)) throw new TypeError("locale must be en or he");
  if (!Number.isSafeInteger(page) || page < 1) throw new TypeError("page must be a positive integer");
  if (page === 1) return blogRoute({ locale, kind: "browse" });
  const prefix = locale === "he" ? "he/blog" : "blog";
  return `${prefix}/search/page/${page}/index.html`;
}

/** Resolve a GitHub Pages-safe link between two emitted files. */
export function relativeSitePath(fromOutputPath, targetOutputPath) {
  assertOutputPath(fromOutputPath, "fromOutputPath");
  assertOutputPath(targetOutputPath, "targetOutputPath");
  return relative(dirname(fromOutputPath), targetOutputPath) || "./";
}
