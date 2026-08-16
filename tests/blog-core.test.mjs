import assert from "node:assert/strict";
import test from "node:test";

import {
  drawerFocusAction,
  filterAuthors,
  filterBlogDocuments,
  noResultsRecovery,
  paginate,
  parseBlogSearchState,
  relatedArticleIds,
  sortBlogDocuments
  ,shouldApplyDesktopFilterChange
} from "../sources/js/blog-core.mjs";
import { createBlogSearchIndex } from "../scripts/blog/discovery.mjs";
import { loadRepositoryBlogModel } from "./helpers/blog-fixture.mjs";

test("combines dimensions and defaults to relevance only with a query", () => {
  const state = parseBlogSearchState("?q=seo&level=intermediate&format=checklist&page=2");
  assert.equal(state.sort, "relevance");
  assert.equal(state.page, 2);
  assert.deepEqual(state.levels, ["intermediate"]);
  assert.deepEqual(state.formats, ["checklist"]);
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
  const documents = createBlogSearchIndex({ model, locale: "en" });
  const state = parseBlogSearchState("?category=seo&category=not-a-category&author=not-an-author", documents);
  assert.deepEqual(state.categories, ["seo"]);
  assert.deepEqual(state.authors, []);
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
