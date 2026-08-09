import assert from "node:assert/strict";
import test from "node:test";

import { compareVersions, planRelease } from "../scripts/release-plan.mjs";

test("release plan accepts the first and incremented versions", () => {
  assert.deepEqual(planRelease("1.0.0"), {
    previousTag: "",
    tag: "v1.0.0",
    version: "1.0.0",
  });
  assert.equal(planRelease("1.1.0", ["v1.0.0"]).tag, "v1.1.0");
});

test("release plan rejects duplicate and decreasing versions", () => {
  assert.throws(() => planRelease("1.0.0", ["v1.0.0"]), /must increment/);
  assert.throws(() => planRelease("1.0.0", ["v1.1.0"]), /must increment/);
});

test("version comparison follows semantic numeric order", () => {
  assert.ok(compareVersions("1.10.0", "1.9.0") > 0);
  assert.ok(compareVersions("2.0.0", "1.99.99") > 0);
});
