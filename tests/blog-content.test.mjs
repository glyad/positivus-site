import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import { repositoryRoot } from "../scripts/build.mjs";
import { loadLocalBlogSource } from "../scripts/blog/local-json-adapter.mjs";
import {
  calculateReadingMinutes,
  createBlogModel
} from "../scripts/blog/schema.mjs";

test("repository fixtures cover the approved taxonomy and pagination boundary", async () => {
  const raw = await loadLocalBlogSource({ sourceDir: resolve(repositoryRoot, "sources") });
  const model = createBlogModel(raw, { now: new Date("2026-08-15T00:00:00Z") });

  assert.deepEqual(model.categories.map((category) => category.id), [
    "strategy-growth",
    "seo",
    "paid-media",
    "content-creative",
    "social-media",
    "email-lifecycle",
    "analytics-optimization"
  ]);
  assert.ok(model.articles.filter((article) => article.availableLocales.includes("en")).length > 12);
  assert.ok(model.articles.filter((article) => article.availableLocales.includes("he")).length > 12);
  assert.ok(model.articles.some((article) => article.availableLocales.length === 1));
  assert.ok(model.articles.some((article) => article.tags.length > 1));
  assert.ok(model.tags.length >= 18);
  assert.equal(model.authors.length, 4);
  assert.equal(model.series.length, 2);
});

const validRaw = {
  settings: {
    id: "blog",
    siteOrigin: "https://content.example",
    basePath: "/",
    locales: { en: { title: "Knowledge Hub", summary: "Practical marketing guidance." }, he: { title: "מרכז הידע", summary: "הנחיות שיווק מעשיות." } }
  },
  categories: [{ id: "seo", order: 2, locales: { en: { name: "SEO", slug: "seo", description: "Search guidance." }, he: { name: "SEO", slug: "seo", description: "הנחיות חיפוש." } } }],
  tags: [{ id: "technical-seo", locales: { en: { name: "Technical SEO", slug: "technical-seo" }, he: { name: "SEO טכני", slug: "technical-seo" } } }],
  authors: [{ id: "maya-chen", portrait: "assets/images/team/team-1.webp", expertise: ["seo"], locales: { en: { name: "Maya Chen", slug: "maya-chen", role: "Growth strategist", bio: "Growth strategist.", credentials: ["Growth strategy"] }, he: { name: "מאיה צ׳ן", slug: "maya-chen", role: "אסטרטגית צמיחה", bio: "אסטרטגית צמיחה.", credentials: ["אסטרטגיית צמיחה"] } } }],
  series: [],
  articles: [{
    id: "seo-audit",
    status: "published",
    primaryCategory: "seo",
    tags: ["technical-seo"],
    audiences: ["practitioners"],
    level: "intermediate",
    format: "checklist",
    primaryAuthor: "maya-chen",
    publishedAt: "2026-07-10T09:00:00.000Z",
    editedAt: "2026-07-12T09:00:00.000Z",
    hero: { src: "assets/images/services/service-magnifier-web-search-with-elements.webp", alt: { en: "Search analysis illustration", he: "איור ניתוח חיפוש" } },
    locales: {
      en: { slug: "seo-audit", title: "A practical SEO audit", summary: "Audit the essentials.", blocks: [{ type: "richText", heading: "Start with crawlability", paragraphs: ["Inspect robots rules and canonical URLs."] }] },
      he: { slug: "seo-audit", title: "בדיקת SEO מעשית", summary: "בדקו את היסודות.", blocks: [{ type: "richText", heading: "מתחילים בסריקה", paragraphs: ["בדקו כללי robots וכתובות קנוניות."] }] }
    }
  }]
};

test("loads the local JSON CMS source and orders article fixtures by filename", async () => {
  const sourceDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-source-"));
  const blogDir = resolve(sourceDir, "content", "blog");
  const articleDir = resolve(blogDir, "articles");
  const writeJson = (path, value) => writeFile(path, JSON.stringify(value));

  try {
    await mkdir(articleDir, { recursive: true });
    await Promise.all([
      writeJson(resolve(blogDir, "settings.json"), { id: "blog" }),
      writeJson(resolve(blogDir, "categories.json"), []),
      writeJson(resolve(blogDir, "tags.json"), []),
      writeJson(resolve(blogDir, "authors.json"), []),
      writeJson(resolve(blogDir, "series.json"), []),
      writeJson(resolve(articleDir, "z-last.json"), { id: "z-last" }),
      writeJson(resolve(articleDir, "a-first.json"), { id: "a-first" })
    ]);

    const source = await loadLocalBlogSource({ sourceDir });
    assert.equal(source.settings.id, "blog");
    assert.deepEqual(source.articles.map((article) => article.id), ["a-first", "z-last"]);
  } finally {
    await rm(sourceDir, { recursive: true, force: true });
  }
});

