import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import { buildSite, repositoryRoot } from "../scripts/build.mjs";

test("build creates the deployable static site", async () => {
  const outputDir = await buildSite();

  for (const file of [
    "index.html",
    "sign-in.html",
    "sign-up.html",
    "verify-email.html",
    "account.html",
    "css/main.css",
    "css/blog.css",
    "js/main.js",
    "js/auth.js",
    "assets/images/decor/contact-illustration.svg",
    "blog/index.html",
    "he/blog/index.html",
    "manifest.json",
  ]) {
    assert.equal((await stat(resolve(outputDir, file))).isFile(), true);
  }

  const stylesheet = await readFile(resolve(outputDir, "css/main.css"), "utf8");
  assert.match(stylesheet, /html\[dir="rtl"\] \.contact-panel__image/);

  const html = await readFile(resolve(outputDir, "index.html"), "utf8");
  assert.match(html, /css\/main\.css/);
  assert.match(html, /js\/main\.js/);

  const authHtml = await readFile(resolve(outputDir, "sign-up.html"), "utf8");
  assert.match(authHtml, /data-auth-page="sign-up"/);
  assert.match(authHtml, /autocomplete="new-password"/);
  assert.doesNotMatch(authHtml, /%%(?:TITLE|PAGE|AUTH_NAV|CONTENT)%%/);

  const blogHtml = await readFile(resolve(outputDir, "he/blog/index.html"), "utf8");
  assert.match(blogHtml, /lang="he" dir="rtl"/);
  assert.match(blogHtml, /href="\.\.\/\.\.\/css\/blog\.css"/);
  assert.match(blogHtml, /<form action="search\/index\.html" method="get" role="search"/);
  assert.doesNotMatch(blogHtml, /%%/);
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
  assert.ok(manifest.entrypoints.includes("sign-in.html"));
  assert.ok(manifest.entrypoints.includes("privacy.html"));
  assert.ok(manifest.entrypoints.includes("blog/index.html"));
  assert.ok(manifest.entrypoints.includes("he/blog/index.html"));
});
