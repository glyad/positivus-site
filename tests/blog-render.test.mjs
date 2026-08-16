import assert from "node:assert/strict";
import test from "node:test";

import { escapeAttribute, escapeHtml, renderBlocks } from "../scripts/blog/render-blocks.mjs";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { repositoryRoot } from "../scripts/build.mjs";
import { loadLocalBlogSource } from "../scripts/blog/local-json-adapter.mjs";
import { renderBlogSite } from "../scripts/blog/render-site.mjs";
import { createBlogModel } from "../scripts/blog/schema.mjs";
import { loadRepositoryBlogModel } from "./helpers/blog-fixture.mjs";

const resolveAsset = (path) => `../../${path}`;

test("renders the first structured article blocks with semantic HTML and escaped authored content", () => {
  const html = renderBlocks([
    { type: "keyTakeaways", heading: "Key < takeaways", items: ["Measure < outcomes", "Never trust <script>alert(1)</script>"] },
    { type: "richText", heading: "Start here", paragraphs: ["Use evidence & context.", "Keep \"claims\" honest."] },
    { type: "figure", src: "assets/images/team/team-1.webp", alt: "A < useful image", caption: "Image & context", attribution: "Ava \"Roe\"" },
    { type: "quote", heading: "A principle", text: "Use < evidence", attribution: "Maya & Co." },
    { type: "stat", heading: "Focus", value: "1 < 2", label: "primary \"change\"" },
    { type: "checklist", heading: "Check", items: ["One", "Two & three"] },
    { type: "steps", heading: "Steps", items: ["First", "Second"] }
  ], { locale: "en", resolveAsset, consultation: null });

  assert.match(html, /<section class="article-block article-block--key-takeaways">/);
  assert.match(html, /<ul>/);
  assert.match(html, /<ol>/);
  assert.match(html, /<figure>/);
  assert.match(html, /<img src="\.\.\/\.\.\/assets\/images\/team\/team-1\.webp" alt="A &lt; useful image" \/>/);
  assert.match(html, /<figcaption>Image &amp; context <span>— Ava &quot;Roe&quot;<\/span><\/figcaption>/);
  assert.match(html, /<blockquote><p>Use &lt; evidence<\/p><footer>Maya &amp; Co\.<\/footer><\/blockquote>/);
  assert.match(html, /<data value="1 &lt; 2">1 &lt; 2<\/data>/);
  assert.match(html, /Measure &lt; outcomes/);
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /Never trust <script>/);
});

test("escapes text and attribute values without accepting authored markup", () => {
  assert.equal(escapeHtml(`<&>"'`), "&lt;&amp;&gt;&quot;&#39;");
  assert.equal(escapeAttribute(`<&>"'`), "&lt;&amp;&gt;&quot;&#39;");
});

test("renders complex blocks with accessible native structures and secure links", () => {
  const html = renderBlocks([
    {
      type: "table",
      heading: "Decision dashboard",
      caption: "A < field guide",
      columns: ["Field", "Question"],
      rows: [["Qualified demand", "Who < benefits?"]]
    },
    {
      type: "media",
      heading: "Watch",
      src: "assets/images/team/team-2.webp",
      alt: "A < video thumbnail",
      caption: "Watch & learn",
      href: "https://example.com/watch"
    },
    {
      type: "download",
      heading: "Download",
      label: "Dashboard < worksheet",
      fileLabel: "PDF, 1.2 MB",
      href: "https://example.com/worksheet.pdf"
    },
    {
      type: "citations",
      heading: "Sources",
      citations: [
        { label: "Research < report", href: "https://example.com/research" },
        { label: "Ignore me", href: "javascript:alert(1)" }
      ]
    },
    { type: "callout", tone: "expert", heading: "Editorial view", body: "Use < evidence." },
    { type: "faq", heading: "Questions", items: [{ question: "Why < now?", answer: "For safer decisions." }] }
  ], { locale: "en", resolveAsset, consultation: null });

  assert.match(html, /<table>/);
  assert.match(html, /<caption>A &lt; field guide<\/caption>/);
  assert.match(html, /<th scope="col">Field<\/th>/);
  assert.match(html, /<th scope="row">Qualified demand<\/th>/);
  assert.match(html, /<figure><a href="https:\/\/example\.com\/watch" target="_blank" rel="noreferrer noopener"><img/);
  assert.match(html, /<span class="article-block__file-label">File: PDF, 1\.2 MB<\/span>/);
  assert.match(html, /<ol><li><a href="https:\/\/example\.com\/research" target="_blank" rel="noreferrer noopener">Research &lt; report<\/a><\/li><\/ol>/);
  assert.match(html, /<p><strong>Expert:<\/strong> Use &lt; evidence\.<\/p>/);
  assert.match(html, /<details><summary>Why &lt; now\?<\/summary><p>For safer decisions\.<\/p><\/details>/);
  assert.doesNotMatch(html, /javascript:/);
});

