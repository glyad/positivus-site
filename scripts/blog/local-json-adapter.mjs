import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`${path}: ${error.message}`, { cause: error });
  }
}

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

  const paths = [
    resolve(blogDir, "settings.json"),
    resolve(blogDir, "categories.json"),
    resolve(blogDir, "tags.json"),
    resolve(blogDir, "authors.json"),
    resolve(blogDir, "series.json"),
    ...articleNames.map((name) => resolve(articleDir, name))
  ];
  const results = await Promise.allSettled(paths.map(readJson));
  const errors = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);
  if (errors.length) {
    throw new AggregateError(errors, "Unable to load Blog JSON sources");
  }
  const values = results.map((result) => result.value);

  return {
    settings: values[0],
    categories: values[1],
    tags: values[2],
    authors: values[3],
    series: values[4],
    articles: values.slice(5)
  };
}
