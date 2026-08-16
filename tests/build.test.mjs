import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import { buildSite, repositoryRoot } from "../scripts/build.mjs";

test("build creates the deployable static site", async () => {
  const outputDir = await buildSite();

  for (const file of [
    "index.html",
    "sign-in.html",
    "sign-up.html",
    "verify-email.html",
    "account.html",
    "css/main.css",
    "css/blog.css",
    "js/main.js",
    "js/auth.js",
    "js/site-search.js",
    "js/site-search-core.mjs",
    "assets/images/decor/contact-illustration.svg",
    "blog/index.html",
    "he/blog/index.html",
    "search/index.html",
    "he/search/index.html",
    "manifest.json",
  ]) {
    assert.equal((await stat(resolve(outputDir, file))).isFile(), true);
  }

  const stylesheet = await readFile(resolve(outputDir, "css/main.css"), "utf8");
  assert.match(stylesheet, /html\[dir="rtl"\] \.contact-panel__image/);

  const html = await readFile(resolve(outputDir, "index.html"), "utf8");
  assert.match(html, /css\/main\.css/);
  assert.match(html, /js\/main\.js/);
  assert.match(html, /href="blog\/index\.html">Blog<\/a>/);
  assert.match(html, /href="search\/index\.html" data-site-search-open/);
  assert.match(html, /data-site-search-dialog/);
  assert.match(html, /data-site-search-index="search-index-en\.json"/);
  assert.match(html, /data-site-search-topics-en="blog\/tags\/index\.html"/);
  assert.match(html, /data-site-search-services-en="index\.html#services"/);
  assert.match(html, /Request a quote/);

  const authHtml = await readFile(resolve(outputDir, "sign-up.html"), "utf8");
  assert.match(authHtml, /data-auth-page="sign-up"/);
  assert.match(authHtml, /autocomplete="new-password"/);
  assert.doesNotMatch(authHtml, /%%(?:TITLE|PAGE|AUTH_NAV|CONTENT)%%/);

  const blogHtml = await readFile(resolve(outputDir, "he/blog/index.html"), "utf8");
  assert.match(blogHtml, /lang="he" dir="rtl"/);
  assert.match(blogHtml, /href="\.\.\/\.\.\/css\/blog\.css"/);
  assert.match(blogHtml, /<form action="search\/index\.html" method="get" role="search"/);
  assert.match(blogHtml, /data-site-search-dialog/);
  assert.match(blogHtml, /data-site-search-index="\.\.\/\.\.\/search-index-he\.json"/);
  assert.match(blogHtml, /data-site-search-topics-he="tags\/index\.html"/);
  assert.match(blogHtml, /Request a quote|בקשת הצעת מחיר/);
  assert.doesNotMatch(blogHtml, /%%/);

  const fallbackHtml = await readFile(resolve(outputDir, "search/index.html"), "utf8");
  assert.match(fallbackHtml, /data-site-search-fallback/);
  assert.match(fallbackHtml, /action="index\.html" method="get" role="search"/);
});