test("aggregates JSON parse failures with every source filename", async () => {
  const sourceDir = await mkdtemp(resolve(tmpdir(), "positivus-blog-invalid-json-"));
  const blogDir = resolve(sourceDir, "content", "blog");
  const articleDir = resolve(blogDir, "articles");
  try {
    await mkdir(articleDir, { recursive: true });
    await Promise.all([
      writeFile(resolve(blogDir, "settings.json"), "{ invalid settings"),
      writeFile(resolve(blogDir, "categories.json"), "[]"),
      writeFile(resolve(blogDir, "tags.json"), "[]"),
      writeFile(resolve(blogDir, "authors.json"), "[]"),
      writeFile(resolve(blogDir, "series.json"), "[]"),
      writeFile(resolve(articleDir, "broken-article.json"), "{ invalid article")
    ]);

    await assert.rejects(
      loadLocalBlogSource({ sourceDir }),
      (error) => error instanceof AggregateError && error.errors.length === 2 &&
        error.errors.some((entry) => /settings\.json/.test(entry.message)) &&
        error.errors.some((entry) => /broken-article\.json/.test(entry.message))
    );
  } finally {
    await rm(sourceDir, { recursive: true, force: true });
  }
});

test("rejects malformed blog settings IDs with contextual aggregate errors", () => {
  const invalid = structuredClone(validRaw);
  invalid.settings.id = "BAD!";

  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError && error.errors.some((entry) => /BAD!.*settings\.id/.test(entry.message))
  );
});

test("rejects unsafe canonical settings origins and base paths with field context", () => {
  const invalidSettings = [
    { field: "siteOrigin", value: "http://content.example" },
    { field: "siteOrigin", value: "https://editor@content.example" },
    { field: "siteOrigin", value: "https://content.example/?preview=1" },
    { field: "siteOrigin", value: "https://content.example/#preview" },
    { field: "siteOrigin", value: "https://content.example/unrelated" },
    { field: "siteOrigin", value: "https:content.example" },
    { field: "siteOrigin", value: "https:\\evil.example" },
    { field: "siteOrigin", value: " https://content.example" },
    { field: "siteOrigin", value: "https://content.example " },
    { field: "siteOrigin", value: "https://content.example/%2E" },
    { field: "siteOrigin", value: "https://content.example:443" },
    { field: "siteOrigin", value: "https://CONTENT.example" },
    { field: "siteOrigin", value: "https://content.example/" },
    { field: "basePath", value: "blog/" },
    { field: "basePath", value: "/blog" },
    { field: "basePath", value: "/blog/?preview=1" },
    { field: "basePath", value: "/blog/#preview" },
    { field: "basePath", value: "/blog\\path/" },
    { field: "basePath", value: "/./blog/" },
    { field: "basePath", value: "/%2e%2e/private/" },
    { field: "basePath", value: "/blog/\nprivate/" }
  ];

  for (const { field, value } of invalidSettings) {
    const invalid = structuredClone(validRaw);
    invalid.settings[field] = value;

    assert.throws(
      () => createBlogModel(invalid),
      (error) => error instanceof AggregateError && error.errors.some((entry) =>
        new RegExp(`blog.*settings\\.${field}`).test(entry.message)
      )
    );
  }
});

test("rejects percent-encoded traversal in hero, portrait, and nested block assets", () => {
  const invalid = structuredClone(validRaw);
  invalid.articles[0].hero.src = "assets/%2e%2e/private.webp";
  invalid.authors[0].portrait = "assets/%2Fprivate.webp";
  invalid.articles[0].locales.en.blocks = [{
    type: "figure",
    src: "assets/%5cprivate.webp",
    alt: "Unsafe asset path"
  }];

  assert.throws(
    () => createBlogModel(invalid),
    (error) =>
      error instanceof AggregateError &&
      error.errors.some((entry) => /seo-audit.*hero\.src/.test(entry.message)) &&
      error.errors.some((entry) => /maya-chen.*portrait/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*en.*blocks\[0\]\.src/.test(entry.message))
  );
});

