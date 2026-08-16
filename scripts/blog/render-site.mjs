import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { blogRoute, relativeSitePath } from "./routes.mjs";
import { escapeHtml, renderDocument } from "./render-shell.mjs";

const LOCALES = ["en", "he"];

function renderHomeMain({ locale, settings, outputPath, version }) {
  const content = settings.locales[locale];
  const browsePath = blogRoute({ locale, kind: "browse" });
  const relativeBrowsePath = relativeSitePath(outputPath, browsePath);
  const label = locale === "he" ? "תובנות שיווק מעשיות" : "Practical marketing insight";
  const search = locale === "he" ? "חיפוש בבלוג" : "Search the blog";
  return `<section class="blog-home shell" data-blog-home data-build-version="${escapeHtml(version)}">
  <p class="blog-home__eyebrow">${escapeHtml(label)}</p>
  <h1 id="page-title">${escapeHtml(content.title)}</h1>
  <p>${escapeHtml(content.summary ?? "")}</p>
  <form action="${relativeBrowsePath}" method="get" role="search" data-blog-search-form>
    <label for="blog-search-input">${escapeHtml(search)}</label>
    <input id="blog-search-input" name="q" type="search" />
    <button type="submit">${escapeHtml(search)}</button>
  </form>
</section>`;
}

/** Emit the minimal localized Blog Home shell for each configured locale. */
export async function renderBlogSite({ model, sourceDir, outputDir, version }) {
  if (!model?.settings?.locales) throw new TypeError("model must provide localized blog settings");
  const template = await readFile(resolve(sourceDir, "blog-template.html"), "utf8");
  const pages = [];
  for (const locale of LOCALES) {
    const settings = model.settings;
    if (!settings.locales[locale]) continue;
    const outputPath = blogRoute({ locale, kind: "home" });
    const alternateLocale = locale === "en" ? "he" : "en";
    const alternatePath = `${alternateLocale === "he" ? "he/blog" : "blog"}/`;
    const canonicalPath = `${locale === "he" ? "he/blog" : "blog"}/`;
    const html = renderDocument({
      template,
      locale,
      outputPath,
      title: settings.locales[locale].title,
      description: settings.locales[locale].summary ?? "",
      canonicalPath,
      alternatePath,
      bodyClass: "blog-page blog-home-page",
      mainHtml: renderHomeMain({ locale, settings, outputPath, version }),
      siteOrigin: settings.siteOrigin
    });
    await mkdir(dirname(resolve(outputDir, outputPath)), { recursive: true });
    await writeFile(resolve(outputDir, outputPath), html);
    pages.push(outputPath);
  }
  return pages;
}
