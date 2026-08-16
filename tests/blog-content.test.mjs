import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateReadingMinutes,
  createBlogModel
} from "../scripts/blog/schema.mjs";

const validRaw = {
  settings: { id: "blog", locales: { en: { title: "Knowledge Hub" }, he: { title: "מרכז הידע" } } },
  categories: [{ id: "seo", order: 2, locales: { en: { name: "SEO", slug: "seo" }, he: { name: "SEO", slug: "seo" } } }],
  tags: [{ id: "technical-seo", locales: { en: { name: "Technical SEO", slug: "technical-seo" }, he: { name: "SEO טכני", slug: "technical-seo" } } }],
  authors: [{ id: "maya-chen", portrait: "assets/images/team/team-1.webp", locales: { en: { name: "Maya Chen", slug: "maya-chen", bio: "Growth strategist." }, he: { name: "מאיה צ׳ן", slug: "maya-chen", bio: "אסטרטגית צמיחה." } } }],
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

test("creates lookup indexes and derived reading time", () => {
  const model = createBlogModel(validRaw, { now: new Date("2026-08-15T00:00:00Z") });
  assert.equal(model.byId.article.get("seo-audit").readingMinutes, 1);
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