test("renders a consultation only for its resolved service relationship", () => {
  const block = {
    type: "consultation",
    serviceId: "seo",
    heading: "Talk to < a specialist",
    body: "Plan the next step.",
    actionLabel: "Request a consultation",
    href: "https://example.com/contact"
  };
  const matching = renderBlocks([block], {
    locale: "en",
    resolveAsset,
    consultation: { serviceId: "seo" }
  });
  const mismatched = renderBlocks([block], {
    locale: "en",
    resolveAsset,
    consultation: { serviceId: "paid-media" }
  });

  assert.match(matching, /Talk to &lt; a specialist/);
  assert.match(matching, /data-consultation-service="seo"/);
  assert.match(matching, /target="_blank" rel="noreferrer noopener"/);
  assert.equal(mismatched, "");
  assert.equal(renderBlocks([{ type: "consultation", serviceId: "seo" }], { locale: "en", resolveAsset, consultation: null }), "");
});

test("omits citation blocks that have no valid linked entries", () => {
  const options = { locale: "en", resolveAsset, consultation: null };

  assert.equal(renderBlocks([{ type: "citations", heading: "Sources", citations: [] }], options), "");
  assert.equal(renderBlocks([{
    type: "citations",
    heading: "Sources",
    citations: [{ label: "Unsafe", href: "javascript:alert(1)" }, { label: "Missing URL" }]
  }], options), "");
});

test("rejects malformed optional values, unsafe links, and unsafe asset resolutions", () => {
  const html = renderBlocks([
    { type: "table", columns: "not an array", rows: [["<img src=x onerror=alert(1)>"]] },
    { type: "table", columns: ["Field"], rows: [["Uncaptioned"]] },
    { type: "media", src: "assets/../secrets.webp", alt: "No" },
    { type: "download", label: "Bad", fileLabel: { text: "PDF" }, href: "data:text/html,<script>alert(1)</script>" },
    { type: "citations", citations: [{ label: "Bad", href: "//tracker.invalid" }, null] },
    { type: "faq", items: [{ question: ["wrong"], answer: { value: "wrong" } }, null] }
  ], { locale: "en", resolveAsset: () => "https://attacker.invalid/asset.webp", consultation: { serviceId: "seo" } });

  assert.equal(html, "");
});

test("accepts only resolver paths rooted at assets after leading parent segments", () => {
  const figure = { type: "figure", src: "assets/images/team/team-1.webp", alt: "A safe image" };
  const invalidOutputs = [
    "../../assets/../../../secret.webp",
    "../assets/../../secret.webp",
    "../../assets/./images/x.webp",
    "../../assets/images/%2e%2e/secret.webp",
    "../../assets/images/x.webp?debug=1",
    "../../assets\\images\\x.webp",
    "../../assets/images/\u0000x.webp"
  ];

  for (const output of invalidOutputs) {
    assert.equal(renderBlocks([figure], { locale: "en", resolveAsset: () => output, consultation: null }), "");
  }

  for (const output of ["assets/x.webp", "../assets/x.webp", "../../assets/images/x.webp"]) {
    const html = renderBlocks([figure], { locale: "en", resolveAsset: () => output, consultation: null });
    assert.ok(html.includes(`src="${output}"`));
  }
});

