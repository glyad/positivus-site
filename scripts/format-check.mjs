import { readdir, readFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

import { repositoryRoot } from "./build.mjs";

const ignoredDirectories = new Set([
  ".git",
  "artifacts",
  "coverage",
  "dist",
  "node_modules",
]);
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".py",
  ".scss",
  ".svg",
  ".toml",
  ".txt",
  ".yaml",
  ".yml",
]);
const textFilenames = new Set([
  ".editorconfig",
  ".env.example",
  ".gitattributes",
  ".gitignore",
  ".npmrc",
  ".nvmrc",
  "LICENSE",
]);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }

    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else if (
      textExtensions.has(extname(entry.name)) ||
      textFilenames.has(entry.name)
    ) {
      files.push(entryPath);
    }
  }

  return files;
}

const problems = [];

for (const filePath of await collectFiles(repositoryRoot)) {
  const contents = await readFile(filePath, "utf8");
  const displayPath = relative(repositoryRoot, filePath);

  if (contents.includes("\r\n")) {
    problems.push(`${displayPath}: use LF line endings`);
  }

  if (contents && !contents.endsWith("\n")) {
    problems.push(`${displayPath}: add a final newline`);
  }

  if (extname(filePath) !== ".md") {
    contents.split("\n").forEach((line, index) => {
      if (/[\t ]+$/.test(line)) {
        problems.push(`${displayPath}:${index + 1}: remove trailing whitespace`);
      }
    });
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Formatting checks passed.");
}
