import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { repositoryRoot } from "./build.mjs";

export const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/;

export function isValidSemver(version) {
  return semverPattern.test(version);
}

function git(...args) {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  return {
    ok: result.status === 0,
    output: result.stdout.trim(),
  };
}

export async function runReleaseGuard(args = process.argv.slice(2)) {
  const problems = [];
  const allowDetached = args.includes("--allow-detached");
  const allowDirty = args.includes("--allow-dirty");
  const allowNonMain = args.includes("--allow-non-main");
  const tagIndex = args.indexOf("--tag");
  const requestedTag = tagIndex === -1 ? undefined : args[tagIndex + 1];
  const packageMetadata = JSON.parse(
    await readFile(resolve(repositoryRoot, "package.json"), "utf8")
  );
  const packageLock = JSON.parse(
    await readFile(resolve(repositoryRoot, "package-lock.json"), "utf8")
  );
  const changelog = await readFile(
    resolve(repositoryRoot, "CHANGELOG.md"),
    "utf8"
  );

  if (!isValidSemver(packageMetadata.version)) {
    problems.push(`package.json version is not valid SemVer: ${packageMetadata.version}`);
  }

  if (packageLock.version !== packageMetadata.version) {
    problems.push("package-lock.json version does not match package.json");
  }

  if (!changelog.includes(`## [${packageMetadata.version}]`)) {
    problems.push(`CHANGELOG.md has no [${packageMetadata.version}] release section`);
  }

  if (requestedTag && requestedTag !== `v${packageMetadata.version}`) {
    problems.push(
      `release tag ${requestedTag} does not match package version v${packageMetadata.version}`
    );
  }

  const branch = git("branch", "--show-current");
  if (!branch.ok) {
    problems.push("unable to determine the current Git branch");
  } else if (!branch.output && !allowDetached) {
    problems.push("release guard is running on a detached HEAD");
  } else if (branch.output && branch.output !== "main" && !allowNonMain) {
    problems.push(`release guard must run on main, not ${branch.output}`);
  }

  const status = git("status", "--porcelain");
  if (!status.ok) {
    problems.push("unable to determine Git worktree status");
  } else if (status.output && !allowDirty) {
    problems.push("release guard requires a clean worktree");
  }

  if (problems.length) {
    throw new Error(problems.join("\n"));
  }

  console.log(`Release guard passed for v${packageMetadata.version}.`);
}

if (process.argv[1] && process.argv[1].endsWith("release-guard.mjs")) {
  try {
    await runReleaseGuard();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
