import {
  commentDemoState,
  createDemoComment,
  drawerFocusAction,
  filterBlogDocuments,
  noResultsRecovery,
  paginate,
  parseBlogSearchState,
  shouldApplyDesktopFilterChange,
  sortBlogDocuments
} from "./blog-core.mjs";
import { dispatchInteraction } from "./measurement.mjs";

const FACETS = ["category", "format", "audience", "level", "author", "duration"];

function locale() {
  return document.documentElement.lang === "he" ? "he" : "en";
}

function blogCopy() {
  return locale() === "he"
    ? { results: "תוצאות", page: "עמוד", previous: "הקודם", next: "הבא", by: "מאת", noResults: "לא נמצאו תוצאות", filters: "מסננים פעילים", copySucceeded: "הקישור הועתק.", copyFailed: "לא הצלחנו להעתיק את הקישור.", commentAdded: "תגובת הדגמה נוספה למפגש הנוכחי בעמוד.", commentTooShort: "כתבו לפחות 2 תווים.", commentTooLong: "כתבו עד 2000 תווים.", commentSubmitting: "תגובת ההדגמה מתווספת למפגש הזה.", loadingResults: "אינדקס הבלוג נטען.", emptyQuery: "אין שאילתת חיפוש. כל התובנות מוצגות.", populatedResults: "תוצאות הבלוג עודכנו.", indexUnavailable: "אינדקס הבלוג אינו זמין. המאמרים שנטענו בשרת נשארים זמינים.", browseResults: "עיון בתוצאות הנוכחיות", newsletterSuccess: "הדגמת ההרשמה הושלמה. כתובת האימייל לא נשלחה ולא נשמרה.", newsletterFailure: "הזינו כתובת אימייל תקפה כדי לנסות שוב." }
    : { results: "results", page: "Page", previous: "Previous", next: "Next", by: "By", noResults: "No results", filters: "Active filters", copySucceeded: "Link copied.", copyFailed: "Could not copy the link.", commentAdded: "Demo comment added for this page session.", commentTooShort: "Write at least 2 characters.", commentTooLong: "Write no more than 2000 characters.", commentSubmitting: "Adding the demo comment to this page session.", loadingResults: "Loading the Blog index.", emptyQuery: "No search query. Showing all insights.", populatedResults: "Blog results updated.", indexUnavailable: "The Blog index is unavailable. The server-rendered articles remain available.", browseResults: "Browse the current results", newsletterSuccess: "Prototype signup complete. The email address was not sent or stored.", newsletterFailure: "Enter a valid email address to try again." };
}

function measure(action, contentType, contentId) {
  dispatchInteraction(document, { action, locale: locale(), contentType, contentId });
}

function selectedValues(control) {
  return control instanceof HTMLSelectElement ? [...control.selectedOptions].map((option) => option.value).filter(Boolean) : [];
}

function queryFromState(state) {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  for (const [stateKey, parameter] of [["categories", "category"], ["formats", "format"], ["audiences", "audience"], ["levels", "level"], ["authors", "author"], ["duration", "duration"]]) {
    for (const value of state[stateKey]) params.append(parameter, value);
  }
  if (state.from) params.set("from", state.from.slice(0, 10));
  if (state.to) params.set("to", state.to.slice(0, 10));
  if (state.sort !== (state.query ? "relevance" : "newest")) params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  return params;
}

function stateFromControls(root, documents, current, controlsRoot = root) {
  const params = queryFromState(current);
  const search = root.querySelector("[data-blog-search-form] input[name=q]");
  if (search?.value.trim()) params.set("q", search.value.trim()); else params.delete("q");
  for (const facet of FACETS) {
    params.delete(facet);
    for (const value of selectedValues(controlsRoot.querySelector(`[data-filter-${facet}]`))) params.append(facet, value);
  }
  for (const name of ["from", "to"]) {
    const value = controlsRoot.querySelector(`[data-filter-${name}]`)?.value ?? "";
    if (value) params.set(name, value); else params.delete(name);
  }
  const sort = root.querySelector("[data-blog-sort]")?.value ?? "";
  if (sort) params.set("sort", sort);
  params.delete("page");
  return parseBlogSearchState(params, documents);
}