test("rejects deeply encoded and malformed percent sequences in local assets", () => {
  const invalid = structuredClone(validRaw);
  invalid.articles[0].hero.src = "assets/%25252525252Fprivate.webp";
  invalid.authors[0].portrait = "assets/%25252525255cprivate.webp";
  invalid.articles[0].locales.en.blocks = [{
    type: "figure",
    src: "assets/%25252525252e%25252525252e/private.webp",
    alt: "Unsafe asset path"
  }];
  invalid.categories[0].artwork = "assets/%";

  assert.throws(
    () => createBlogModel(invalid),
    (error) =>
      error instanceof AggregateError &&
      error.errors.some((entry) => /seo-audit.*hero\.src/.test(entry.message)) &&
      error.errors.some((entry) => /maya-chen.*portrait/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*en.*blocks\[0\]\.src/.test(entry.message)) &&
      error.errors.some((entry) => /seo.*artwork/.test(entry.message))
  );
});

test("rejects controls, queries, and fragments in every local asset entry point", () => {
  const invalid = structuredClone(validRaw);
  invalid.articles[0].hero.src = "assets/\n../private.webp";
  invalid.authors[0].portrait = "assets/images/team/team-1.webp?preview";
  invalid.articles[0].locales.en.blocks = [{
    type: "figure",
    src: "assets/images/team/team-1.webp#hero",
    alt: "Unsafe asset path"
  }];
  invalid.categories[0].artwork = "assets/images/team/team-1.webp\u0000";

  assert.throws(
    () => createBlogModel(invalid),
    (error) =>
      error instanceof AggregateError &&
      error.errors.some((entry) => /seo-audit.*hero\.src/.test(entry.message)) &&
      error.errors.some((entry) => /maya-chen.*portrait/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*en.*blocks\[0\]\.src/.test(entry.message)) &&
      error.errors.some((entry) => /seo.*artwork/.test(entry.message))
  );
  assert.doesNotThrow(() => createBlogModel(validRaw));
});

test("creates lookup indexes and derived reading time", () => {
  const model = createBlogModel(validRaw, { now: new Date("2026-08-15T00:00:00Z") });
  assert.deepEqual(model.byId.article.get("seo-audit").readingMinutes, { en: 1, he: 1 });
  assert.equal(model.byId.category.get("seo").id, "seo");
});

test("rejects more than five tags and invalid edited dates", () => {
  const invalid = structuredClone(validRaw);
  invalid.articles[0].tags = ["a", "b", "c", "d", "e", "f"];
  invalid.articles[0].editedAt = "2026-07-01T09:00:00.000Z";
  assert.throws(() => createBlogModel(invalid), /no more than five tags/);
});

test("counts words across supported text blocks", () => {
  assert.equal(calculateReadingMinutes([{ type: "richText", heading: "One two", paragraphs: ["three four five"] }], 2), 3);
});

test("rejects every supported block shape that cannot render meaningful content", () => {
  const malformedBlocks = [
    { type: "introduction", heading: "Introduction", paragraphs: [] },
    { type: "keyTakeaways", heading: "Key takeaways", items: [] },
    { type: "richText", heading: "", paragraphs: [] },
    { type: "figure", heading: "Figure", src: "assets/images/team/team-1.webp", alt: "" },
    { type: "figure", decorative: true },
    { type: "quote", heading: "Quote", text: "" },
    { type: "stat", heading: "Stat", value: "", label: "A result" },
    { type: "checklist", heading: "Checklist", items: [""] },
    { type: "steps", heading: "Steps", items: [] },
    { type: "table", heading: "Comparison", caption: "Decision table", columns: ["Only one"], rows: [["Cell"]] },
    { type: "media", heading: "Media", src: "", alt: "Media" },
    { type: "media", decorative: true },
    { type: "download", heading: "Download", label: "Worksheet", fileLabel: "", href: "https://content.example/file.pdf" },
    { type: "citations", heading: "Sources", citations: [] },
    { type: "callout", heading: "Note", tone: "sales", body: "Useful copy." },
    { type: "faq", heading: "FAQ", items: [{ question: "Why?", answer: "" }] },
    { type: "consultation", serviceId: "seo", heading: "Talk to us", body: "", actionLabel: "Request a consultation" }
  ];

  for (const block of malformedBlocks) {
    const invalid = structuredClone(validRaw);
    invalid.articles[0].locales.en.blocks = [block];
    assert.throws(
      () => createBlogModel(invalid),
      (error) => error instanceof AggregateError &&
        error.errors.some((entry) => entry.message.includes("blocks[0]")),
      `expected ${block.type} to be rejected`
    );
  }
});

