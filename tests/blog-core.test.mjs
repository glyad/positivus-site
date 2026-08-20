import assert from "node:assert/strict";
import test from "node:test";

import {
  blogSearchHref,
  commentDemoState,
  createDemoComment,
  drawerFocusAction,
  filterAuthors,
  filterBlogDocuments,
  noResultsRecovery,
  paginate,
  parseBlogSearchState,
  relatedArticleIds,
  sortBlogDocuments
  ,shouldApplyDesktopFilterChange,
  blogSearchParams
} from "../sources/js/blog-core.mjs";
import { createBlogSearchIndex } from "../scripts/blog/discovery.mjs";
import { createBlogCardPresentation } from "../sources/js/blog-card.mjs";
import { loadRepositoryBlogModel } from "./helpers/blog-fixture.mjs";

test("combines dimensions and defaults to relevance only with a query", () => {
  const state = parseBlogSearchState("?q=seo&level=intermediate&format=checklist&page=2");
  assert.equal(state.sort, "relevance");
  assert.equal(state.page, 2);
  assert.deepEqual(state.levels, ["intermediate"]);
  assert.deepEqual(state.formats, ["checklist"]);
});

test("uses the static browse page only when the URL has no explicit page", () => {
  assert.equal(parseBlogSearchState("", undefined, { defaultPage: 2 }).page, 2);
  assert.equal(parseBlogSearchState("?page=1", undefined, { defaultPage: 2 }).page, 1);
  assert.equal(parseBlogSearchState("?page=3", undefined, { defaultPage: 2 }).page, 3);
});

test("filters every selected dimension with OR inside a dimension and AND across dimensions", () => {
  const documents = [
    { id: "matches-first", title: "SEO checklist", summary: "", content: "", keywords: [], category: "seo", format: "checklist", audiences: ["leaders", "practitioners"], level: "intermediate", authors: ["maya-chen"], readingMinutes: 5, publishedAt: "2026-08-10T00:00:00.000Z" },
    { id: "matches-second", title: "SEO checklist", summary: "", content: "", keywords: [], category: "seo", format: "checklist", audiences: ["specialists"], level: "intermediate", authors: ["daniel-levi"], readingMinutes: 8, publishedAt: "2026-08-09T00:00:00.000Z" },
    { id: "wrong-level", title: "SEO checklist", summary: "", content: "", keywords: [], category: "seo", format: "checklist", audiences: ["leaders"], level: "beginner", authors: ["maya-chen"], readingMinutes: 5, publishedAt: "2026-08-10T00:00:00.000Z" },
    { id: "wrong-duration", title: "SEO checklist", summary: "", content: "", keywords: [], category: "seo", format: "checklist", audiences: ["leaders"], level: "intermediate", authors: ["maya-chen"], readingMinutes: 14, publishedAt: "2026-08-10T00:00:00.000Z" }
  ];
  const state = {
    ...parseBlogSearchState("?q=seo&category=seo&format=checklist&audience=leaders&audience=specialists&level=intermediate&author=maya-chen&author=daniel-levi&duration=short&duration=medium&from=2026-08-01&to=2026-08-10"),
    sort: "relevance"
  };
  assert.deepEqual(filterBlogDocuments(documents, state).map((document) => document.id), ["matches-first", "matches-second"]);
});

test("sorts matching results by relevance and uses publication date then id as deterministic ties", () => {
  const state = parseBlogSearchState("?q=seo");
  const sorted = sortBlogDocuments([
    { id: "z-new", title: "SEO", summary: "", content: "", keywords: [], publishedAt: "2026-08-11T00:00:00.000Z", editedAt: "2026-08-12T00:00:00.000Z" },
    { id: "a-new", title: "SEO", summary: "", content: "", keywords: [], publishedAt: "2026-08-11T00:00:00.000Z", editedAt: "2026-08-11T00:00:00.000Z" },
    { id: "content-match", title: "Other", summary: "", content: "seo", keywords: [], publishedAt: "2026-08-12T00:00:00.000Z", editedAt: "2026-08-13T00:00:00.000Z" }
  ], state);
  assert.deepEqual(sorted.map((document) => document.id), ["a-new", "z-new", "content-match"]);
});

test("uses 12-item numbered pages and clamps a page beyond the final result", () => {
  const result = paginate(Array.from({ length: 14 }, (_, index) => index), 9);
  assert.deepEqual(result.items, [12, 13]);
  assert.equal(result.page, 2);
  assert.equal(result.pageCount, 2);
  assert.equal(result.total, 14);
});

test("prioritizes editorial selections before series relationships", async () => {
  const model = await loadRepositoryBlogModel();
  const article = model.byId.article.get("marketing-dashboard");
  assert.deepEqual(relatedArticleIds(article, model, 3), ["paid-media-budget", "social-metrics", "analytics-attribution-models"]);
});

test("filters the author directory by name and expertise", async () => {
  const model = await loadRepositoryBlogModel();
  assert.deepEqual(filterAuthors(model.authors, { query: "Daniel", expertise: "analytics" }).map((author) => author.id), ["daniel-levi"]);
});

