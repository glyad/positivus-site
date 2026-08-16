import assert from "node:assert/strict";
import test from "node:test";

import { blogRoute, relativeSitePath } from "../scripts/blog/routes.mjs";
import { renderDocument } from "../scripts/blog/render-shell.mjs";

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
  assert.match(html, /<nav[^>]+aria-label="ניווט ראשי"/);
  assert.match(html, /data-site-search-dialog/);
  assert.match(html, /<main id="main-content">/);
  assert.match(html, /מרכז &lt;הידע&gt;/);
  assert.match(html, /תובנות &amp; שימושיות/);
  assert.doesNotMatch(html, /class="[^"]*"\s+onload=/);
  assert.doesNotMatch(html, /%%/);
  assert.doesNotMatch(html, /<Knowledge Hub>/);
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
