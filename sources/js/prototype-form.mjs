/**
 * Install the submit boundary before making prototype controls interactive.
 * If enhancement cannot install, authored `disabled` attributes remain in
 * place and personal values cannot become successful form controls.
 */
export function armPrototypeForm(form, onSubmit) {
  if (!form || typeof form.addEventListener !== "function" || typeof onSubmit !== "function") {
    return false;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onSubmit(event);
  });
  for (const control of form.querySelectorAll("[data-prototype-control]")) {
    control.disabled = false;
  }
  form.dataset.prototypeReady = "true";
  return true;
}