function applyStateToControls(root, state) {
  const search = root.querySelector("[data-blog-search-form] input[name=q]");
  if (search) search.value = state.query;
  const values = { category: state.categories, format: state.formats, audience: state.audiences, level: state.levels, author: state.authors, duration: state.duration };
  for (const [facet, selected] of Object.entries(values)) {
    for (const control of root.querySelectorAll(`[data-filter-${facet}]`)) {
      for (const option of control.options) option.selected = selected.includes(option.value);
    }
  }
  for (const name of ["from", "to"]) {
    for (const control of root.querySelectorAll(`[data-filter-${name}]`)) control.value = state[name].slice(0, 10);
  }
  const sort = root.querySelector("[data-blog-sort]");
  if (sort) sort.value = state.sort;
}

function articleHref(root, value) {
  const indexUrl = new URL(root.dataset.blogIndex, document.baseURI);
  const base = indexUrl.href.replace(/blog\/search-index-(?:en|he)\.json$/u, "");
  return new URL(value, base).href;
}

function articleCard(root, article) {
  const copy = blogCopy();
  const card = document.createElement("article");
  card.className = "blog-card";
  card.dataset.articleCard = "";
  card.dataset.contentId = article.id;
  const heading = document.createElement("h3");
  const link = document.createElement("a");
  link.href = articleHref(root, article.href);
  link.textContent = article.title;
  link.dataset.measureAction = "result-select";
  link.dataset.contentType = "article";
  link.dataset.contentId = article.id;
  heading.append(link);
  const summary = document.createElement("p");
  summary.textContent = article.summary;
  const metadata = document.createElement("p");
  metadata.className = "blog-card__meta";
  metadata.textContent = `${copy.by} ${(article.keywords ?? []).at(-1) ?? ""} · ${new Intl.DateTimeFormat(locale(), { dateStyle: "long", timeZone: "UTC" }).format(new Date(article.publishedAt))}`;
  card.append(heading, summary, metadata);
  return card;
}

function renderChips(root, state, update) {
  const regions = root.querySelectorAll("[data-active-filters]");
  const chips = [
    ...state.categories.map((value) => ["categories", value]), ...state.formats.map((value) => ["formats", value]),
    ...state.audiences.map((value) => ["audiences", value]), ...state.levels.map((value) => ["levels", value]),
    ...state.authors.map((value) => ["authors", value]), ...state.duration.map((value) => ["duration", value]),
    ...(state.from ? [["from", state.from.slice(0, 10)]] : []), ...(state.to ? [["to", state.to.slice(0, 10)]] : [])
  ];
  for (const region of regions) {
    region.replaceChildren(`${blogCopy().filters}: ${chips.length}`);
    for (const [key, value] of chips) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `× ${value}`;
      button.addEventListener("click", () => {
        measure("filter-clear", "blog", "blog-index");
        const next = structuredClone(state);
        next[key] = Array.isArray(next[key]) ? next[key].filter((entry) => entry !== value) : "";
        next.page = 1;
        update(next);
      });
      region.append(" ", button);
    }
  }
}

function renderPagination(root, page, update) {
  const navigation = root.querySelector("[data-pagination]");
  if (!navigation) return;
  const list = document.createElement("ol");
  for (let number = 1; number <= page.pageCount; number += 1) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `?page=${number}`;
    link.textContent = String(number);
    if (number === page.page) link.setAttribute("aria-current", "page");
    link.addEventListener("click", (event) => { event.preventDefault(); update({ page: number }); });
    item.append(link);
    list.append(item);
  }
  navigation.replaceChildren(list);
}