test("keeps structured semantics neutral for Hebrew RTL content", () => {
  const html = renderBlocks([
    { type: "faq", heading: "שאלות", items: [{ question: "למה?", answer: "כדי לקבל החלטות." }] },
    { type: "callout", tone: "warning", body: "בדקו את המקור." }
  ], { locale: "he", resolveAsset, consultation: null });

  assert.match(html, /<details>/);
  assert.match(html, /למה\?/);
  assert.match(html, /אזהרה/);
  assert.doesNotMatch(html, /dir="ltr"/);
});

test("renders every approved page family, localized article peers, and the missing Hebrew peer", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-render-"));
  const pages = await renderBlogSite({
    model,
    sourceDir: resolve(repositoryRoot, "sources"),
    outputDir,
    version: "1.2.0"
  });

  for (const outputPath of [
    "blog/search/index.html",
    "blog/category/seo/index.html",
    "blog/tag/technical-seo/index.html",
    "blog/series/growth-foundations/index.html",
    "blog/authors/index.html",
    "blog/authors/maya-chen/index.html",
    "blog/seo-audit-90-minutes/index.html",
    "he/blog/search/index.html",
    "he/blog/category/seo/index.html",
    "he/blog/tag/seo-techni/index.html",
    "he/blog/series/yesodot-hatzmicha/index.html",
    "he/blog/authors/index.html",
    "he/blog/authors/maya-chen/index.html",
    "he/blog/audit-seo-be-90-dakot/index.html",
    "he/blog/analytics-attribution-models/index.html"
  ]) assert.ok(pages.includes(outputPath), `missing ${outputPath}`);

  const missingTranslation = await readFile(resolve(outputDir, "he/blog/analytics-attribution-models/index.html"), "utf8");
  assert.match(missingTranslation, /data-missing-translation/);
  assert.match(missingTranslation, /analytics-attribution-models/);
  assert.doesNotMatch(missingTranslation, /Credit is not causation/);
});

test("article pages expose the approved editorial hierarchy and prototype-only conversion landmarks", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-article-"));
  await renderBlogSite({
    model,
    sourceDir: resolve(repositoryRoot, "sources"),
    outputDir,
    version: "1.2.0"
  });

  const html = await readFile(resolve(outputDir, "blog/marketing-dashboard/index.html"), "utf8");
  for (const fragment of [
    "data-breadcrumbs",
    "data-article-author",
    "datePublished",
    "dateModified",
    "data-copy-link",
    "data-print-article",
    "data-article-toc",
    "data-article-tags",
    "data-related-content",
    "data-series-navigation",
    "data-newsletter-form",
    "data-demo-comments"
  ]) assert.match(html, new RegExp(fragment));
  assert.match(html, /Corrected on June 12, 2026/);
  assert.match(html, /Daniel Levi/);
  assert.match(html, /data-demo-comments[^>]*data-prototype="true"/);
});

test("browse starts with twelve stable cards and accessible numbered pagination", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-browse-"));
  await renderBlogSite({
    model,
    sourceDir: resolve(repositoryRoot, "sources"),
    outputDir,
    version: "1.2.0"
  });

  const html = await readFile(resolve(outputDir, "blog/search/index.html"), "utf8");
  assert.equal((html.match(/data-article-card/g) ?? []).length, 12);
  assert.match(html, /data-active-filters/);
  assert.match(html, /data-blog-sort/);
  assert.match(html, /data-result-count/);
  assert.match(html, /data-pagination/);
  assert.match(html, /data-tag-cloud/);
  assert.match(html, /aria-current="page"/);
});

