import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import { buildSite, repositoryRoot } from "../scripts/build.mjs";

test("build creates the deployable static site", async () => {
  const outputDir = await buildSite();

  for (const file of [
    "index.html",
    "css/main.css",
    "js/main.js",
    "assets/images/decor/contact-illustration.svg",
    "manifest.json",
  ]) {
    assert.equal((await stat(resolve(outputDir, file))).isFile(), true);
  }

  const stylesheet = await readFile(resolve(outputDir, "css/main.css"), "utf8");
  assert.match(stylesheet, /html\[dir="rtl"\] \.contact-panel__image/);

  const html = await readFile(resolve(outputDir, "index.html"), "utf8");
  assert.match(html, /css\/main\.css/);
  assert.match(html, /js\/main\.js/);
});

test("build manifest tracks the package version", async () => {
  await buildSite();
  const manifest = JSON.parse(
    await readFile(resolve(repositoryRoot, "dist/manifest.json"), "utf8")
  );
  const packageMetadata = JSON.parse(
    await readFile(resolve(repositoryRoot, "package.json"), "utf8")
  );

  assert.equal(manifest.version, packageMetadata.version);
});