test("requires one localized consultation relationship block for each related service", () => {
  const missing = structuredClone(validRaw);
  missing.articles[0].relatedService = "seo";
  assert.throws(
    () => createBlogModel(missing),
    (error) => error instanceof AggregateError &&
      error.errors.some((entry) => /seo-audit.*en.*consultation/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*he.*consultation/.test(entry.message))
  );

  const mismatched = structuredClone(validRaw);
  mismatched.articles[0].relatedService = "seo";
  mismatched.articles[0].locales.en.blocks.push({
    type: "consultation",
    serviceId: "paid-media",
    heading: "Apply this audit",
    body: "This article's audit connects to our SEO planning service.",
    actionLabel: "Discuss SEO planning"
  });
  mismatched.articles[0].locales.he.blocks.push({
    type: "consultation",
    serviceId: "seo",
    heading: "יישום הבדיקה",
    body: "הבדיקה במאמר קשורה ישירות לשירות תכנון ה-SEO שלנו.",
    actionLabel: "שיחה על תכנון SEO"
  });
  assert.throws(
    () => createBlogModel(mismatched),
    (error) => error instanceof AggregateError &&
      error.errors.some((entry) => /seo-audit.*en.*consultation.*seo/.test(entry.message))
  );

  const unrelated = structuredClone(validRaw);
  unrelated.articles[0].locales.en.blocks.push({
    type: "consultation",
    serviceId: "seo",
    heading: "Apply this audit",
    body: "This article's audit connects to our SEO planning service.",
    actionLabel: "Discuss SEO planning"
  });
  assert.throws(
    () => createBlogModel(unrelated),
    (error) => error instanceof AggregateError &&
      error.errors.some((entry) => /seo-audit.*en.*consultation.*relatedService/.test(entry.message))
  );
});

test("publishes only released records at the supplied build time", () => {
  const raw = structuredClone(validRaw);
  const scheduled = structuredClone(validRaw.articles[0]);
  scheduled.id = "scheduled";
  scheduled.status = "scheduled";
  scheduled.publishedAt = "2026-09-01T09:00:00.000Z";
  scheduled.editedAt = "2026-09-01T09:00:00.000Z";
  scheduled.locales.en.slug = "scheduled-en";
  scheduled.locales.he.slug = "scheduled-he";
  raw.articles.push(scheduled);
  const model = createBlogModel(raw, { now: new Date("2026-08-15T00:00:00.000Z") });
  assert.deepEqual(model.publicArticles.map((article) => article.id), ["seo-audit"]);
});

test("requires credentials localized for every available author locale", () => {
  const invalid = structuredClone(validRaw);
  invalid.authors[0].locales.he.credentials = [];

  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError && error.errors.some((entry) => /maya-chen.*he.*credentials/.test(entry.message))
  );
});

test("rejects malformed author expertise and series fields before rendering", () => {
  const invalid = structuredClone(validRaw);
  invalid.authors[0].expertise = ["", "unknown-expertise"];
  invalid.series = [{
    id: "malformed-series",
    articleIds: ["seo-audit", "seo-audit", "missing-article"],
    audiences: [],
    level: "expert",
    locales: {
      en: { title: "Malformed series", slug: "malformed-series" },
      he: { title: "סדרה פגומה", slug: "malformed-series" }
    }
  }];

  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError &&
      error.errors.some((entry) => /maya-chen.*expertise\[0\]/.test(entry.message)) &&
      error.errors.some((entry) => /maya-chen.*expertise\[1\]/.test(entry.message)) &&
      error.errors.some((entry) => /malformed-series.*articleIds/.test(entry.message)) &&
      error.errors.some((entry) => /malformed-series.*audiences/.test(entry.message)) &&
      error.errors.some((entry) => /malformed-series.*level/.test(entry.message))
  );
});

test("requires nonempty bidirectional series membership", () => {
  const invalid = structuredClone(validRaw);
  invalid.series = [{
    id: "seo-series",
    articleIds: [],
    audiences: ["practitioners"],
    level: "intermediate",
    locales: {
      en: { title: "SEO series", slug: "seo-series", description: "A useful SEO sequence." },
      he: { title: "סדרת SEO", slug: "seo-series", description: "רצף SEO שימושי." }
    }
  }];
  invalid.articles[0].series = "seo-series";

  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError &&
      error.errors.some((entry) => /seo-series.*articleIds/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*series/.test(entry.message))
  );
});

