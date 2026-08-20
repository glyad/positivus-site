import assert from "node:assert/strict";
import test from "node:test";

import { createTransientCommentSession, bindTransientPageLifecycle } from "../sources/js/comment-session.mjs";
import { landingBlogHref } from "../sources/js/language-routing.mjs";

test("cancels pending comments and clears transient state on page exit", async () => {
  const committed = [];
  const session = createTransientCommentSession();
  session.schedule({ id: "private-comment", text: "Never retain me" }, (comment) => committed.push(comment), 20);
  assert.equal(session.pendingCount, 1);

  const lifecycle = new EventTarget();
  bindTransientPageLifecycle(lifecycle, () => session.reset());
  lifecycle.dispatchEvent(new Event("pagehide"));
  await new Promise((resolve) => setTimeout(resolve, 35));

  assert.equal(session.pendingCount, 0);
  assert.deepEqual(session.comments, []);
  assert.deepEqual(committed, []);
});

test("persisted page restoration clears committed demo comments", async () => {
  const session = createTransientCommentSession();
  session.schedule({ id: "temporary", text: "Temporary" }, () => {}, 0);
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(session.comments.length, 1);

  const lifecycle = new EventTarget();
  bindTransientPageLifecycle(lifecycle, () => session.reset());
  const restored = new Event("pageshow");
  Object.defineProperty(restored, "persisted", { value: true });
  lifecycle.dispatchEvent(restored);
  assert.deepEqual(session.comments, []);
});

test("landing Blog destinations follow the selected language without changing auth routes", () => {
  assert.equal(landingBlogHref("en"), "blog/index.html");
  assert.equal(landingBlogHref("he"), "he/blog/index.html");
  assert.equal(landingBlogHref("unknown"), "blog/index.html");
});
