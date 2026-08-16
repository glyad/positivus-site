import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import {
  articleStructuredData,
  createBlogSearchIndex,
  createGlobalSearchIndex,
  emitDiscoveryArtifacts,
  renderRss,
  renderSitemap
} from "../scripts/blog/discovery.mjs";
import { repositoryRoot } from "../scripts/build.mjs";
import { renderBlogSite } from "../scripts/blog/render-site.mjs";
import { loadRepositoryBlogModel, loadRepositorySiteDocuments } from "./helpers/blog-fixture.mjs";

test("keeps global and blog indexes separate", async () => {
  const model = await loadRepositoryBlogModel();
  const siteDocuments = await loadRepositorySiteDocuments();
  const global = createGlobalSearchIndex({ model, siteDocuments, locale: "en" });
  const blog = createBlogSearchIndex({ model, locale: "en" });

  assert.ok(global.some((entry) => entry.type === "service"));
  assert.ok(global.some((entry) => entry.type === "author"));
  assert.ok(blog.every((entry) => entry.type === "article"));
  assert.equal(blog.length, 14);
  assert.equal(global.filter((entry) => entry.type === "article").length, 14);
  assert.match(blog[0].content, /\S/u);
  assert.doesNotMatch(blog[0].content, /<[^>]+>/u);
});

test("feeds and sitemaps exclude unavailable translations and XML-escape text", async () => {
  const model = await loadRepositoryBlogModel();
  const rss = renderRss({ model, locale: "he", scope: "all" });
  const sitemap = renderSitemap({
    entries: [{ loc: "https://example.test/a?b=1&c=2", lastmod: "2026-08-15T00:00:00.000Z" }],
    siteOrigin: "https://example.test"
  });

  assert.doesNotMatch(rss, /analytics-attribution-models/);
  assert.match(rss, /<rss version="2.0">/);
  assert.match(sitemap, /https:\/\/example\.test\/a\?b=1&amp;c=2/);
});

