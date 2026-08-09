import { watch } from "node:fs";
import { resolve } from "node:path";

import { buildSite, repositoryRoot } from "./build.mjs";
import { startServer } from "./serve.mjs";

const sourceDir = resolve(repositoryRoot, "sources");
let rebuildTimer;
let rebuilding = false;
let rebuildRequested = false;

async function rebuild() {
  if (rebuilding) {
    rebuildRequested = true;
    return;
  }

  rebuilding = true;
  try {
    await buildSite();
    console.log("Rebuilt Positivus after a source change.");
  } catch (error) {
    console.error(error);
  } finally {
    rebuilding = false;
    if (rebuildRequested) {
      rebuildRequested = false;
      await rebuild();
    }
  }
}

await buildSite();
const server = await startServer();
const watcher = watch(sourceDir, { recursive: true }, () => {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(rebuild, 100);
});

function shutdown() {
  clearTimeout(rebuildTimer);
  watcher.close();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
