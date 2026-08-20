import assert from "node:assert/strict";
import test from "node:test";

import { armPrototypeForm } from "../sources/js/prototype-form.mjs";

test("arms a prototype form only after its transport-blocking submit listener is installed", () => {
  const form = new EventTarget();
  const controls = [
    { disabled: true, dataset: { prototypeControl: "" } },
    { disabled: true, dataset: { prototypeControl: "" } }
  ];
  form.dataset = {};
  form.querySelectorAll = (selector) => selector === "[data-prototype-control]" ? controls : [];
  let handled = 0;

  assert.equal(armPrototypeForm(form, () => { handled += 1; }), true);
  assert.deepEqual(controls.map((control) => control.disabled), [false, false]);
  assert.equal(form.dataset.prototypeReady, "true");

  const submit = new Event("submit", { cancelable: true });
  form.dispatchEvent(submit);
  assert.equal(submit.defaultPrevented, true);
  assert.equal(handled, 1);
});

test("leaves controls disabled when a prototype form cannot install a handler", () => {
  const control = { disabled: true, dataset: { prototypeControl: "" } };
  const form = {
    dataset: {},
    querySelectorAll: () => [control]
  };

  assert.equal(armPrototypeForm(form, () => {}), false);
  assert.equal(control.disabled, true);
  assert.deepEqual(form.dataset, {});
});
