import assert from "node:assert/strict";
import test from "node:test";

import { isValidSemver } from "../scripts/release-guard.mjs";

test("release guard accepts supported semantic versions", () => {
  assert.equal(isValidSemver("1.0.0"), true);
  assert.equal(isValidSemver("2.1.0-beta.1"), true);
});

test("release guard rejects malformed semantic versions", () => {
  assert.equal(isValidSemver("v1.0.0"), false);
  assert.equal(isValidSemver("01.0.0"), false);
  assert.equal(isValidSemver("1.0"), false);
});