test("rejects series entries whose articles point to another series", () => {
  const invalid = structuredClone(validRaw);
  invalid.series = [{
    id: "seo-series",
    articleIds: ["seo-audit"],
    audiences: ["practitioners"],
    level: "intermediate",
    locales: {
      en: { title: "SEO series", slug: "seo-series", description: "A useful SEO sequence." },
      he: { title: "סדרת SEO", slug: "seo-series", description: "רצף SEO שימושי." }
    }
  }];

  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError && error.errors.some((entry) => /seo-series.*articleIds\[0\]/.test(entry.message))
  );
});

test("requires route-safe localized slugs and renderer-visible localized copy", () => {
  const invalid = structuredClone(validRaw);
  invalid.settings.locales.en.summary = "";
  invalid.categories[0].locales.en.description = "";
  invalid.categories[0].locales.he.slug = "לא נתיב";
  invalid.tags[0].locales.en.slug = "Not a route";
  invalid.authors[0].locales.he.role = "";
  invalid.authors[0].locales.en.slug = "Maya Chen";
  invalid.articles[0].locales.en.slug = "SEO Audit";
  invalid.series = [{
    id: "seo-series",
    articleIds: ["seo-audit"],
    audiences: ["practitioners"],
    level: "intermediate",
    locales: {
      en: { title: "SEO series", slug: "SEO Series", description: "" },
      he: { title: "סדרת SEO", slug: "seo-series", description: "רצף SEO שימושי." }
    }
  }];
  invalid.articles[0].series = "seo-series";

  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError &&
      error.errors.some((entry) => /blog.*en.*summary/.test(entry.message)) &&
      error.errors.some((entry) => /seo.*en.*description/.test(entry.message)) &&
      error.errors.some((entry) => /seo.*he.*slug/.test(entry.message)) &&
      error.errors.some((entry) => /technical-seo.*en.*slug/.test(entry.message)) &&
      error.errors.some((entry) => /maya-chen.*he.*role/.test(entry.message)) &&
      error.errors.some((entry) => /maya-chen.*en.*slug/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*en.*slug/.test(entry.message)) &&
      error.errors.some((entry) => /seo-series.*en.*description/.test(entry.message)) &&
      error.errors.some((entry) => /seo-series.*en.*slug/.test(entry.message))
  );
});

test("rejects article relationships unavailable in the article locale before rendering", () => {
  const invalid = structuredClone(validRaw);
  invalid.articles[0].coAuthors = ["maya-chen"];
  invalid.articles[0].reviewer = "maya-chen";
  invalid.articles[0].series = "seo-series";
  invalid.series = [{
    id: "seo-series",
    articleIds: ["seo-audit"],
    audiences: ["practitioners"],
    level: "intermediate",
    locales: { en: { title: "SEO series", slug: "seo-series", description: "A useful SEO sequence." } }
  }];
  delete invalid.categories[0].locales.he;
  delete invalid.tags[0].locales.he;
  delete invalid.authors[0].locales.he;

  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError &&
      error.errors.some((entry) => /seo-audit.*he.*primaryCategory/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*he.*tags/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*he.*primaryAuthor/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*he.*coAuthors/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*he.*reviewer/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*he.*series/.test(entry.message))
  );
});

test("accepts canonical professional links and aggregates unsafe author-link errors", () => {
  const valid = structuredClone(validRaw);
  valid.authors[0].professionalLinks = [{
    label: { en: "Professional profile", he: "פרופיל מקצועי" },
    href: "https://profiles.example/maya"
  }];
  assert.doesNotThrow(() => createBlogModel(valid));

  const invalid = structuredClone(valid);
  invalid.authors[0].professionalLinks = [
    { label: "", href: "https://profiles.example/maya" },
    { label: "Unsafe", href: "https://editor@profiles.example/maya" },
    { label: "Control", href: "https://profiles.example/ma\nya" }
  ];
  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError &&
      error.errors.some((entry) => /maya-chen.*professionalLinks\[0\]\.label/.test(entry.message)) &&
      error.errors.some((entry) => /maya-chen.*professionalLinks\[1\]\.href/.test(entry.message)) &&
      error.errors.some((entry) => /maya-chen.*professionalLinks\[2\]\.href/.test(entry.message))
  );
});

test("aggregates malformed relationship, locale, and media errors with field context", () => {
  const invalid = structuredClone(validRaw);
  invalid.articles[0].primaryCategory = "unknown";
  invalid.articles[0].locales.en.slug = "";
  invalid.articles[0].hero.src = "https://example.com/hero.webp";
  invalid.articles[0].hero.alt = {};

  assert.throws(
    () => createBlogModel(invalid),
    (error) =>
      error instanceof AggregateError &&
      error.errors.some((entry) => /seo-audit.*en.*slug/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*primaryCategory/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*hero\.src/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*en.*hero\.alt/.test(entry.message))
  );
});