test("uses localized publication From and To labels rather than an edit-date label", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-publication-range-"));
  await renderBlogSite({ model, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });
  const [english, hebrew] = await Promise.all([
    readFile(resolve(outputDir, "blog/search/index.html"), "utf8"),
    readFile(resolve(outputDir, "he/blog/search/index.html"), "utf8")
  ]);
  assert.match(english, /data-filter-from[^>]*type="date"/);
  assert.match(english, /Published from.*data-filter-from/s);
  assert.match(english, /Published through.*data-filter-to/s);
  assert.match(hebrew, /פורסם מתאריך.*data-filter-from/s);
  assert.match(hebrew, /פורסם עד תאריך.*data-filter-to/s);
});

test("emits a second static browse page with the later article slice and native page links", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-page-two-"));
  const pages = await renderBlogSite({ model, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });
  assert.ok(pages.includes("blog/search/page/2/index.html"));
  const [first, second] = await Promise.all([
    readFile(resolve(outputDir, "blog/search/index.html"), "utf8"),
    readFile(resolve(outputDir, "blog/search/page/2/index.html"), "utf8")
  ]);
  const ordered = [...model.publicArticles].filter((article) => article.locales.en).sort((left, right) => right.publishedAt - left.publishedAt || left.id.localeCompare(right.id));
  assert.doesNotMatch(first, new RegExp(ordered[12].locales.en.title));
  assert.match(second, new RegExp(ordered[12].locales.en.title));
  assert.match(second, /href="\.\.\/\.\.\/index\.html"/);
  assert.match(first, /href="page\/2\/index\.html"/);
  assert.match(second, /aria-current="page">2/);
});

test("browse and author pages expose progressive enhancement contracts without replacing server content", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-enhancement-"));
  await renderBlogSite({ model, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });
  const [browse, authors] = await Promise.all([
    readFile(resolve(outputDir, "he/blog/search/index.html"), "utf8"),
    readFile(resolve(outputDir, "blog/authors/index.html"), "utf8")
  ]);
  assert.match(browse, /data-blog-browse[^>]*data-blog-index="\.\.\/\.\.\/\.\.\/blog\/search-index-he\.json"/);
  assert.match(browse, /data-results-heading/);
  assert.match(authors, /data-author-directory/);
  assert.match(authors, /data-author-query/);
  assert.match(authors, /data-author-expertise/);
  assert.equal((authors.match(/data-author-card/g) ?? []).length, model.authors.length);
});

test("tag clouds give exact localized counts a semantic label, bounded weight, and a compact disclosure", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-tag-cloud-"));
  await renderBlogSite({ model, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });
  const html = await readFile(resolve(outputDir, "blog/index.html"), "utf8");
  assert.match(html, /data-tag-cloud-toggle/);
  assert.match(html, /data-tag-cloud-list/);
  assert.match(html, /class="tag-weight-[1-5]"/);
  assert.match(html, /aria-label="Technical SEO: 2 articles"/);
});