function initBrowse(root) {
  const canEnhance = typeof fetch === "function" && root.dataset.blogIndex;
  if (!canEnhance) return;
  const grid = root.querySelector(".blog-card-grid");
  const count = root.querySelector("[data-result-count]");
  const heading = root.querySelector("[data-results-heading]");
  const drawer = root.querySelector("[data-filter-drawer]");
  const toggle = root.querySelector("[data-filter-toggle]");
  const runtimeStatus = root.querySelector("[data-blog-runtime-status]");
  let openingControl = null;
  let documents = [];
  let state;

  const setRuntimeStatus = (message) => {
    if (!runtimeStatus) return;
    const link = document.createElement("a");
    link.href = "#blog-results";
    link.dataset.stateRecovery = "";
    link.textContent = blogCopy().browseResults;
    runtimeStatus.replaceChildren(message, " ", link);
    runtimeStatus.hidden = false;
  };
  setRuntimeStatus(blogCopy().loadingResults);

  const closeDrawer = ({ restore = true } = {}) => {
    if (!drawer) return;
    drawer.hidden = true;
    toggle?.setAttribute("aria-expanded", "false");
    if (restore) openingControl?.focus();
  };
  const openDrawer = () => {
    if (!drawer) return;
    openingControl = toggle;
    drawer.hidden = false;
    toggle?.setAttribute("aria-expanded", "true");
    drawer.querySelector("select, input, button")?.focus();
  };
  const update = (patch = {}, { moveFocus = false } = {}) => {
    state = { ...state, ...patch };
    const visible = sortBlogDocuments(filterBlogDocuments(documents, state), state);
    const page = paginate(visible, state.page);
    state.page = page.page;
    const query = queryFromState(state).toString();
    history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}`);
    applyStateToControls(root, state);
    if (grid) {
      if (page.total) grid.replaceChildren(...page.items.map((article) => articleCard(root, article)));
      else {
        const recovery = noResultsRecovery(locale());
        const message = document.createElement("p");
        message.textContent = recovery.message;
        const clear = document.createElement("button");
        clear.type = "button";
        clear.dataset.clearBlogFilters = "";
        clear.textContent = recovery.action;
        clear.addEventListener("click", () => { measure("filter-clear", "blog", "blog-index"); update(parseBlogSearchState("", documents), { moveFocus: true }); });
        grid.replaceChildren(message, clear);
      }
    }
    if (count) count.textContent = `${page.total} ${blogCopy().results}`;
    const hasFilters = state.categories.length || state.formats.length || state.audiences.length || state.levels.length || state.authors.length || state.duration.length || state.from || state.to;
    setRuntimeStatus(!state.query && !hasFilters ? blogCopy().emptyQuery : blogCopy().populatedResults);
    renderChips(root, state, update);
    renderPagination(root, page, update);
    if (moveFocus) heading?.focus();
  };

  fetch(new URL(root.dataset.blogIndex, document.baseURI), { headers: { Accept: "application/json" } })
    .then((response) => {
      if (!response.ok) throw new Error("Blog index is unavailable");
      return response.json();
    })
    .then((payload) => {
      if (!Array.isArray(payload) || payload.some((document) => document?.type !== "article")) throw new TypeError("Blog index must contain articles only");
      documents = payload;
      state = parseBlogSearchState(location.search, documents);
      state.page = Math.max(1, Number.parseInt(root.dataset.blogStaticPage ?? "", 10) || state.page);
      update();
      root.querySelector("[data-blog-search-form]")?.addEventListener("submit", (event) => { event.preventDefault(); update(stateFromControls(root, documents, state), { moveFocus: true }); });
      root.querySelector("[data-blog-sort]")?.addEventListener("change", () => update(stateFromControls(root, documents, state)));
      for (const control of root.querySelector("[data-filter-panel]")?.querySelectorAll("select, input") ?? []) {
        const facet = [...FACETS, "from", "to"].find((name) => control.hasAttribute(`data-filter-${name}`));
        control.addEventListener("change", (event) => {
          if (shouldApplyDesktopFilterChange({ type: event.type, facet })) { measure("filter-apply", "blog", "blog-index"); update(stateFromControls(root, documents, state)); }
        });
      }
      toggle?.addEventListener("click", openDrawer);
      drawer?.querySelector("[data-filter-apply]")?.addEventListener("click", () => { measure("filter-apply", "blog", "blog-index"); closeDrawer({ restore: false }); update(stateFromControls(root, documents, state, drawer), { moveFocus: true }); });
      drawer?.querySelector("[data-filter-clear]")?.addEventListener("click", () => { measure("filter-clear", "blog", "blog-index"); closeDrawer({ restore: false }); update(parseBlogSearchState("", documents), { moveFocus: true }); });
      drawer?.addEventListener("keydown", (event) => {
        const controls = [...drawer.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])")];
        const action = drawerFocusAction({ key: event.key, index: controls.indexOf(document.activeElement), count: controls.length, shiftKey: event.shiftKey });
        if (action === "close") { event.preventDefault(); closeDrawer(); }
        if (action === "first" || action === "last") { event.preventDefault(); controls[action === "first" ? 0 : controls.length - 1]?.focus(); }
      });
    })
    .catch(() => { setRuntimeStatus(blogCopy().indexUnavailable); });
}

function initTagClouds() {
  for (const cloud of document.querySelectorAll("[data-tag-cloud]")) {
    const toggle = cloud.querySelector("[data-tag-cloud-toggle]");
    const list = cloud.querySelector("[data-tag-cloud-list]");
    toggle?.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") !== "false";
      toggle.setAttribute("aria-expanded", String(!expanded));
      if (list) list.hidden = expanded;
    });
  }
}

function initAuthorDirectory() {
  const directory = document.querySelector("[data-author-directory]");
  if (!directory) return;
  const query = directory.querySelector("[data-author-query]");
  const expertise = directory.querySelector("[data-author-expertise]");
  const cards = [...directory.querySelectorAll("[data-author-card]")];
  const count = directory.querySelector("[data-author-result-count]");
  const render = () => {
    const tokens = String(query?.value ?? "").toLocaleLowerCase().trim().split(/\s+/u).filter(Boolean);
    const selected = expertise?.value ?? "";
    const matched = cards.filter((card) => tokens.every((token) => `${card.dataset.authorName} ${card.dataset.authorBio}`.toLocaleLowerCase().includes(token)) && (!selected || card.dataset.authorExpertiseValues.split(" ").includes(selected)));
    for (const card of cards) card.hidden = !matched.includes(card);
    if (count) count.textContent = `${matched.length} ${blogCopy().results}`;
  };
  query?.addEventListener("input", render);
  expertise?.addEventListener("change", render);
  render();
}

function canonicalArticleUrl() {
  return document.querySelector('link[rel="canonical"]')?.href ?? window.location.href;
}

function copyWithSelectionFallback(value) {
  const control = document.createElement("textarea");
  control.value = value;
  control.setAttribute("readonly", "");
  control.style.position = "fixed";
  control.style.opacity = "0";
  document.body.append(control);
  control.select();
  const copied = document.execCommand("copy");
  control.remove();
  return copied;
}

function initArticleTools() {
  const status = document.querySelector("[data-article-tools-status]");
  const articleId = document.querySelector("[data-article-page]")?.dataset.contentId ?? "blog-article";
  const announce = (message) => { if (status) status.textContent = message; };
  document.querySelector("[data-copy-link]")?.addEventListener("click", async () => {
    measure("copy-link", "article", articleId);
    const value = canonicalArticleUrl();
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else if (!copyWithSelectionFallback(value)) throw new Error("Clipboard selection failed");
      announce(blogCopy().copySucceeded);
    } catch {
      try {
        if (!copyWithSelectionFallback(value)) throw new Error("Clipboard selection failed");
        announce(blogCopy().copySucceeded);
      } catch {
        announce(blogCopy().copyFailed);
      }
    }
  });
  document.querySelector("[data-print-article]")?.addEventListener("click", () => { measure("print-article", "article", articleId); window.print(); });
}

function initImageFallbacks() {
  for (const image of document.querySelectorAll("[data-article-image]")) {
    image.addEventListener("error", () => {
      image.hidden = true;
      const fallback = image.closest("figure")?.querySelector("[data-image-fallback]");
      if (fallback) fallback.hidden = false;
    }, { once: true });
  }
}

function initNewsletterForms() {
  for (const form of document.querySelectorAll("[data-newsletter-form]")) {
    const panel = form.closest(".blog-newsletter");
    const status = panel?.querySelector("[data-newsletter-status]");
    const retry = panel?.querySelector("[data-newsletter-retry]");
    const email = form.elements.email;
    const announce = (message, assertive = false) => {
      if (!status) return;
      status.setAttribute("role", assertive ? "alert" : "status");
      status.setAttribute("aria-live", assertive ? "assertive" : "polite");
      status.textContent = message;
      if (retry) retry.hidden = false;
    };
    form.addEventListener("invalid", () => announce(blogCopy().newsletterFailure, true), true);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      measure("newsletter-submit", "newsletter", "blog-newsletter");
      if (!form.checkValidity()) { announce(blogCopy().newsletterFailure, true); return; }
      announce(blogCopy().newsletterSuccess);
      form.reset();
    });
    retry?.addEventListener("click", () => { retry.hidden = true; if (status) status.textContent = ""; email?.focus(); });
  }
}

function initMeasuredNavigation() {
  document.addEventListener("submit", (event) => {
    if (event.target.matches?.("[data-blog-search-form]")) measure("blog-search-submit", "blog", "blog-index");
  });
  document.addEventListener("click", (event) => {
    const target = event.target.closest?.("[data-measure-action]");
    if (target) measure(target.dataset.measureAction, target.dataset.contentType, target.dataset.contentId);
    const consultation = event.target.closest?.("[data-consultation-service] a");
    if (consultation) {
      const section = consultation.closest("[data-consultation-service]");
      measure("consultation-action", "service", section.dataset.consultationService);
    }
  });
}

function initArticleToc() {
  const toc = document.querySelector("[data-article-toc]");
  if (!toc) return;
  const links = [...toc.querySelectorAll('a[href^="#"]')];
  const setCurrent = (id) => {
    for (const link of links) {
      const current = link.getAttribute("href") === `#${id}`;
      link.toggleAttribute("aria-current", current);
      link.closest("li")?.toggleAttribute("data-toc-current", current);
    }
  };
  const sections = links.map((link) => document.getElementById(link.getAttribute("href").slice(1))).filter(Boolean);
  for (const link of links) link.addEventListener("click", () => setCurrent(link.getAttribute("href").slice(1)));
  if (typeof IntersectionObserver !== "function" || !sections.length) return;
  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    const current = sections.find((section) => visible.has(section));
    if (current) setCurrent(current.id);
  }, { rootMargin: "0px 0px -60% 0px" });
  for (const section of sections) observer.observe(section);
}

