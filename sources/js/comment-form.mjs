/** Turn native constraint failures into an announced state with field focus recovery. */
export function bindInvalidCommentRecovery(control, onInvalid) {
  if (!control?.addEventListener || typeof onInvalid !== "function") throw new TypeError("comment recovery requires a control and state callback");
  control.addEventListener("invalid", (event) => {
    event.preventDefault();
    onInvalid(control.validity?.tooLong ? "too-long" : "too-short");
    control.focus();
  });
}
