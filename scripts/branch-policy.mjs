export function validateBranchPolicy(baseBranch, headBranch) {
  if (!baseBranch || !headBranch) {
    return "base and head branches are required";
  }

  if (baseBranch === "main" && headBranch !== "develop") {
    return "pull requests into main must come from develop";
  }

  if (
    baseBranch === "develop" &&
    headBranch !== "main" &&
    !/^feature\/[a-z0-9][a-z0-9._-]*$/.test(headBranch)
  ) {
    return "pull requests into develop must come from feature/<short-description> or main for post-release synchronization";
  }

  if (!["main", "develop"].includes(baseBranch)) {
    return `unsupported protected base branch: ${baseBranch}`;
  }

  return undefined;
}

if (process.argv[1] && process.argv[1].endsWith("branch-policy.mjs")) {
  const baseBranch = process.argv[2] || process.env.GITHUB_BASE_REF;
  const headBranch = process.argv[3] || process.env.GITHUB_HEAD_REF;
  const problem = validateBranchPolicy(baseBranch, headBranch);

  if (problem) {
    console.error(problem);
    process.exitCode = 1;
  } else {
    console.log(`Branch policy passed: ${headBranch} → ${baseBranch}`);
  }
}
