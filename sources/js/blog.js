import {
  drawerFocusAction,
  filterBlogDocuments,
  paginate,
  parseBlogSearchState,
  sortBlogDocuments
} from "./blog-core.mjs";

const FACETS = ["category", "format", "audience", "level", "author", "duration"];

function locale() {
  return document.documentElement.lang === "he" ? "he" : "en";
}

function blogCopy() {
  return locale() === "he"
    ? { results: "תוצאות", page: "עמוד", previous: "הקודם", next: "הבא", by: "מאת", noResults: "לא נמצאו תוצאות", filters: "מסננים פעילים" }
    : { results: "results", page: "Page", previous: "Previous", next: "Next", by: "By", noResults: "No results", filters: "Active filters" };
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
  const heading = document.createElement("h3");
  const link = document.createElement("a");
  link.href = articleHref(root, article.href);
  link.textContent = article.title;
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
  let openingControl = null;
  let documents = [];
  let state;

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
    grid?.replaceChildren(...page.items.map((article) => articleCard(root, article)));
    if (count) count.textContent = `${page.total} ${blogCopy().results}`;
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
      update();
      root.querySelector("[data-blog-search-form]")?.addEventListener("submit", (event) => { event.preventDefault(); update(stateFromControls(root, documents, state), { moveFocus: true }); });
      root.querySelector("[data-blog-sort]")?.addEventListener("change", () => update(stateFromControls(root, documents, state)));
      toggle?.addEventListener("click", openDrawer);
      drawer?.querySelector("[data-filter-apply]")?.addEventListener("click", () => { closeDrawer({ restore: false }); update(stateFromControls(root, documents, state, drawer), { moveFocus: true }); });
      drawer?.querySelector("[data-filter-clear]")?.addEventListener("click", () => update(parseBlogSearchState("", documents)));
      drawer?.addEventListener("keydown", (event) => {
        const controls = [...drawer.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])")];
        const action = drawerFocusAction({ key: event.key, index: controls.indexOf(document.activeElement), count: controls.length, shiftKey: event.shiftKey });
        if (action === "close") { event.preventDefault(); closeDrawer(); }
        if (action === "first" || action === "last") { event.preventDefault(); controls[action === "first" ? 0 : controls.length - 1]?.focus(); }
      });
    })
    .catch(() => { /* Leave the complete server-rendered browse page available. */ });
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

for (const root of document.querySelectorAll("[data-blog-browse]")) initBrowse(root);
initTagClouds();
initAuthorDirectory();