test("blog pages load the editorial stylesheet after shared styles without leaking it to landing pages", async () => {
  const outputDir = await buildSite();
  const [blogHtml, landingHtml, blogStyles] = await Promise.all([
    readFile(resolve(outputDir, "blog/index.html"), "utf8"),
    readFile(resolve(outputDir, "index.html"), "utf8"),
    readFile(resolve(outputDir, "css/blog.css"), "utf8")
  ]);

  assert.ok(
    blogHtml.indexOf('href="../css/main.css"') < blogHtml.indexOf('href="../css/blog.css"'),
    "blog pages must layer blog.css after main.css"
  );
  assert.doesNotMatch(landingHtml, /css\/blog\.css/);
  assert.match(blogStyles, /\.blog-card\s*\{[\s\S]*border-radius:\s*var\(--radius-card\)/);
  assert.match(blogStyles, /\.blog-card\s*\{[\s\S]*box-shadow:\s*var\(--shadow-card\)/);
  assert.match(blogStyles, /\.article-body\s*\{[\s\S]*max-inline-size:\s*70ch/);
  assert.match(blogStyles, /@media\s*\(max-width:\s*759px\)[\s\S]*\[data-filter-drawer\]/);
  assert.match(blogStyles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(blogStyles, /@media\s+print/);
});

test("Blog shell keeps closed search hidden and renders compact navigation and TOC controls", async () => {
  const outputDir = await buildSite();
  const [blogHtml, articleHtml, blogStyles] = await Promise.all([
    readFile(resolve(outputDir, "blog/index.html"), "utf8"),
    readFile(resolve(outputDir, "blog/seo-audit-90-minutes/index.html"), "utf8"),
    readFile(resolve(outputDir, "css/blog.css"), "utf8")
  ]);

  assert.match(blogHtml, /data-menu-toggle[^>]*aria-controls="blog-site-navigation"/);
  assert.match(blogHtml, /<nav class="site-nav" id="blog-site-navigation"[^>]*data-nav/);
  assert.match(blogHtml, /data-nav-backdrop/);
  assert.match(articleHtml, /<details data-article-toc open><summary>[^<]+<\/summary>/);
  assert.match(blogStyles, /\[data-site-search-dialog\]:not\(\[open\]\)\s*\{\s*display:\s*none/);
  assert.match(blogStyles, /\[data-site-search-dialog\]\[open\]\s*\{\s*display:\s*grid/);
  assert.match(blogStyles, /\[data-series-entries\]\s*\{[\s\S]*display:\s*grid/);
  assert.match(blogStyles, /\[data-active-filters\] button\s*\{[\s\S]*min-block-size:\s*44px/);
  assert.match(blogStyles, /\.article-block--faq summary\s*\{[\s\S]*min-block-size:\s*44px/);
});

test("build manifest tracks the package version", async () => {
  await buildSite();
  const manifest = JSON.parse(
    await readFile(resolve(repositoryRoot, "dist/manifest.json"), "utf8")
  );
  const packageMetadata = JSON.parse(
    await readFile(resolve(repositoryRoot, "package.json"), "utf8")
  );

  assert.equal(manifest.version, packageMetadata.version);
  assert.ok(manifest.entrypoints.includes("sign-in.html"));
  assert.ok(manifest.entrypoints.includes("privacy.html"));
  assert.ok(manifest.entrypoints.includes("blog/index.html"));
  assert.ok(manifest.entrypoints.includes("he/blog/index.html"));
});

test("build manifest lists emitted editorial routes, including the explicit missing translation page", async () => {
  const outputDir = await buildSite();
  const manifest = JSON.parse(await readFile(resolve(outputDir, "manifest.json"), "utf8"));
  const required = [
    "blog/search/index.html",
    "blog/search/page/2/index.html",
    "blog/category/seo/index.html",
    "blog/tag/technical-seo/index.html",
    "blog/series/growth-foundations/index.html",
    "blog/authors/maya-chen/index.html",
    "blog/marketing-dashboard/index.html",
    "he/blog/audit-seo-be-90-dakot/index.html",
    "he/blog/analytics-attribution-models/index.html"
  ];

  assert.equal(new Set(manifest.entrypoints).size, manifest.entrypoints.length);
  for (const outputPath of required) {
    assert.ok(manifest.entrypoints.includes(outputPath), `manifest omits ${outputPath}`);
    assert.equal((await stat(resolve(outputDir, outputPath))).isFile(), true);
  }
});

test("build emits discovery files without registering JSON or XML as entrypoints", async () => {
  const outputDir = await buildSite();
  const manifest = JSON.parse(await readFile(resolve(outputDir, "manifest.json"), "utf8"));
  const artifacts = [
    "search-index-en.json",
    "search-index-he.json",
    "blog/search-index-en.json",
    "blog/search-index-he.json",
    "blog/rss-en.xml",
    "sitemap-en.xml"
  ];

  for (const outputPath of artifacts) {
    assert.equal((await stat(resolve(outputDir, outputPath))).isFile(), true);
    assert.ok(manifest.files.includes(outputPath), `manifest omits ${outputPath}`);
    assert.ok(!manifest.entrypoints.includes(outputPath), `entrypoints includes artifact ${outputPath}`);
  }
});
