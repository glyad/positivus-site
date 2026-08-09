import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { buildSite, repositoryRoot } from "./build.mjs";

const artifactsDir = resolve(repositoryRoot, "artifacts");
const packageMetadata = JSON.parse(
  await readFile(resolve(repositoryRoot, "package.json"), "utf8")
);
const packageDirectoryName = `${packageMetadata.name}-v${packageMetadata.version}`;
const stagingRoot = resolve(artifactsDir, ".staging");
const packageRoot = resolve(stagingRoot, packageDirectoryName);
const archiveName = `${packageDirectoryName}.tar.gz`;
const archivePath = resolve(artifactsDir, archiveName);

await rm(artifactsDir, { force: true, recursive: true });
await mkdir(packageRoot, { recursive: true });
await buildSite();

await Promise.all([
  cp(resolve(repositoryRoot, "dist"), resolve(packageRoot, "dist"), {
    recursive: true,
  }),
  ...[
    "ATTRIBUTION.md",
    "CHANGELOG.md",
    "LICENSE",
    "README.md",
    "package.json",
  ].map((file) =>
    cp(resolve(repositoryRoot, file), resolve(packageRoot, file))
  ),
]);

const packResult = spawnSync(
  "tar",
  ["-czf", archivePath, "-C", stagingRoot, packageDirectoryName],
  { encoding: "utf8" }
);

if (packResult.status !== 0) {
  throw new Error(packResult.stderr || "tar package creation failed");
}

await rm(stagingRoot, { force: true, recursive: true });
const archive = await readFile(archivePath);
const checksum = createHash("sha256").update(archive).digest("hex");
await writeFile(
  resolve(artifactsDir, "SHA256SUMS.txt"),
  `${checksum}  ${archiveName}\n`
);

console.log(`Created artifacts/${archiveName} and SHA256SUMS.txt`);
