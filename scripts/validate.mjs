import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { buildSite, repositoryRoot } from "./build.mjs";
import { validateGeneratedSite } from "./generated-site-guards.mjs";
import { formatContentValidationError, validateRepositoryBlogContent } from "./validate-content.mjs";
import { authNavigation, authPages, authText } from "../sources/js/auth-content.mjs";

const failures = [];
const sourceDir = resolve(repositoryRoot, "sources");

async function collectJavaScript(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJavaScript(entryPath)));
    } else if ([".js", ".mjs"].includes(extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

for (const filePath of [
  ...(await collectJavaScript(resolve(repositoryRoot, "scripts"))),
  ...(await collectJavaScript(resolve(sourceDir, "js"))),
  ...(await collectJavaScript(resolve(repositoryRoot, "tests"))),
]) {
  const result = spawnSync(process.execPath, ["--check", filePath], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    failures.push(
      `${relative(repositoryRoot, filePath)}: ${result.stderr.trim()}`
    );
  }
}

const htmlPath = resolve(sourceDir, "index.html");
const html = await readFile(htmlPath, "utf8");
const authFilenames = new Set(authPages.map((page) => page.filename));
const generatedFilenames = new Set(["blog/index.html", "search/index.html", "he/search/index.html"]);
const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(
  (match) => match[1]
);

for (const reference of references) {
  if (
    reference.startsWith("#") ||
    /^(?:https?:|mailto:|tel:)/.test(reference)
  ) {
    continue;
  }

  const cleanReference = reference.split(/[?#]/, 1)[0];
  if (authFilenames.has(cleanReference)) continue;
  if (generatedFilenames.has(cleanReference)) continue;
  const expectedPath =
    cleanReference === "css/main.css"
      ? resolve(sourceDir, "scss", "main.scss")
      : resolve(dirname(htmlPath), cleanReference);

  try {
    await readFile(expectedPath);
  } catch {
    failures.push(`sources/index.html: missing local reference ${reference}`);
  }
}

if (/(?:href|src)="https?:\/\/[^"]+\.(?:css|js)(?:[?#][^"]*)?"/.test(html)) {
  failures.push("sources/index.html: third-party runtime CSS or JavaScript detected");
}

const authTemplate = await readFile(resolve(sourceDir, "auth-template.html"), "utf8");
const authDocuments = authPages.map((page) => ({
  label: `generated ${page.filename}`,
  html: authTemplate
    .replaceAll("%%TITLE%%", authText[page.titleKey].en)
    .replaceAll("%%PAGE%%", page.page)
    .replaceAll("%%AUTH_NAV%%", authNavigation(page.section))
    .replaceAll("%%CONTENT%%", page.content)
}));

for (const document of authDocuments) {
  const authReferences = [
    ...document.html.matchAll(/(?:href|src)="([^"]+)"/g)
  ].map((match) => match[1]);

  for (const reference of authReferences) {
    if (reference.startsWith("#") || /^(?:https?:|mailto:|tel:)/.test(reference)) {
      continue;
    }

    const cleanReference = reference.split(/[?#]/, 1)[0];
    if (cleanReference.endsWith(".html")) {
      if (cleanReference === "index.html" || authFilenames.has(cleanReference)) continue;
      failures.push(`${document.label}: missing page reference ${reference}`);
      continue;
    }

    const expectedPath =
      cleanReference === "css/main.css"
        ? resolve(sourceDir, "scss", "main.scss")
        : resolve(sourceDir, cleanReference);

    try {
      await readFile(expectedPath);
    } catch {
      failures.push(`${document.label}: missing local reference ${reference}`);
    }
  }

  if (/(?:href|src)="https?:\/\/[^\"]+\.(?:css|js)(?:[?#][^\"]*)?"/.test(document.html)) {
    failures.push(`${document.label}: third-party runtime CSS or JavaScript detected`);
  }
}

const expectedAuthPages = [
  "account.html",
  "auth-success.html",
  "check-email.html",
  "forgot-password.html",
  "invalid-link.html",
  "password-updated.html",
  "privacy.html",
  "reset-password.html",
  "sign-in.html",
  "sign-up.html",
  "social-auth.html",
  "terms.html",
  "verify-email.html"
];

if (JSON.stringify([...authFilenames].sort()) !== JSON.stringify(expectedAuthPages)) {
  failures.push("authentication: generated page inventory is incomplete");
}

if (new Set(authPages.map((page) => page.page)).size !== authPages.length) {
  failures.push("authentication: duplicate page identifiers detected");
}

const authMarkup = [authTemplate, ...authPages.map((page) => page.content)].join("\n");
const translationKeys = [
  ...authMarkup.matchAll(/data-i18n(?:-placeholder|-aria-label)?="([^"]+)"/g)
].map((match) => match[1]);

for (const key of new Set(translationKeys)) {
  if (!authText[key]?.en || !authText[key]?.he) {
    failures.push(`authentication: missing complete translation for ${key}`);
  }
}

for (const placeholder of ["%%TITLE%%", "%%PAGE%%", "%%AUTH_NAV%%", "%%CONTENT%%"]) {
  if (authDocuments.some((document) => document.html.includes(placeholder))) {
    failures.push(`authentication: unresolved template placeholder ${placeholder}`);
  }
}

const authScript = await readFile(resolve(sourceDir, "js", "auth.js"), "utf8");
const storageWrites = authScript.match(/localStorage\.setItem\(/g) ?? [];
if (
  storageWrites.length !== 1 ||
  !authScript.includes('localStorage.setItem("positivus-language"')
) {
  failures.push("authentication: only the language preference may be stored");
}

for (const autocomplete of ["one-time-code", "current-password", "new-password"]) {
  if (!authMarkup.includes(`autocomplete="${autocomplete}"`)) {
    failures.push(`authentication: ${autocomplete} autocomplete is missing`);
  }
}

const stylesheet = await readFile(
  resolve(sourceDir, "scss", "main.scss"),
  "utf8"
);
const openingBraces = (stylesheet.match(/\{/g) || []).length;
const closingBraces = (stylesheet.match(/\}/g) || []).length;

if (openingBraces !== closingBraces) {
  failures.push("sources/scss/main.scss: unbalanced braces");
}

for (const requiredFragment of [
  "--green: #b9ff66",
  'html[dir="rtl"]',
  ".contact-panel__image",
]) {
  if (!stylesheet.toLowerCase().includes(requiredFragment.toLowerCase())) {
    failures.push(
      `sources/scss/main.scss: missing required design fragment ${requiredFragment}`
    );
  }
}

const packageMetadata = JSON.parse(
  await readFile(resolve(repositoryRoot, "package.json"), "utf8")
);
for (const requiredScript of [
  "build",
  "check",
  "dev",
  "lint",
  "package",
  "release:guard",
  "release:merge-guard",
  "release:plan",
  "test",
]) {
  if (!packageMetadata.scripts?.[requiredScript]) {
    failures.push(`package.json: missing ${requiredScript} script`);
  }
}

for (const requiredFile of [
  ".github/workflows/ci.yml",
  ".github/workflows/codeql.yml",
  ".github/workflows/release.yml",
  "AGENTS.md",
  "ATTRIBUTION.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "README.md",
  "RELEASING.md",
  "SECURITY.md",
  "package-lock.json",
]) {
  try {
    await readFile(resolve(repositoryRoot, requiredFile));
  } catch {
    failures.push(`repository: missing ${requiredFile}`);
  }
}

try {
  await validateRepositoryBlogContent({ sourceDir });
} catch (error) {
  failures.push(formatContentValidationError(error));
}

try {
  const outputDir = await buildSite();
  const manifest = JSON.parse(await readFile(resolve(outputDir, "manifest.json"), "utf8"));
  failures.push(...await validateGeneratedSite({ outputDir, entrypoints: manifest.entrypoints }));
} catch (error) {
  failures.push(`generated site: ${error.message}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Repository validation passed.");
}
