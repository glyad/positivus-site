import assert from "node:assert/strict";
import test from "node:test";

import {
  groupSiteResults,
  normalizeSearchText,
  searchSiteDocuments
} from "../sources/js/site-search-core.mjs";

test("normalizes equivalent Latin text while preserving Hebrew letters", () => {
  assert.equal(normalizeSearchText("  CAFÉ\u0301  "), "cafe");
  assert.equal(normalizeSearchText("  שיווק דיגיטלי  "), "שיווק דיגיטלי");
});

test("ranks exact and title matches before summary matches", () => {
  const results = searchSiteDocuments([
    { id: "service-seo", type: "service", title: "SEO", summary: "Search optimization", keywords: ["seo"] },
    { id: "article-seo", type: "article", title: "Run an SEO audit", summary: "A checklist", keywords: ["audit"] },
    { id: "summary-seo", type: "page", title: "Guidance", summary: "Our SEO overview", keywords: [] }
  ], "SEO");

  assert.deepEqual(results.map((entry) => entry.id), ["service-seo", "article-seo", "summary-seo"]);
});

test("uses title tokens, keywords, summaries, and content in deterministic field order", () => {
  const results = searchSiteDocuments([
    { id: "content", type: "article", title: "Guide", summary: "Useful notes", keywords: [], content: "Plan each campaign" },
    { id: "summary", type: "article", title: "Guide", summary: "Campaign planning", keywords: [] },
    { id: "keyword", type: "service", title: "Guide", summary: "Useful notes", keywords: ["campaign"] },
    { id: "title-token", type: "page", title: "Campaign planning", summary: "Useful notes", keywords: [] }
  ], "campaign");

  assert.deepEqual(results.map((entry) => entry.id), ["title-token", "keyword", "summary", "content"]);
});

test("returns curated content for an empty query without search history", () => {
  const results = searchSiteDocuments([
    { id: "ordinary", type: "page", title: "Ordinary" },
    { id: "popular", type: "page", title: "Popular", featured: true },
    { id: "next", type: "article", title: "Next", featured: true }
  ], "");

  assert.deepEqual(results.map((entry) => entry.id), ["popular", "next"]);
});

test("limits matches deterministically by score then stable document identity", () => {
  const results = searchSiteDocuments([
    { id: "beta", type: "page", title: "SEO guide" },
    { id: "alpha", type: "page", title: "SEO guide" },
    { id: "gamma", type: "page", title: "SEO guide" }
  ], "seo", { limit: 2 });

  assert.deepEqual(results.map((entry) => entry.id), ["alpha", "beta"]);
});

test("groups result types in the shared navigation order", () => {
  const groups = groupSiteResults([
    { id: "article", type: "article" },
    { id: "service", type: "service" },
    { id: "author", type: "author" },
    { id: "page", type: "page" },
    { id: "case", type: "case-study" }
  ]);

  assert.deepEqual([...groups.keys()], ["page", "service", "case-study", "article", "author"]);
  assert.deepEqual(groups.get("case-study").map((entry) => entry.id), ["case"]);
});
