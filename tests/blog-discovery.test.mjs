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
import { validateSearchIndexEnvelope } from "../sources/js/search-index-contract.mjs";

function emittedSearchRoutePaths(model, siteDocuments) {
  return [...new Set(["en", "he"].flatMap((locale) => [
    ...createGlobalSearchIndex({ model, siteDocuments, locale }).records,
    ...createBlogSearchIndex({ model, locale }).records
  ]).map((record) => record.href.split("#")[0]))];
}

test("keeps global and blog indexes separate", async () => {
  const model = await loadRepositoryBlogModel();
  const siteDocuments = await loadRepositorySiteDocuments();
  const global = createGlobalSearchIndex({ model, siteDocuments, locale: "en" });
  const blog = createBlogSearchIndex({ model, locale: "en" });

  assert.deepEqual({ schemaVersion: global.schemaVersion, kind: global.kind, locale: global.locale }, { schemaVersion: 1, kind: "global-search", locale: "en" });
  assert.deepEqual({ schemaVersion: blog.schemaVersion, kind: blog.kind, locale: blog.locale }, { schemaVersion: 1, kind: "blog-search", locale: "en" });
  assert.ok(global.records.some((entry) => entry.type === "service"));
  assert.ok(global.records.some((entry) => entry.type === "author"));
  assert.ok(blog.records.every((entry) => entry.type === "article"));
  assert.equal(blog.records.length, 14);
  assert.equal(global.records.filter((entry) => entry.type === "article").length, 14);
  assert.match(blog.records[0].content, /\S/u);
  assert.doesNotMatch(blog.records[0].content, /<[^>]+>/u);
});

test("rejects unsafe or incompatible search records before build and runtime use", async () => {
  const model = await loadRepositoryBlogModel();
  const siteDocuments = await loadRepositorySiteDocuments();
  const unsafe = structuredClone(siteDocuments);
  unsafe[0].locales.en.href = "javascript:alert(1)";
  assert.throws(
    () => createGlobalSearchIndex({ model, siteDocuments: unsafe, locale: "en" }),
    /safe local route/
  );

  const valid = createGlobalSearchIndex({ model, siteDocuments, locale: "en" });
  assert.equal(validateSearchIndexEnvelope(valid, { kind: "global-search", locale: "en" }), valid.records);
  assert.throws(
    () => validateSearchIndexEnvelope({ ...valid, schemaVersion: 2 }, { kind: "global-search", locale: "en" }),
    /schema version/
  );
  const unsafeRuntime = structuredClone(valid);
  unsafeRuntime.records[0].href = "javascript:alert(1)";
  assert.throws(
    () => validateSearchIndexEnvelope(unsafeRuntime, { kind: "global-search", locale: "en" }),
    /safe local route/
  );
});

test("rejects off-taxonomy or incoherent Blog metadata before replacing server results", async () => {
  const model = await loadRepositoryBlogModel();
  const valid = createBlogSearchIndex({ model, locale: "en" });
  const mutations = [
    ["level", (record) => { record.level = "expert"; }],
    ["format", (record) => { record.format = "whitepaper"; }],
    ["audiences", (record) => { record.audiences = ["leaders", "buyers"]; }],
    ["audiences", (record) => { record.audiences = ["leaders", "leaders"]; }],
    ["tags", (record) => { record.tags = [record.tags[0], record.tags[0]]; }],
    ["authors", (record) => { record.authors = [record.primaryAuthor.id, "maya-chen"]; }],
    ["coAuthors", (record) => {
      record.coAuthors = [{ ...record.primaryAuthor }];
      record.authors = [record.primaryAuthor.id];
    }]
  ];

  for (const [field, mutate] of mutations) {
    const payload = structuredClone(valid);
    mutate(payload.records[0]);
    assert.throws(
      () => validateSearchIndexEnvelope(payload, { kind: "blog-search", locale: "en" }),
      new RegExp(field)
    );
  }
});

test("rejects shape-safe search records that do not resolve to an emitted public route", async () => {
  const model = await loadRepositoryBlogModel();
  const siteDocuments = await loadRepositorySiteDocuments();
  const missing = structuredClone(siteDocuments);
  missing[0].locales.en.href = "missing/index.html";
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-missing-search-route-"));

  await assert.rejects(
    emitDiscoveryArtifacts({
      model,
      siteDocuments: missing,
      outputDir,
      siteOrigin: model.settings.siteOrigin,
      publicRoutePaths: emittedSearchRoutePaths(model, siteDocuments)
    }),
    /search record href does not resolve to an emitted public route: missing\/index\.html/
  );
});

