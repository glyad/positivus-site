import { rm } from "node:fs/promises";
import { resolve } from "node:path";

import { repositoryRoot } from "./build.mjs";

await Promise.all(
  ["artifacts", "coverage", "dist"].map((directory) =>
    rm(resolve(repositoryRoot, directory), { force: true, recursive: true })
  )
);

console.log("Removed generated build, package, and coverage output.");
