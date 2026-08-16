import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

/**
 * Read the repository's CMS-neutral fixture format. Keeping this boundary small
 * lets a hosted CMS adapter provide the same raw shape in a future build.
 */
export async function loadLocalBlogSource({ sourceDir }) {
  const blogDir = resolve(sourceDir, "content", "blog");
  const articleDir = resolve(blogDir, "articles");
  const articleNames = (await readdir(articleDir))
    .filter((name) => name.endsWith(".json"))
    .sort();

  return {
    settings: await readJson(resolve(blogDir, "settings.json")),
    categories: await readJson(resolve(blogDir, "categories.json")),
    tags: await readJson(resolve(blogDir, "tags.json")),
    authors: await readJson(resolve(blogDir, "authors.json")),
    series: await readJson(resolve(blogDir, "series.json")),
    articles: await Promise.all(articleNames.map((name) => readJson(resolve(articleDir, name))))
  };
}
