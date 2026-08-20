import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { repositoryRoot } from "./build.mjs";
import { loadLocalBlogSource } from "./blog/local-json-adapter.mjs";
import { createBlogModel } from "./blog/schema.mjs";

const scriptPath = fileURLToPath(import.meta.url);

/** Load and validate the repository's CMS-neutral Blog records. */
export async function validateRepositoryBlogContent({
  sourceDir = resolve(repositoryRoot, "sources"),
  now = new Date()
} = {}) {
  return createBlogModel(await loadLocalBlogSource({ sourceDir }), { now });
}

/** Format schema failures for editorial correction without losing field context. */
export function formatContentValidationError(error) {
  const entries = error instanceof AggregateError ? error.errors : [error];
  const grouped = new Map();
  for (const entry of entries) {
    const message = String(entry?.message ?? entry);
    const match = message.match(/^\[([^\]]+)\] \[([^\]]+)\] ([^:]+): (.+)$/u);
    const [record, locale, field, detail] = match
      ? match.slice(1)
      : ["unknown", "record", "validation", message];
    if (!grouped.has(record)) grouped.set(record, new Map());
    const locales = grouped.get(record);
    if (!locales.has(locale)) locales.set(locale, []);
    locales.get(locale).push({ field, detail });
  }

  const lines = ["Blog content validation failed."];
  for (const record of [...grouped.keys()].sort()) {
    lines.push(`Record: ${record}`);
    const locales = grouped.get(record);
    for (const locale of [...locales.keys()].sort()) {
      lines.push(`  Locale: ${locale}`);
      for (const { field, detail } of locales.get(locale).sort((left, right) => left.field.localeCompare(right.field))) {
        lines.push(`    ${field}: ${detail}`);
      }
    }
  }
  return lines.join("\n");
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  try {
    await validateRepositoryBlogContent();
    console.log("Blog content validation passed.");
  } catch (error) {
    console.error(formatContentValidationError(error));
    process.exitCode = 1;
  }
}