test("article TOC targets only rendered headed blocks when an unheaded block comes first", async () => {
  const sourceDir = resolve(repositoryRoot, "sources");
  const raw = await loadLocalBlogSource({ sourceDir });
  raw.articles.find((article) => article.id === "marketing-dashboard").locales.en.blocks.unshift({ type: "callout", tone: "expert", body: "Read this note first." });
  const model = createBlogModel(raw, { now: new Date("2026-08-15T00:00:00.000Z") });
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-toc-"));
  await renderBlogSite({ model, sourceDir, outputDir, version: "1.2.0" });

  const html = await readFile(resolve(outputDir, "blog/marketing-dashboard/index.html"), "utf8");
  assert.match(html, /<section class="article-block article-block--callout callout--expert"><p><strong>Expert:<\/strong> Read this note first\.<\/p><\/section>/);
  assert.match(html, /<a href="#section-1">Key takeaways<\/a>/);
  assert.match(html, /<section class="article-block article-block--key-takeaways" id="section-1">/);
  assert.doesNotMatch(html, /article-block--callout" id="section-1"/);
});

test("category and tag archives expose their required editorial discovery paths", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-archives-"));
  await renderBlogSite({ model, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });

  const [category, tag] = await Promise.all([
    readFile(resolve(outputDir, "blog/category/seo/index.html"), "utf8"),
    readFile(resolve(outputDir, "blog/tag/technical-seo/index.html"), "utf8")
  ]);
  assert.match(category, /data-category-featured/);
  assert.match(category, /data-category-facets/);
  assert.match(category, /data-category-remaining/);
  assert.match(tag, /data-tag-index-link/);
  assert.match(tag, /data-tag-categories/);
  assert.match(tag, /category\/seo\/index\.html/);
});

test("emits alphabetical locale-specific tag indexes with published counts", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-tag-index-"));
  const pages = await renderBlogSite({ model, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });

  assert.ok(pages.includes("blog/tags/index.html"));
  assert.ok(pages.includes("he/blog/tags/index.html"));
  const [english, hebrew] = await Promise.all([
    readFile(resolve(outputDir, "blog/tags/index.html"), "utf8"),
    readFile(resolve(outputDir, "he/blog/tags/index.html"), "utf8")
  ]);
  assert.match(english, /data-tag-index/);
  assert.ok(english.indexOf("B2B") < english.indexOf("Brand voice"));
  assert.match(english, /Technical SEO <span>\(2\)<\/span>/);
  assert.match(hebrew, /data-tag-index/);
  assert.match(hebrew, /SEO טכני <span>\(2\)<\/span>/);
});

test("author profiles derive article, guide, and series counts from published localized work", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-author-counts-"));
  await renderBlogSite({ model, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });

  const html = await readFile(resolve(outputDir, "blog/authors/maya-chen/index.html"), "utf8");
  assert.match(html, /data-author-counts/);
  assert.match(html, /Articles<\/dt><dd>2<\/dd>/);
  assert.match(html, /Guides<\/dt><dd>1<\/dd>/);
  assert.match(html, /Series<\/dt><dd>1<\/dd>/);
});

test("renders localized names and hero alternatives with one layer of attribute escaping", async () => {
  const model = await loadRepositoryBlogModel();
  const modified = structuredClone(model);
  modified.byId.author.get("maya-chen").locales.en.name = "A & B";
  modified.byId.article.get("marketing-dashboard").hero.alt.en = "A & B";
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-attribute-"));
  await renderBlogSite({ model: modified, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });

  const [author, article] = await Promise.all([
    readFile(resolve(outputDir, "blog/authors/maya-chen/index.html"), "utf8"),
    readFile(resolve(outputDir, "blog/marketing-dashboard/index.html"), "utf8")
  ]);
  assert.match(author, /alt="A &amp; B"/);
  assert.match(article, /alt="A &amp; B"/);
  assert.doesNotMatch(author, /A &amp;amp; B/);
  assert.doesNotMatch(article, /A &amp;amp; B/);
});

test("related reading excludes the current article while retaining explicit priority", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-related-"));
  await renderBlogSite({ model, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });

  const html = await readFile(resolve(outputDir, "blog/marketing-dashboard/index.html"), "utf8");
  const related = html.match(/<section data-related-content>[\s\S]*?<\/section><section class="blog-newsletter"/u)?.[0] ?? "";
  assert.match(related, /href="\.\.\/paid-media-budget\/index\.html"/);
  assert.doesNotMatch(related, /href="index\.html"/);
});