test("requires migrations for retired tags and archived articles", () => {
  const invalid = structuredClone(validRaw);
  invalid.tags[0].status = "retired";
  invalid.articles[0].status = "archived";

  assert.throws(
    () => createBlogModel(invalid),
    (error) =>
      error instanceof AggregateError &&
      error.errors.some((entry) => /technical-seo.*replacementTag/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*withdrawal/.test(entry.message))
  );
});

test("aggregates malformed related articles and locale blocks instead of throwing type errors", () => {
  const invalid = structuredClone(validRaw);
  invalid.articles[0].relatedArticles = { id: "seo-audit" };
  invalid.articles[0].locales.en.blocks = { type: "richText" };

  assert.throws(
    () => createBlogModel(invalid),
    (error) =>
      error instanceof AggregateError &&
      error.errors.some((entry) => /seo-audit.*relatedArticles/.test(entry.message)) &&
      error.errors.some((entry) => /seo-audit.*en.*blocks/.test(entry.message))
  );
});

test("rejects impossible ISO calendar dates", () => {
  const invalid = structuredClone(validRaw);
  invalid.articles[0].publishedAt = "2026-02-30T09:00:00.000Z";

  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError && error.errors.some((entry) => /seo-audit.*publishedAt.*valid date/.test(entry.message))
  );
});

test("rejects unsafe URLs in nested link-bearing content blocks", () => {
  const invalid = structuredClone(validRaw);
  invalid.articles[0].locales.en.blocks = [{
    type: "citations",
    citations: [{ label: "Unsafe source", href: "javascript:alert(1)" }]
  }];

  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError && error.errors.some((entry) => /seo-audit.*en.*blocks\[0\]\.citations\[0\]\.href.*safe link/.test(entry.message))
  );
});

test("calculates reading time independently for each available locale", () => {
  const raw = structuredClone(validRaw);
  raw.articles[0].locales.en.blocks = [{ type: "richText", paragraphs: ["word ".repeat(221)] }];
  raw.articles[0].locales.he.blocks = [{ type: "richText", paragraphs: ["מילה אחת"] }];

  const article = createBlogModel(raw).byId.article.get("seo-audit");
  assert.deepEqual(article.readingMinutes, { en: 2, he: 1 });
  assert.equal(article.locales.en.readingMinutes, 2);
  assert.equal(article.locales.he.readingMinutes, 1);
});

test("rejects retired-tag replacement cycles before they can reach public archives", () => {
  const invalid = structuredClone(validRaw);
  invalid.tags[0].status = "retired";
  invalid.tags[0].replacementTag = "replacement-tag";
  invalid.tags.push({
    id: "replacement-tag",
    status: "retired",
    replacementTag: "technical-seo",
    locales: {
      en: { name: "Replacement", slug: "replacement" },
      he: { name: "החלפה", slug: "replacement" }
    }
  });

  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError && error.errors.some((entry) => /technical-seo.*replacementTag.*active.*cycle/.test(entry.message))
  );
});

test("requires a retired-tag replacement chain to end at an active tag", () => {
  const invalid = structuredClone(validRaw);
  invalid.tags[0].status = "retired";
  invalid.tags[0].replacementTag = "replacement-tag";
  invalid.tags.push({
    id: "replacement-tag",
    status: "invalid-status",
    locales: {
      en: { name: "Replacement", slug: "replacement" },
      he: { name: "החלפה", slug: "replacement" }
    }
  });

  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError && error.errors.some((entry) => /technical-seo.*replacementTag.*active/.test(entry.message))
  );
});

test("requires archived redirects to contain documented routing fields", () => {
  const invalid = structuredClone(validRaw);
  invalid.articles[0].status = "archived";
  invalid.articles[0].redirect = {};

  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError && error.errors.some((entry) => /seo-audit.*redirect\.oldPath/.test(entry.message))
  );
});

test("requires archived withdrawals to contain a documented response", () => {
  const invalid = structuredClone(validRaw);
  invalid.articles[0].status = "archived";
  invalid.articles[0].withdrawal = {};

  assert.throws(
    () => createBlogModel(invalid),
    (error) => error instanceof AggregateError && error.errors.some((entry) => /seo-audit.*withdrawal\.reason/.test(entry.message))
  );
});
