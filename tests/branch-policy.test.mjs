import assert from "node:assert/strict";
import test from "node:test";

import { validateBranchPolicy } from "../scripts/branch-policy.mjs";

test("branch policy accepts the repository flow", () => {
  assert.equal(validateBranchPolicy("develop", "feature/contact-copy"), undefined);
  assert.equal(validateBranchPolicy("main", "develop"), undefined);
  assert.equal(validateBranchPolicy("develop", "main"), undefined);
});

test("branch policy rejects bypasses", () => {
  assert.match(
    validateBranchPolicy("main", "feature/contact-copy"),
    /must come from develop/
  );
  assert.match(
    validateBranchPolicy("develop", "fix/contact-copy"),
    /must come from feature/
  );
});
