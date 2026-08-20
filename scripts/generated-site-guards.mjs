import { access, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const isExternal = (reference) => /^(?:https?:|mailto:|tel:|data:)/u.test(reference);

function safeOutputPath(outputDir, entrypoint) {
  if (typeof entrypoint !== "string" || entrypoint.startsWith("/") || entrypoint.split("/").includes("..")) return null;
  const path = resolve(outputDir, entrypoint);
  return relative(outputDir, path).startsWith("..") ? null : path;
}

function attributes(html, name) {
  return [...html.matchAll(new RegExp(`\\s${name}="([^"]*)"`, "gu"))].map((match) => match[1]);
}

function canonicalUrl(html) {
  return html.match(/<link\b(?=[^>]*\brel="canonical")(?=[^>]*\bhref="([^"]+)")[^>]*>/u)?.[1] ?? null;
}

function alternateUrls(html) {
  return [...html.matchAll(/<link\b(?=[^>]*\brel="alternate")(?=[^>]*\bhreflang="[^"]+")(?=[^>]*\bhref="([^"]+)")[^>]*>/gu)].map((match) => match[1]);
}

function elementAttribute(element, name) {
  const match = element.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "iu"));
  return match?.[1] ?? match?.[2] ?? null;
}

function isNonLocalRuntimeUrl(value) {
  return /^(?:[A-Za-z][A-Za-z0-9+.-]*:|\/\/)/u.test(value.trim());
}

function nonLocalRuntimeFailures(html, entrypoint) {
  const failures = [];
  for (const match of html.matchAll(/<script\b[^>]*>/giu)) {
    const source = elementAttribute(match[0], "src");
    if (source && isNonLocalRuntimeUrl(source)) failures.push(`${entrypoint}: non-local runtime script ${source}`);
  }
  for (const match of html.matchAll(/<link\b[^>]*>/giu)) {
    const rel = elementAttribute(match[0], "rel")?.toLocaleLowerCase().split(/\s+/u) ?? [];
    const href = elementAttribute(match[0], "href");
    if (rel.includes("stylesheet") && href && isNonLocalRuntimeUrl(href)) failures.push(`${entrypoint}: non-local runtime stylesheet ${href}`);
  }
  return failures;
}

/** Inspect emitted documents through their observable filesystem and link contracts. */
export async function validateGeneratedSite({ outputDir, entrypoints }) {
  const failures = [];
  const documents = new Map();
  const validPaths = [];

  for (const entrypoint of entrypoints ?? []) {
    const filePath = safeOutputPath(outputDir, entrypoint);
    if (!filePath) {
      failures.push(`generated path escapes output: ${entrypoint}`);
      continue;
    }
    validPaths.push({ entrypoint, filePath });
    try {
      documents.set(entrypoint, await readFile(filePath, "utf8"));
    } catch {
      failures.push(`${entrypoint}: generated file is missing`);
    }
  }

  const byCanonical = new Map([...documents].map(([entrypoint, html]) => [canonicalUrl(html), { entrypoint, html }]).filter(([url]) => url));
  for (const { entrypoint, filePath } of validPaths) {
    const html = documents.get(entrypoint);
    if (html === undefined) continue;

    const seenIds = new Set();
    for (const id of attributes(html, "id")) {
      if (seenIds.has(id)) failures.push(`${entrypoint}: duplicate id ${id}`);
      else seenIds.add(id);
    }

    for (const reference of [...attributes(html, "href"), ...attributes(html, "src")]) {
      if (!reference || reference.startsWith("#") || isExternal(reference)) continue;
      const cleanReference = reference.split(/[?#]/u, 1)[0];
      if (!cleanReference) continue;
      const target = resolve(dirname(filePath), cleanReference);
      if (relative(outputDir, target).startsWith("..")) {
        failures.push(`${entrypoint}: local reference escapes output ${reference}`);
        continue;
      }
      try {
        await access(target);
      } catch {
        failures.push(`${entrypoint}: missing local reference ${reference}`);
      }
    }

    failures.push(...nonLocalRuntimeFailures(html, entrypoint));
    for (const sentinel of new Set(html.match(/%%[A-Z0-9_]+%%/gu) ?? [])) {
      failures.push(`${entrypoint}: unresolved document sentinel ${sentinel}`);
    }

    const ownCanonical = canonicalUrl(html);
    for (const alternate of alternateUrls(html)) {
      if (!ownCanonical || alternate === ownCanonical) continue;
      const peer = byCanonical.get(alternate);
      if (!peer || !alternateUrls(peer.html).includes(ownCanonical)) {
        failures.push(`${entrypoint}: missing reciprocal language peer ${alternate}`);
      }
    }
  }
  return failures;
}
