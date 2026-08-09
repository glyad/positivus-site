import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { repositoryRoot } from "./build.mjs";

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

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Repository validation passed.");
}