function initBlogNavigation() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-nav]");
  const backdrop = document.querySelector("[data-nav-backdrop]");
  if (!toggle || !navigation || !backdrop) return;

  const labels = locale() === "he"
    ? { open: "פתיחת הניווט", close: "סגירת הניווט" }
    : { open: "Open navigation", close: "Close navigation" };
  const setOpen = (open, { restoreFocus = false } = {}) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? labels.close : labels.open);
    navigation.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    if (!open && restoreFocus) toggle.focus();
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  backdrop.addEventListener("click", () => setOpen(false));
  navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setOpen(false, { restoreFocus: true });
  });
}

const demoComments = [];

function initDemoComments() {
  for (const root of document.querySelectorAll("[data-demo-comments]")) {
    const state = commentDemoState(window.location.search);
    const signedOut = root.querySelector("[data-demo-comment-signed-out]");
    const form = root.querySelector("[data-demo-comment-form]");
    const list = root.querySelector("[data-demo-comment-list]");
    const status = root.querySelector("[data-demo-comment-status]");
    const sessionReset = root.querySelector("[data-comment-session-reset]");
    const write = root.querySelector("[data-comment-write]");
    root.dataset.demoCommentState = state;
    if (signedOut) signedOut.hidden = state === "signed-in";
    if (form) form.hidden = state !== "signed-in";
    if (sessionReset) sessionReset.hidden = state !== "signed-in";
    if (state !== "signed-in" || !form || !list) continue;
    const textarea = form.elements.comment;
    const submit = form.querySelector('[type="submit"]');
    write?.addEventListener("click", () => textarea?.focus());
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        const comment = createDemoComment(textarea?.value);
        if (status) { status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite"); status.textContent = blogCopy().commentSubmitting; }
        if (submit) submit.disabled = true;
        setTimeout(() => {
          demoComments.push(comment);
          const item = document.createElement("li");
          item.dataset.demoCommentId = comment.id;
          item.textContent = comment.text;
          list.append(item);
          textarea.value = "";
          if (submit) submit.disabled = false;
          if (status) status.textContent = blogCopy().commentAdded;
        }, 200);
      } catch (error) {
        if (status) { status.setAttribute("role", "alert"); status.setAttribute("aria-live", "assertive"); status.textContent = /no more than 2000/u.test(String(error?.message)) ? blogCopy().commentTooLong : blogCopy().commentTooShort; }
        textarea?.focus();
      }
    });
  }
}

for (const root of document.querySelectorAll("[data-blog-browse]")) initBrowse(root);
initTagClouds();
initAuthorDirectory();
initArticleTools();
initImageFallbacks();
initNewsletterForms();
initMeasuredNavigation();
initArticleToc();
initBlogNavigation();
initDemoComments();