test("browse exposes localized controls for every approved filter and its mobile actions", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-filters-"));
  await renderBlogSite({ model, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });

  const [english, hebrew] = await Promise.all([
    readFile(resolve(outputDir, "blog/search/index.html"), "utf8"),
    readFile(resolve(outputDir, "he/blog/search/index.html"), "utf8")
  ]);
  for (const name of ["category", "format", "audience", "level", "author", "reading-duration", "publication-date"]) {
    assert.match(english, new RegExp(`data-filter-${name}`));
  }
  assert.match(english, /data-filter-drawer/);
  assert.match(english, /data-filter-apply/);
  assert.match(english, /data-filter-clear/);
  assert.match(english, /data-active-filters[^>]*aria-live="polite"/);
  assert.match(english, /<option value="seo">SEO<\/option>/);
  assert.match(english, /<option value="maya-chen">Maya Chen<\/option>/);
  assert.match(hebrew, /<option value="paid-media">מדיה ממומנת<\/option>/);
});

test("Blog Home gives only its featured guide escaped, depth-safe hero artwork", async () => {
  const model = await loadRepositoryBlogModel();
  const modified = structuredClone(model);
  modified.byId.article.get("sustainable-demand-system").hero.alt.en = "A & B";
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-featured-artwork-"));
  await renderBlogSite({ model: modified, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });

  const html = await readFile(resolve(outputDir, "blog/index.html"), "utf8");
  assert.match(html, /data-featured-card/);
  assert.match(html, /src="\.\.\/assets\/images\/decor\/hero-illustration\.svg" alt="A &amp; B"/);
  assert.equal((html.match(/data-featured-card/g) ?? []).length, 1);
});

test("mobile filter drawer owns its active-filter live region and actions", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-filter-drawer-"));
  await renderBlogSite({ model, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });

  const html = await readFile(resolve(outputDir, "blog/search/index.html"), "utf8");
  const drawer = html.slice(html.indexOf("<div data-filter-drawer"));
  assert.match(drawer, /data-active-filters[^>]*aria-live="polite"/);
  assert.match(drawer, /data-filter-apply/);
  assert.match(drawer, /data-filter-clear/);
});

test("future-dated series records never enter public routes, series navigation, or related cards", async () => {
  const sourceDir = resolve(repositoryRoot, "sources");
  const raw = await loadLocalBlogSource({ sourceDir });
  const future = structuredClone(raw.articles.find((article) => article.id === "analytics-attribution-models"));
  future.id = "future-series-entry";
  future.publishedAt = "2026-09-01T09:00:00.000Z";
  future.editedAt = "2026-09-01T09:00:00.000Z";
  future.locales.en.slug = "future-series-entry";
  future.locales.en.title = "Future series entry";
  raw.articles.push(future);
  raw.series.find((series) => series.id === "measurement-that-matters").articleIds.push("future-series-entry");
  const model = createBlogModel(raw, { now: new Date("2026-08-15T00:00:00.000Z") });
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-future-series-"));
  const pages = await renderBlogSite({ model, sourceDir, outputDir, version: "1.2.0" });

  const [series, analytics, dashboard] = await Promise.all([
    readFile(resolve(outputDir, "blog/series/measurement-that-matters/index.html"), "utf8"),
    readFile(resolve(outputDir, "blog/analytics-attribution-models/index.html"), "utf8"),
    readFile(resolve(outputDir, "blog/marketing-dashboard/index.html"), "utf8")
  ]);
  assert.ok(!pages.includes("blog/future-series-entry/index.html"));
  assert.doesNotMatch(series, /Future series entry/);
  assert.doesNotMatch(analytics, /future-series-entry/);
  assert.doesNotMatch(dashboard, /future-series-entry/);
});

