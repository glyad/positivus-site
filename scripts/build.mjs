import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { authNavigation, authPages, authText } from "../sources/js/auth-content.mjs";
import { emitDiscoveryArtifacts } from "./blog/discovery.mjs";
import { loadLocalBlogSource } from "./blog/local-json-adapter.mjs";
import { discoveryEntrypoints, renderBlogSite } from "./blog/render-site.mjs";
import { createBlogModel } from "./blog/schema.mjs";

const scriptPath = fileURLToPath(import.meta.url);
export const repositoryRoot = resolve(dirname(scriptPath), "..");

export async function buildSite({ rootDir = repositoryRoot } = {}) {
  const sourceDir = resolve(rootDir, "sources");
  const outputDir = resolve(rootDir, "dist");
  const packageMetadata = JSON.parse(
    await readFile(resolve(rootDir, "package.json"), "utf8")
  );
  const authTemplate = await readFile(
    resolve(sourceDir, "auth-template.html"),
    "utf8"
  );
  const blogModel = createBlogModel(
    await loadLocalBlogSource({ sourceDir }),
    { now: new Date() }
  );
  const siteDocuments = JSON.parse(
    await readFile(resolve(sourceDir, "content", "site-search.json"), "utf8")
  );

  await rm(outputDir, { force: true, recursive: true });
  await mkdir(resolve(outputDir, "css"), { recursive: true });

  await Promise.all([
    cp(resolve(sourceDir, "assets"), resolve(outputDir, "assets"), {
      recursive: true,
    }),
    cp(resolve(sourceDir, "js"), resolve(outputDir, "js"), {
      recursive: true,
    }),
    cp(resolve(sourceDir, "index.html"), resolve(outputDir, "index.html")),
  ]);

  await Promise.all(
    authPages.map((page) => {
      const html = authTemplate
        .replaceAll("%%TITLE%%", authText[page.titleKey].en)
        .replaceAll("%%PAGE%%", page.page)
        .replaceAll("%%AUTH_NAV%%", authNavigation(page.section))
        .replaceAll("%%CONTENT%%", page.content);
      return writeFile(resolve(outputDir, page.filename), html);
    })
  );

  const stylesheet = await readFile(
    resolve(sourceDir, "scss", "main.scss"),
    "utf8"
  );
  await writeFile(
    resolve(outputDir, "css", "main.css"),
    `/* Generated from sources/scss/main.scss. */\n${stylesheet}`
  );
  const blogStylesheet = await readFile(
    resolve(sourceDir, "scss", "blog.scss"),
    "utf8"
  );
  await writeFile(
    resolve(outputDir, "css", "blog.css"),
    `/* Generated from sources/scss/blog.scss. */\n${blogStylesheet}`
  );

  const blogEntrypoints = await renderBlogSite({
    model: blogModel,
    sourceDir,
    outputDir,
    version: packageMetadata.version,
  });
  const discoveryArtifacts = await emitDiscoveryArtifacts({
    model: blogModel,
    siteDocuments,
    outputDir,
    siteOrigin: blogModel.settings.siteOrigin,
  });
  const generatedEntrypoints = discoveryEntrypoints(discoveryArtifacts);

  const manifest = {
    name: packageMetadata.name,
    version: packageMetadata.version,
    entrypoint: "index.html",
    entrypoints: ["index.html", ...authPages.map((page) => page.filename), ...blogEntrypoints, ...generatedEntrypoints],
    files: [...blogEntrypoints, ...discoveryArtifacts],
    source: "sources",
  };

  await Promise.all([
    writeFile(resolve(outputDir, ".nojekyll"), ""),
    writeFile(
      resolve(outputDir, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`
    ),
  ]);

  return outputDir;
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  const outputDir = await buildSite();
  console.log(`Built Positivus into ${outputDir}`);
}
