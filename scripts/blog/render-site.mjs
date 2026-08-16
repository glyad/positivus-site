import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { blogRoute } from "./routes.mjs";
import {
  renderArticlePage,
  renderAuthorPage,
  renderAuthorsPage,
  renderBlogHome,
  renderBrowsePage,
  renderCategoryPage,
  renderMissingTranslationPage,
  renderSeriesPage,
  renderTagIndexPage,
  renderTagPage
} from "./render-pages.mjs";

const LOCALES = ["en", "he"];
const localized = (record, locale) => record?.locales?.[locale] ?? null;

function byLocalizedName(locale) {
  return (left, right) => localized(left, locale).name.localeCompare(localized(right, locale).name, locale) || left.id.localeCompare(right.id);
}

function emitPages(model, template, version) {
  const pages = [];
  for (const locale of LOCALES) {
    pages.push(renderBlogHome({ model, template, locale, version }));
    pages.push(renderBrowsePage({ model, template, locale }));
    pages.push(renderTagIndexPage({ model, template, locale }));
    for (const category of model.categories.filter((record) => localized(record, locale))) pages.push(renderCategoryPage({ model, template, locale, category }));
    for (const tag of model.tags.filter((record) => localized(record, locale)).sort(byLocalizedName(locale))) pages.push(renderTagPage({ model, template, locale, tag }));
    for (const series of model.series.filter((record) => localized(record, locale)).sort((left, right) => left.id.localeCompare(right.id))) pages.push(renderSeriesPage({ model, template, locale, series }));
    pages.push(renderAuthorsPage({ model, template, locale }));
    for (const author of model.authors.filter((record) => localized(record, locale)).sort(byLocalizedName(locale))) pages.push(renderAuthorPage({ model, template, locale, author }));
    for (const article of model.publicArticles
      .filter((record) => localized(record, locale))
      .sort((left, right) => right.publishedAt - left.publishedAt || left.id.localeCompare(right.id))) {
      pages.push(renderArticlePage({ model, template, locale, article }));
    }
  }

  for (const article of model.publicArticles
    .filter((record) => !localized(record, "he") && localized(record, "en"))
    .sort((left, right) => right.publishedAt - left.publishedAt || left.id.localeCompare(right.id))) {
    pages.push(renderMissingTranslationPage({
      model,
      template,
      article,
      outputPath: blogRoute({ locale: "he", kind: "article", slug: localized(article, "en").slug })
    }));
  }
  return pages;
}

function assertUniqueOutputPaths(pages) {
  const byOutputPath = new Map();
  for (const page of pages) {
    const collisions = byOutputPath.get(page.outputPath) ?? [];
    collisions.push(page);
    byOutputPath.set(page.outputPath, collisions);
  }
  const duplicates = [...byOutputPath]
    .filter(([, pagesForPath]) => pagesForPath.length > 1)
    .map(([outputPath, pagesForPath]) => `${outputPath} (${pagesForPath.length} pages)`);
  if (duplicates.length) throw new Error(`Duplicate blog output paths: ${duplicates.join(", ")}`);
}

/** Emit every deterministic, localized Blog entrypoint and return its manifest paths. */
export async function renderBlogSite({ model, sourceDir, outputDir, version }) {
  if (!model?.settings?.locales) throw new TypeError("model must provide localized blog settings");
  const template = await readFile(resolve(sourceDir, "blog-template.html"), "utf8");
  const rendered = emitPages(model, template, version);
  assertUniqueOutputPaths(rendered);
  const paths = [];
  for (const page of rendered) {
    await mkdir(dirname(resolve(outputDir, page.outputPath)), { recursive: true });
    await writeFile(resolve(outputDir, page.outputPath), page.html);
    paths.push(page.outputPath);
  }
  return paths;
}
