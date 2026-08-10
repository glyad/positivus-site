import assert from "node:assert/strict";
import test from "node:test";

import { validateMergeParents } from "../scripts/merge-guard.mjs";

test("merge guard accepts a regular merge containing develop head", () => {
  assert.equal(validateMergeParents(["base", "develop"], "develop"), undefined);
});

test("merge guard rejects squash, rebase, and unexpected merge parents", () => {
  assert.match(validateMergeParents(["base"], "develop"), /two-parent/);
  assert.match(
    validateMergeParents(["base", "other"], "develop"),
    /expected develop head/
  );
});