test("author profiles keep declared expertise and validated professional links when authored topics are empty", async () => {
  const sourceDir = resolve(repositoryRoot, "sources");
  const raw = await loadLocalBlogSource({ sourceDir });
  const maya = raw.authors.find((author) => author.id === "maya-chen");
  maya.professionalLinks = [{ label: { en: "Professional profile", he: "פרופיל מקצועי" }, href: "https://profiles.example/maya" }];
  for (const article of raw.articles.filter((article) => article.primaryAuthor === "maya-chen")) article.tags = [];
  const model = createBlogModel(raw, { now: new Date("2026-08-15T00:00:00.000Z") });
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-author-profile-"));
  await renderBlogSite({ model, sourceDir, outputDir, version: "1.2.0" });

  const html = await readFile(resolve(outputDir, "blog/authors/maya-chen/index.html"), "utf8");
  assert.match(html, /data-author-profile-expertise/);
  assert.match(html, /Strategy &amp; Growth/);
  assert.match(html, /Demand generation/);
  assert.match(html, /data-professional-links/);
  assert.match(html, /href="https:\/\/profiles\.example\/maya" target="_blank" rel="noreferrer noopener">Professional profile<\/a>/);
});

test("rejects duplicate emitted routes before any page can be overwritten", async () => {
  const sourceDir = resolve(repositoryRoot, "sources");
  const raw = await loadLocalBlogSource({ sourceDir });
  const englishOnly = raw.articles.find((article) => article.id === "analytics-attribution-models");
  raw.articles.find((article) => article.id === "marketing-dashboard").locales.he.slug = englishOnly.locales.en.slug;
  const model = createBlogModel(raw, { now: new Date("2026-08-15T00:00:00.000Z") });
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-route-collision-"));

  await assert.rejects(
    () => renderBlogSite({ model, sourceDir, outputDir, version: "1.2.0" }),
    /duplicate blog output path.*he\/blog\/analytics-attribution-models\/index\.html/i
  );
  await assert.rejects(() => readFile(resolve(outputDir, "he/blog/analytics-attribution-models/index.html"), "utf8"), { code: "ENOENT" });
});

test("renders standalone localized category and author pages without an invented language peer", async () => {
  const sourceDir = resolve(repositoryRoot, "sources");
  const raw = await loadLocalBlogSource({ sourceDir });
  raw.categories.push({ id: "solo-category", order: 8, locales: { en: { name: "Solo category", slug: "solo-category", description: "An independent category." } } });
  raw.authors.push({
    id: "solo-author",
    portrait: "assets/images/team/team-1.webp",
    expertise: ["strategy"],
    locales: { en: { name: "Solo author", slug: "solo-author", role: "Advisor", bio: "Available in English.", credentials: ["Independent advisor"] } }
  });
  const model = createBlogModel(raw, { now: new Date("2026-08-15T00:00:00.000Z") });
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-standalone-locale-"));
  const pages = await renderBlogSite({ model, sourceDir, outputDir, version: "1.2.0" });

  assert.ok(pages.includes("blog/category/solo-category/index.html"));
  assert.ok(pages.includes("blog/authors/solo-author/index.html"));
  assert.ok(!pages.includes("he/blog/category/solo-category/index.html"));
  assert.ok(!pages.includes("he/blog/authors/solo-author/index.html"));
  for (const outputPath of ["blog/category/solo-category/index.html", "blog/authors/solo-author/index.html"]) {
    const html = await readFile(resolve(outputDir, outputPath), "utf8");
    assert.doesNotMatch(html, /hreflang="he"/);
    assert.doesNotMatch(html, /class="language-toggle"/);
  }
});

test("renders Hebrew author credentials without English leakage", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-hebrew-credentials-"));
  await renderBlogSite({ model, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });

  const html = await readFile(resolve(outputDir, "he/blog/authors/maya-chen/index.html"), "utf8");
  assert.match(html, /MBA באסטרטגיית צמיחה/);
  assert.doesNotMatch(html, /MBA, growth strategy/);
});