test("blog index carries governed localized card metadata including coauthors", async () => {
  const model = await loadRepositoryBlogModel();
  const article = model.byId.article.get("marketing-dashboard");
  article.coAuthors = ["maya-chen"];
  const index = createBlogSearchIndex({ model, locale: "he" });
  const document = index.records.find((entry) => entry.id === article.id);

  assert.deepEqual(document.primaryAuthor, { id: "sofia-reyes", name: "סופיה רייס" });
  assert.deepEqual(document.coAuthors, [{ id: "maya-chen", name: "מאיה צ׳ן" }]);
  assert.equal(document.categoryLabel, "אנליטיקה ואופטימיזציה");
  assert.equal(document.levelLabel, "בינוניים");
  assert.equal(document.formatLabel, "מדריך");
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

test("locale sitemaps include the tag and author directory routes", async () => {
  const model = await loadRepositoryBlogModel();
  const siteDocuments = await loadRepositorySiteDocuments();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-sitemap-directories-"));
  await emitDiscoveryArtifacts({ model, siteDocuments, outputDir, siteOrigin: model.settings.siteOrigin });
  const [english, hebrew] = await Promise.all([
    readFile(resolve(outputDir, "sitemap-en.xml"), "utf8"),
    readFile(resolve(outputDir, "sitemap-he.xml"), "utf8")
  ]);
  assert.match(english, /<loc>https:\/\/glyad\.github\.io\/positivus-site\/blog\/tags\/<\/loc>/);
  assert.match(english, /<loc>https:\/\/glyad\.github\.io\/positivus-site\/blog\/authors\/<\/loc>/);
  assert.match(hebrew, /<loc>https:\/\/glyad\.github\.io\/positivus-site\/he\/blog\/tags\/<\/loc>/);
  assert.match(hebrew, /<loc>https:\/\/glyad\.github\.io\/positivus-site\/he\/blog\/authors\/<\/loc>/);
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

  const emittedIndex = JSON.parse(await readFile(resolve(outputDir, "blog/search-index-en.json"), "utf8"));
  assert.equal(emittedIndex.schemaVersion, 1);
  assert.equal(emittedIndex.kind, "blog-search");
  assert.equal(validateSearchIndexEnvelope(emittedIndex, { kind: "blog-search", locale: "en" }), emittedIndex.records);
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

test("accepts a redirect replacement targeting an emitted flat HTML page", async () => {
  const model = structuredClone(await loadRepositoryBlogModel());
  const siteDocuments = await loadRepositorySiteDocuments();
  model.articles[0].redirect = {
    locale: "en",
    oldPath: "/positivus-site/blog/retired-guide/",
    replacementPath: "/positivus-site/sign-in.html",
    statusCode: 301,
    reason: "Moved"
  };
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-flat-target-"));

  const paths = await emitDiscoveryArtifacts({
    model,
    siteDocuments,
    outputDir,
    siteOrigin: model.settings.siteOrigin,
    publicRoutePaths: [...emittedSearchRoutePaths(model, siteDocuments), "sign-in.html"]
  });

  assert.ok(paths.includes("blog/retired-guide/index.html"));
});

test("accepts a redirect replacement targeting the emitted site root", async () => {
  const model = structuredClone(await loadRepositoryBlogModel());
  const siteDocuments = await loadRepositorySiteDocuments();
  model.articles[0].redirect = {
    locale: "en",
    oldPath: "/positivus-site/blog/retired-guide/",
    replacementPath: "/positivus-site/",
    statusCode: 301,
    reason: "Moved"
  };
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-root-target-"));

  const paths = await emitDiscoveryArtifacts({
    model,
    siteDocuments,
    outputDir,
    siteOrigin: model.settings.siteOrigin,
    publicRoutePaths: [...emittedSearchRoutePaths(model, siteDocuments), "sign-in.html"]
  });

  assert.ok(paths.includes("blog/retired-guide/index.html"));
});

test("rejects a redirect source that collides with an emitted flat HTML page", async () => {
  const model = structuredClone(await loadRepositoryBlogModel());
  const siteDocuments = await loadRepositorySiteDocuments();
  model.articles[0].redirect = {
    locale: "en",
    oldPath: "/positivus-site/sign-in.html",
    replacementPath: "/positivus-site/",
    statusCode: 301,
    reason: "Moved"
  };
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-flat-source-"));

  await assert.rejects(
    emitDiscoveryArtifacts({
      model,
      siteDocuments,
      outputDir,
      siteOrigin: model.settings.siteOrigin,
      publicRoutePaths: [...emittedSearchRoutePaths(model, siteDocuments), "sign-in.html"]
    }),
    /redirect oldPath collides with an emitted public route/
  );
});
