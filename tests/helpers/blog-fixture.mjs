import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { repositoryRoot } from "../../scripts/build.mjs";
import { loadLocalBlogSource } from "../../scripts/blog/local-json-adapter.mjs";
import { createBlogModel } from "../../scripts/blog/schema.mjs";

export async function loadRepositoryBlogModel() {
  const sourceDir = resolve(repositoryRoot, "sources");
  const raw = await loadLocalBlogSource({ sourceDir });
  return createBlogModel(raw, { now: new Date("2026-08-15T00:00:00.000Z") });
}

export async function loadRepositorySiteDocuments() {
  return JSON.parse(
    await readFile(resolve(repositoryRoot, "sources/content/site-search.json"), "utf8")
  );
}
