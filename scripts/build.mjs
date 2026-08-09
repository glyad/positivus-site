import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
export const repositoryRoot = resolve(dirname(scriptPath), "..");

export async function buildSite({ rootDir = repositoryRoot } = {}) {
  const sourceDir = resolve(rootDir, "sources");
  const outputDir = resolve(rootDir, "dist");
  const packageMetadata = JSON.parse(
    await readFile(resolve(rootDir, "package.json"), "utf8")
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

  const stylesheet = await readFile(
    resolve(sourceDir, "scss", "main.scss"),
    "utf8"
  );
  await writeFile(
    resolve(outputDir, "css", "main.css"),
    `/* Generated from sources/scss/main.scss. */\n${stylesheet}`
  );

  const manifest = {
    name: packageMetadata.name,
    version: packageMetadata.version,
    entrypoint: "index.html",
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
