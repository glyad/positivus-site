import { spawnSync } from "node:child_process";

import { repositoryRoot } from "./build.mjs";

export function validateMergeParents(parents, expectedHead) {
  if (parents.length !== 2) {
    return "the release commit must be a regular two-parent merge commit";
  }

  if (expectedHead && !parents.includes(expectedHead)) {
    return `the release merge does not contain expected develop head ${expectedHead}`;
  }

  return undefined;
}

export function readMergeParents(commit) {
  const result = spawnSync("git", ["show", "-s", "--format=%P", commit], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `unable to inspect commit ${commit}`);
  }

  return result.stdout.trim().split(/\s+/).filter(Boolean);
}

export function runMergeGuard(args = process.argv.slice(2)) {
  const [commit = "HEAD", expectedHead] = args;
  const problem = validateMergeParents(readMergeParents(commit), expectedHead);

  if (problem) {
    throw new Error(problem);
  }

  console.log(`Regular merge guard passed for ${commit}.`);
}

if (process.argv[1] && process.argv[1].endsWith("merge-guard.mjs")) {
  try {
    runMergeGuard();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