test("ignores unsupported URL filter values after allowlists are supplied from the loaded blog index", async () => {
  const model = await loadRepositoryBlogModel();
  const documents = createBlogSearchIndex({ model, locale: "en" }).records;
  const state = parseBlogSearchState("?category=seo&category=not-a-category&author=not-an-author", documents);
  assert.deepEqual(state.categories, ["seo"]);
  assert.deepEqual(state.authors, []);
});

test("enhanced card presentation matches governed localized metadata and never keywords", () => {
  const article = {
    id: "coauthored-guide",
    title: "A shared guide",
    summary: "A governed summary.",
    href: "blog/shared-guide/index.html",
    keywords: ["Wrong keyword", "Not an author"],
    categoryLabel: "Analytics & Optimization",
    primaryAuthor: { id: "daniel-levi", name: "Daniel Levi" },
    coAuthors: [{ id: "maya-chen", name: "Maya Chen" }],
    levelLabel: "Intermediate",
    formatLabel: "Guide",
    readingMinutes: 6,
    publishedAt: "2026-08-10T00:00:00.000Z"
  };

  assert.deepEqual(createBlogCardPresentation(article, "en"), {
    category: "Analytics & Optimization",
    title: "A shared guide",
    summary: "A governed summary.",
    meta: "By Daniel Levi, Maya Chen · August 10, 2026",
    details: "Level: Intermediate · Format: Guide · 6 min read"
  });
});

test("enhanced pagination preserves the full query, filter, date, and sort state", () => {
  const state = parseBlogSearchState("?q=seo&category=seo&format=checklist&audience=leaders&level=intermediate&author=maya-chen&duration=short&from=2026-08-01&to=2026-08-10&sort=oldest");
  state.page = 2;
  assert.equal(
    blogSearchParams(state).toString(),
    "q=seo&category=seo&format=checklist&audience=leaders&level=intermediate&author=maya-chen&duration=short&from=2026-08-01&to=2026-08-10&sort=oldest&page=2"
  );
});

test("enhanced pagination resolves against the canonical localized browse route", () => {
  const state = parseBlogSearchState("?category=seo&page=2");
  assert.equal(
    blogSearchHref("../../index.html", { ...state, page: 1 }, "https://example.test/positivus-site/blog/search/page/2/index.html"),
    "https://example.test/positivus-site/blog/search/index.html?category=seo"
  );
  assert.equal(
    blogSearchHref("../../index.html", state, "https://example.test/positivus-site/he/blog/search/page/2/index.html"),
    "https://example.test/positivus-site/he/blog/search/index.html?category=seo&page=2"
  );
});

test("keeps mobile drawer tab focus inside the first and last focusable controls", () => {
  assert.equal(drawerFocusAction({ key: "Tab", index: 0, count: 3, shiftKey: true }), "last");
  assert.equal(drawerFocusAction({ key: "Tab", index: 2, count: 3, shiftKey: false }), "first");
  assert.equal(drawerFocusAction({ key: "Escape", index: 1, count: 3, shiftKey: false }), "close");
  assert.equal(drawerFocusAction({ key: "Tab", index: 1, count: 3, shiftKey: false }), "none");
});

test("applies desktop facet changes but not unrelated input events", () => {
  assert.equal(shouldApplyDesktopFilterChange({ type: "change", facet: "category" }), true);
  assert.equal(shouldApplyDesktopFilterChange({ type: "input", facet: "category" }), false);
  assert.equal(shouldApplyDesktopFilterChange({ type: "change", facet: "unrelated" }), false);
});

test("returns localized zero-result guidance with a clear-filters recovery action", () => {
  assert.deepEqual(noResultsRecovery("en"), { message: "No matching articles. Clear filters to browse every insight.", action: "Clear filters" });
  assert.deepEqual(noResultsRecovery("he"), { message: "לא נמצאו מאמרים תואמים. נקו מסננים כדי לעיין בכל התובנות.", action: "ניקוי מסננים" });
});

test("creates trimmed in-memory comments without identity data", () => {
  const comment = createDemoComment("  Useful framework.  ", { now: new Date("2026-08-15T10:00:00Z") });
  assert.equal(comment.text, "Useful framework.");
  assert.equal(comment.createdAt, "2026-08-15T10:00:00.000Z");
  assert.deepEqual(Object.keys(comment).sort(), ["createdAt", "id", "text"]);
  assert.throws(() => createDemoComment(" "), /at least 2 characters/);
  assert.throws(() => createDemoComment("x".repeat(2001)), /no more than 2000 characters/);
});

test("selects a comment preview only from the explicit demo query", () => {
  assert.equal(commentDemoState("?commenter=demo#comments"), "signed-in");
  assert.equal(commentDemoState("?commenter=Demo"), "signed-out");
  assert.equal(commentDemoState("?commenter=demo&email=person@example.com"), "signed-out");
});