test("emits localized empty Blog Home states when no articles are publicly available", async () => {
  const sourceDir = resolve(repositoryRoot, "sources");
  const raw = await loadLocalBlogSource({ sourceDir });
  for (const article of raw.articles) article.status = "scheduled";
  const model = createBlogModel(raw, { now: new Date("2026-08-15T00:00:00.000Z") });
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-empty-home-"));
  const pages = await renderBlogSite({ model, sourceDir, outputDir, version: "1.2.0" });

  assert.deepEqual(model.publicArticles, []);
  assert.ok(pages.includes("blog/index.html"));
  assert.ok(pages.includes("he/blog/index.html"));
  const [english, hebrew] = await Promise.all([
    readFile(resolve(outputDir, "blog/index.html"), "utf8"),
    readFile(resolve(outputDir, "he/blog/index.html"), "utf8")
  ]);
  assert.match(english, /data-blog-empty/);
  assert.match(english, /Search the blog/);
  assert.match(hebrew, /data-blog-empty/);
  assert.match(hebrew, /חיפוש בבלוג/);
  assert.doesNotMatch(english, /data-featured-card/);
  assert.doesNotMatch(hebrew, /data-featured-card/);
});

test("orders missing-Hebrew availability pages by publication date then article ID", async () => {
  const sourceDir = resolve(repositoryRoot, "sources");
  const raw = await loadLocalBlogSource({ sourceDir });
  const original = raw.articles.find((article) => article.id === "analytics-attribution-models");
  const older = structuredClone(original);
  older.id = "older-untranslated";
  older.publishedAt = "2026-05-01T09:00:00.000Z";
  older.editedAt = "2026-05-01T09:00:00.000Z";
  older.locales.en.slug = "older-untranslated";
  const newer = structuredClone(original);
  newer.id = "newer-untranslated";
  newer.publishedAt = "2026-08-01T09:00:00.000Z";
  newer.editedAt = "2026-08-01T09:00:00.000Z";
  newer.locales.en.slug = "newer-untranslated";
  const sameDate = structuredClone(original);
  sameDate.id = "alpha-untranslated";
  sameDate.publishedAt = "2026-08-01T09:00:00.000Z";
  sameDate.editedAt = "2026-08-01T09:00:00.000Z";
  sameDate.locales.en.slug = "alpha-untranslated";
  raw.articles.push(older, newer, sameDate);
  raw.series.find((series) => series.id === original.series).articleIds.push(older.id, newer.id, sameDate.id);
  const model = createBlogModel(raw, { now: new Date("2026-08-15T00:00:00.000Z") });
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-availability-order-"));
  const pages = await renderBlogSite({ model, sourceDir, outputDir, version: "1.2.0" });

  assert.deepEqual(
    pages.filter((path) => ["he/blog/alpha-untranslated/index.html", "he/blog/newer-untranslated/index.html", "he/blog/analytics-attribution-models/index.html", "he/blog/older-untranslated/index.html"].includes(path)),
    ["he/blog/alpha-untranslated/index.html", "he/blog/newer-untranslated/index.html", "he/blog/analytics-attribution-models/index.html", "he/blog/older-untranslated/index.html"]
  );
});

test("series page and article navigation follow the validated series sequence", async () => {
  const model = await loadRepositoryBlogModel();
  const outputDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-series-sequence-"));
  await renderBlogSite({ model, sourceDir: resolve(repositoryRoot, "sources"), outputDir, version: "1.2.0" });

  const [series, article] = await Promise.all([
    readFile(resolve(outputDir, "blog/series/growth-foundations/index.html"), "utf8"),
    readFile(resolve(outputDir, "blog/sustainable-demand-system/index.html"), "utf8")
  ]);
  assert.ok(series.indexOf("Positioning before channels") < series.indexOf("Build a sustainable demand system"));
  assert.ok(series.indexOf("Build a sustainable demand system") < series.indexOf("Write content briefs teams can use"));
  assert.match(article, /rel="prev" href="\.\.\/positioning-before-channels\/index\.html"/);
  assert.match(article, /rel="next" href="\.\.\/content-briefs\/index\.html"/);
});
