import { dirname, relative } from "node:path/posix";

const LOCALES = new Set(["en", "he"]);
const KINDS = new Set([
  "home",
  "browse",
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
    category: `${prefix}/category/${slug}/index.html`,
    tag: `${prefix}/tag/${slug}/index.html`,
    series: `${prefix}/series/${slug}/index.html`,
    authors: `${prefix}/authors/index.html`,
    author: `${prefix}/authors/${slug}/index.html`,
    article: `${prefix}/${slug}/index.html`
  };

  return patterns[kind];
}

/** Resolve a GitHub Pages-safe link between two emitted files. */
export function relativeSitePath(fromOutputPath, targetOutputPath) {
  assertOutputPath(fromOutputPath, "fromOutputPath");
  assertOutputPath(targetOutputPath, "targetOutputPath");
  return relative(dirname(fromOutputPath), targetOutputPath) || "./";
}
