import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { repositoryRoot } from "./build.mjs";
import { isValidSemver } from "./release-guard.mjs";

export function compareVersions(left, right) {
  const leftParts = left.split("-")[0].split(".").map(Number);
  const rightParts = right.split("-")[0].split(".").map(Number);

  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] - rightParts[index];
    }
  }

  if (left.includes("-") === right.includes("-")) return 0;
  return left.includes("-") ? -1 : 1;
}

export function planRelease(version, tags = []) {
  if (!isValidSemver(version)) {
    throw new Error(`package version is not valid SemVer: ${version}`);
  }

  const versions = tags
    .filter((tag) => /^v\d/.test(tag))
    .map((tag) => tag.slice(1))
    .filter(isValidSemver)
    .sort((left, right) => compareVersions(right, left));
  const previousVersion = versions[0];

  if (previousVersion && compareVersions(version, previousVersion) <= 0) {
    throw new Error(
      `package version ${version} must increment the latest release ${previousVersion}`
    );
  }

  return {
    previousTag: previousVersion ? `v${previousVersion}` : "",
    tag: `v${version}`,
    version,
  };
}

function listTags() {
  const result = spawnSync("git", ["tag", "--list", "v*"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "unable to list release tags");
  }

  return result.stdout.split("\n").filter(Boolean);
}

export async function runReleasePlan(args = process.argv.slice(2)) {
  const packageMetadata = JSON.parse(
    await readFile(resolve(repositoryRoot, "package.json"), "utf8")
  );
  const plan = planRelease(packageMetadata.version, listTags());
  const outputIndex = args.indexOf("--github-output");
  const outputPath =
    outputIndex === -1 ? undefined : args[outputIndex + 1] || process.env.GITHUB_OUTPUT;

  if (outputPath) {
    await appendFile(
      outputPath,
      `version=${plan.version}\ntag=${plan.tag}\nprevious_tag=${plan.previousTag}\n`
    );
  }

  console.log(
    `Release plan: ${plan.previousTag || "no prior release"} → ${plan.tag}.`
  );
  return plan;
}

if (process.argv[1] && process.argv[1].endsWith("release-plan.mjs")) {
  try {
    await runReleasePlan();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
