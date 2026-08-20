import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import { repositoryRoot } from "../scripts/build.mjs";
import { blogBrowsePageRoute, blogRoute, relativeSitePath } from "../scripts/blog/routes.mjs";
import { renderDocument } from "../scripts/blog/render-shell.mjs";
import { renderBlogSite } from "../scripts/blog/render-site.mjs";
import { loadRepositoryBlogModel } from "./helpers/blog-fixture.mjs";

const template = `<!doctype html>
<html %%HTML_ATTRIBUTES%%>
  <head>%%HEAD%%</head>
  <body class="%%BODY_CLASS%%">%%SKIP_LINK%%%%HEADER%%<main id="main-content">%%MAIN%%</main>%%FOOTER%%%%SCRIPTS%%</body>
</html>`;

test("maps English and Hebrew blog peers to stable nested routes", () => {
  assert.equal(blogRoute({ locale: "en", kind: "home" }), "blog/index.html");
  assert.equal(blogRoute({ locale: "en", kind: "article", slug: "seo-audit" }), "blog/seo-audit/index.html");
  assert.equal(blogRoute({ locale: "he", kind: "article", slug: "seo-audit" }), "he/blog/seo-audit/index.html");
  assert.equal(blogRoute({ locale: "he", kind: "authors" }), "he/blog/authors/index.html");
  assert.equal(blogBrowsePageRoute({ locale: "en", page: 2 }), "blog/search/page/2/index.html");
  assert.equal(blogBrowsePageRoute({ locale: "he", page: 2 }), "he/blog/search/page/2/index.html");
  assert.equal(relativeSitePath("he/blog/seo-audit/index.html", "index.html"), "../../../index.html");
  assert.equal(relativeSitePath("blog/index.html", "he/blog/index.html"), "../he/blog/index.html");
});

test("renders a safe Hebrew document with localized metadata, landmarks, and depth-correct shared resources", () => {
  const html = renderDocument({
    template,
    locale: "he",
    outputPath: "he/blog/index.html",
    title: "מרכז <הידע>",
    description: "תובנות & שימושיות",
    canonicalPath: "he/blog/",
    alternatePath: "blog/",
    bodyClass: "blog-page\" onload=alert(1)",
    mainHtml: '<h1 id="page-title">מרכז הידע</h1>',
    structuredData: [{ "@context": "https://schema.org", name: "<Knowledge Hub>" }]
  });

  assert.match(html, /lang="he" dir="rtl"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/glyad\.github\.io\/positivus-site\/he\/blog\/"/);
  assert.match(html, /<link rel="alternate" hreflang="en" href="https:\/\/glyad\.github\.io\/positivus-site\/blog\/"/);
  assert.match(html, /<link rel="alternate" hreflang="he" href="https:\/\/glyad\.github\.io\/positivus-site\/he\/blog\/"/);
  assert.match(html, /href="\.\.\/\.\.\/css\/main\.css"/);
  assert.match(html, /href="\.\.\/\.\.\/css\/blog\.css"/);
  assert.match(html, /src="\.\.\/\.\.\/js\/site-search\.js"/);
  assert.match(html, /src="\.\.\/\.\.\/js\/blog\.js"/);
  assert.match(html, /href="\.\.\/\.\.\/index\.html"/);
  assert.match(html, /aria-label="דף הבית של פוזיטיבוס"/);
  assert.match(html, /<nav[^>]+aria-label="ניווט ראשי"/);
  assert.match(html, /data-site-search-dialog/);
  assert.match(html, /<main id="main-content">/);
  assert.match(html, /מרכז &lt;הידע&gt;/);
  assert.match(html, /תובנות &amp; שימושיות/);
  assert.doesNotMatch(html, /class="[^"]*"\s+onload=/);
  assert.doesNotMatch(html, /%%/);
  assert.doesNotMatch(html, /<Knowledge Hub>/);
});

test("uses a canonical root origin without adding an extra slash", () => {
  const html = renderDocument({
    template,
    locale: "en",
    outputPath: "blog/index.html",
    title: "Knowledge Hub",
    description: "Practical marketing insights.",
    canonicalPath: "blog/",
    alternatePath: "he/blog/",
    bodyClass: "blog-page",
    mainHtml: "<h1>Knowledge Hub</h1>",
    siteOrigin: "https://content.example"
  });

  assert.match(html, /<link rel="canonical" href="https:\/\/content\.example\/blog\/"/);
  assert.match(html, /<link rel="alternate" hreflang="he" href="https:\/\/content\.example\/he\/blog\/"/);
});

test("omits language navigation and reciprocal alternate metadata when no peer is emitted", () => {
  const html = renderDocument({
    template,
    locale: "en",
    outputPath: "blog/authors/solo-author/index.html",
    title: "Solo author",
    description: "English-only author profile.",
    canonicalPath: "blog/authors/solo-author/",
    alternatePath: null,
    bodyClass: "blog-page",
    mainHtml: "<h1>Solo author</h1>"
  });

  assert.match(html, /<link rel="alternate" hreflang="en"/);
  assert.doesNotMatch(html, /hreflang="he"/);
  assert.doesNotMatch(html, /class="language-toggle"/);
});

test("emits injected bilingual settings into temporary localized Blog Home files", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-shell-"));
  const pages = await renderBlogSite({
    model,
    sourceDir: resolve(repositoryRoot, "sources"),
    outputDir,
    version: "test-shell-1"
  });

  assert.ok(pages.includes("blog/index.html"));
  assert.ok(pages.includes("he/blog/index.html"));
  assert.ok(pages.includes("blog/search/index.html"));
  assert.ok(pages.includes("he/blog/analytics-attribution-models/index.html"));
  const [english, hebrew] = await Promise.all([
    readFile(resolve(outputDir, "blog/index.html"), "utf8"),
    readFile(resolve(outputDir, "he/blog/index.html"), "utf8")
  ]);
  assert.match(english, /data-build-version="test-shell-1"/);
  assert.match(english, /href="https:\/\/glyad\.github\.io\/positivus-site\/blog\/"/);
  assert.match(hebrew, /lang="he" dir="rtl"/);
  assert.match(hebrew, /href="https:\/\/glyad\.github\.io\/positivus-site\/he\/blog\/"/);
  assert.doesNotMatch(english, /%%/);
  assert.doesNotMatch(hebrew, /%%/);
});

test("rejects rendered documents with unknown template sentinels", () => {
  assert.throws(
    () => renderDocument({
      template: `${template}%%UNKNOWN%%`,
      locale: "en",
      outputPath: "blog/index.html",
      title: "Knowledge Hub",
      description: "Practical marketing insights.",
      canonicalPath: "blog/",
      alternatePath: "he/blog/",
      bodyClass: "blog-page",
      mainHtml: "<h1>Knowledge Hub</h1>"
    }),
    /unresolved template sentinel/i
  );
});