test("generates localized discovery artifacts and noindex redirect documents", async () => {
  const model = await loadRepositoryBlogModel();
  const siteDocuments = await loadRepositorySiteDocuments();
  const redirected = structuredClone(model);
  redirected.articles[0].redirect = {
    locale: "en",
    oldPath: "/positivus-site/blog/old-guide/",
    replacementPath: "/positivus-site/blog/marketing-dashboard/",
    statusCode: 301,
    reason: "Moved"
  };
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-discovery-"));
  const paths = await emitDiscoveryArtifacts({
    model: redirected,
    siteDocuments,
    outputDir,
    siteOrigin: model.settings.siteOrigin
  });

  assert.ok(paths.includes("search-index-en.json"));
  assert.ok(paths.includes("blog/search-index-he.json"));
  assert.ok(paths.includes("blog/rss-en.xml"));
  assert.ok(paths.includes("blog/category/seo/rss-en.xml"));
  assert.ok(paths.includes("blog/authors/maya-chen/rss-en.xml"));
  assert.ok(paths.includes("sitemap-en.xml"));
  assert.ok(paths.includes("blog/old-guide/index.html"));

  const redirect = await readFile(resolve(outputDir, "blog/old-guide/index.html"), "utf8");
  assert.match(redirect, /<html lang="en" dir="ltr">/);
  assert.match(redirect, /name="robots" content="noindex, nofollow"/);
  assert.match(redirect, /http-equiv="refresh" content="0; url=https:\/\/glyad\.github\.io\/positivus-site\/blog\/marketing-dashboard\//);
  assert.match(redirect, /href="https:\/\/glyad\.github\.io\/positivus-site\/blog\/marketing-dashboard\//);
});

test("builds article JSON-LD with canonical URL and ISO dates", async () => {
  const model = await loadRepositoryBlogModel();
  const article = model.publicArticles.find((item) => item.id === "marketing-dashboard");
  const data = articleStructuredData({
    article,
    locale: "en",
    canonicalUrl: "https://glyad.github.io/positivus-site/blog/marketing-dashboard/"
  });

  assert.equal(data["@type"], "Article");
  assert.equal(data.url, "https://glyad.github.io/positivus-site/blog/marketing-dashboard/");
  assert.equal(data.datePublished, "2026-05-05T09:00:00.000Z");
  assert.equal(data.dateModified, "2026-06-12T09:00:00.000Z");
});

test("renders crawlable article metadata and noindexes search and missing translations", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-metadata-"));
  await renderBlogSite({ model, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });
  const [article, search, unavailable] = await Promise.all([
    readFile(resolve(outputDir, "blog/marketing-dashboard/index.html"), "utf8"),
    readFile(resolve(outputDir, "blog/search/index.html"), "utf8"),
    readFile(resolve(outputDir, "he/blog/analytics-attribution-models/index.html"), "utf8")
  ]);

  assert.match(article, /name="robots" content="index, follow"/);
  assert.match(article, /property="og:title" content="Build a marketing dashboard people trust"/);
  assert.match(article, /property="og:image" content="https:\/\/glyad\.github\.io\/positivus-site\/assets\//);
  assert.match(article, /"@type":"Article"/);
  assert.match(article, /"@type":"Person"/);
  assert.match(article, /"@type":"BreadcrumbList"/);
  assert.match(article, /"@type":"Organization"/);
  assert.match(article, /hreflang="he" href="https:\/\/glyad\.github\.io\/positivus-site\/he\/blog\/dashboard-shivuki-she-anashim-somchim-alav\//);
  assert.match(search, /name="robots" content="noindex, follow"/);
  assert.match(unavailable, /name="robots" content="noindex, follow"/);
});

test("rejects redirect destinations that are not emitted public routes before redirect output", async () => {
  const model = structuredClone(await loadRepositoryBlogModel());
  const siteDocuments = await loadRepositorySiteDocuments();
  model.articles[0].redirect = {
    locale: "en",
    oldPath: "/positivus-site/blog/retired-guide/",
    replacementPath: "/positivus-site/blog/not-an-emitted-page/",
    statusCode: 301,
    reason: "Moved"
  };
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-unresolved-redirect-"));

  await assert.rejects(
    emitDiscoveryArtifacts({ model, siteDocuments, outputDir, siteOrigin: model.settings.siteOrigin }),
    /replacementPath does not resolve to an emitted public route/
  );
  await assert.rejects(readFile(resolve(outputDir, "blog/retired-guide/index.html"), "utf8"));
});

test("rejects redirect sources that collide with generated public article pages", async () => {
  const model = structuredClone(await loadRepositoryBlogModel());
  const siteDocuments = await loadRepositorySiteDocuments();
  model.articles[0].redirect = {
    locale: "en",
    oldPath: "/positivus-site/blog/marketing-dashboard/",
    replacementPath: "/positivus-site/blog/paid-media-budget/",
    statusCode: 301,
    reason: "Moved"
  };
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-colliding-redirect-"));

  await assert.rejects(
    emitDiscoveryArtifacts({ model, siteDocuments, outputDir, siteOrigin: model.settings.siteOrigin }),
    /redirect oldPath collides with an emitted public route/
  );
});

test("rejects duplicate redirect source paths before either document can overwrite the other", async () => {
  const model = structuredClone(await loadRepositoryBlogModel());
  const siteDocuments = await loadRepositorySiteDocuments();
  const redirect = {
    locale: "en",
    oldPath: "/positivus-site/blog/retired-guide/",
    replacementPath: "/positivus-site/blog/paid-media-budget/",
    statusCode: 301,
    reason: "Moved"
  };
  model.articles[0].redirect = redirect;
  model.articles[1].redirect = { ...redirect, replacementPath: "/positivus-site/blog/marketing-dashboard/" };
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-duplicate-redirect-"));

  await assert.rejects(
    emitDiscoveryArtifacts({ model, siteDocuments, outputDir, siteOrigin: model.settings.siteOrigin }),
    /duplicate redirect oldPath/
  );
  await assert.rejects(readFile(resolve(outputDir, "blog/retired-guide/index.html"), "utf8"));
});
