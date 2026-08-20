/** Own the timer and values for one transient, in-memory comment session. */
export function createTransientCommentSession() {
  const comments = [];
  const timers = new Set();
  return {
    get comments() { return [...comments]; },
    get pendingCount() { return timers.size; },
    schedule(comment, onCommit, delay = 200) {
      const timer = setTimeout(() => {
        timers.delete(timer);
        comments.push(comment);
        onCommit?.(comment);
      }, delay);
      timers.add(timer);
      return timer;
    },
    reset() {
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      comments.length = 0;
    }
  };
}

/** Reset transient UI on page exit and whenever a document returns from BFCache. */
export function bindTransientPageLifecycle(target, reset) {
  if (!target?.addEventListener || typeof reset !== "function") return () => {};
  const onPageHide = () => reset();
  const onPageShow = (event) => { if (event.persisted === true) reset(); };
  target.addEventListener("pagehide", onPageHide);
  target.addEventListener("pageshow", onPageShow);
  return () => {
    target.removeEventListener("pagehide", onPageHide);
    target.removeEventListener("pageshow", onPageShow);
  };
}
