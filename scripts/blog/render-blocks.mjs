const SAFE_ASSET_SEGMENT = /^[A-Za-z0-9_.-]+$/u;
const CONTROL_OR_BACKSLASH = /[\\\u0000-\u001F\u007F]/u;
const SAFE_SERVICE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

function plainText(value) {
  return typeof value === "string" || (typeof value === "number" && Number.isFinite(value))
    ? String(value)
    : "";
}

function text(value) {
  return escapeHtml(plainText(value));
}

function textItems(value) {
  return Array.isArray(value)
    ? value.filter((item) => plainText(item))
    : [];
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export const escapeAttribute = escapeHtml;

function heading(value) {
  const content = text(value);
  return content ? "<h2>" + content + "</h2>" : "";
}

function section(name, content) {
  return content ? '<section class="article-block article-block--' + name + '">' + content + "</section>" : "";
}

function isSafeAssetPath(value) {
  if (typeof value !== "string") return false;
  const segments = value.split("/");
  return segments.length > 1 && segments[0] === "assets" &&
    segments.every((segment, index) => index === 0 ||
      (segment !== "." && segment !== ".." && SAFE_ASSET_SEGMENT.test(segment)));
}

function isSafeResolvedAsset(value) {
  if (typeof value !== "string" || !value || value.startsWith("/") || CONTROL_OR_BACKSLASH.test(value) ||
      /[?#]/u.test(value)) return false;
  const segments = value.split("/");
  let assetsIndex = 0;
  while (segments[assetsIndex] === "..") assetsIndex += 1;
  return segments[assetsIndex] === "assets" && assetsIndex < segments.length - 1 &&
    segments.slice(assetsIndex + 1).every((segment) =>
      segment !== "." && segment !== ".." && SAFE_ASSET_SEGMENT.test(segment));
}

function resolveLocalAsset(path, resolveAsset) {
  if (!isSafeAssetPath(path) || typeof resolveAsset !== "function") return "";
  try {
    const resolved = resolveAsset(path);
    return isSafeResolvedAsset(resolved) ? resolved : "";
  } catch {
    return "";
  }
}

function renderList(items, tag) {
  const entries = textItems(items).map((item) => "<li>" + text(item) + "</li>").join("");
  return entries ? "<" + tag + ">" + entries + "</" + tag + ">" : "";
}

function renderKeyTakeaways(block) {
  return section("key-takeaways", heading(block.heading) + renderList(block.items, "ul"));
}

function renderRichText(block) {
  const paragraphs = textItems(block.paragraphs).map((paragraph) => "<p>" + text(paragraph) + "</p>").join("");
  return section("rich-text", heading(block.heading) + paragraphs);
}

function figcaption(block) {
  const caption = text(block.caption);
  const attribution = text(block.attribution);
  if (!caption && !attribution) return "";
  return "<figcaption>" + caption + (attribution ? (caption ? " " : "") + "<span>— " + attribution + "</span>" : "") + "</figcaption>";
}

function renderFigure(block, resolveAsset) {
  const src = resolveLocalAsset(block.src, resolveAsset);
  const alt = block.decorative === true ? "" : text(block.alt);
  if (!src || (block.decorative !== true && !alt)) return "";
  return section("figure", heading(block.heading) + '<figure><img src="' + escapeAttribute(src) +
    '" alt="' + alt + '" />' + figcaption(block) + "</figure>");
}

function renderQuote(block) {
  const quote = text(block.text);
  if (!quote) return "";
  const attribution = text(block.attribution);
  return section("quote", heading(block.heading) + "<blockquote><p>" + quote + "</p>" +
    (attribution ? "<footer>" + attribution + "</footer>" : "") + "</blockquote>");
}

function renderStat(block) {
  const value = plainText(block.value);
  if (!value) return "";
  const label = text(block.label);
  return section("stat", heading(block.heading) + '<p><data value="' + escapeAttribute(value) +
    '">' + text(value) + "</data>" + (label ? " <span>" + label + "</span>" : "") + "</p>");
}

function renderChecklist(block) {
  return section("checklist", heading(block.heading) + renderList(block.items, "ul"));
}

function renderSteps(block) {
  return section("steps", heading(block.heading) + renderList(block.items, "ol"));
}

function safeHref(value) {
  if (typeof value !== "string" || !value.trim() || CONTROL_OR_BACKSLASH.test(value)) return "";
  const href = value.trim();
  if (href.startsWith("//")) return "";
  try {
    const target = new URL(href, "https://content.invalid/");
    if (!["https:", "http:", "mailto:"].includes(target.protocol) || target.username || target.password) return "";
    return href;
  } catch {
    return "";
  }
}

function linkOpenTag(href, className = "") {
  const external = /^https?:/iu.test(href) ? ' target="_blank" rel="noreferrer noopener"' : "";
  const classAttribute = className ? ' class="' + className + '"' : "";
  return "<a" + classAttribute + ' href="' + escapeAttribute(href) + '"' + external + ">";
}

function renderLink(href, label, className = "") {
  const safe = safeHref(href);
  const content = text(label);
  return safe && content ? linkOpenTag(safe, className) + content + "</a>" : "";
}

function renderTable(block) {
  const columns = textItems(block.columns);
  const caption = text(block.caption);
  if (!columns.length || !caption || !Array.isArray(block.rows)) return "";
  const rows = block.rows
    .filter((row) => Array.isArray(row) && row.length && plainText(row[0]))
    .map((row) => {
      const cells = columns.slice(1).map((_, index) => "<td>" + text(row[index + 1]) + "</td>").join("");
      return '<tr><th scope="row">' + text(row[0]) + "</th>" + cells + "</tr>";
    }).join("");
  if (!rows) return "";
  const headers = columns.map((column) => '<th scope="col">' + text(column) + "</th>").join("");
  const label = plainText(block.heading) || plainText(block.caption);
  return section("table", heading(block.heading) + '<div class="article-block__table-wrap" role="region" aria-label="' +
    escapeAttribute(label) + '"><table><caption>' + caption + "</caption><thead><tr>" + headers +
    "</tr></thead><tbody>" + rows + "</tbody></table></div>");
}

function renderMedia(block, resolveAsset) {
  const src = resolveLocalAsset(block.src ?? block.image ?? block.thumbnail, resolveAsset);
  const alt = block.decorative === true ? "" : text(block.alt);
  if (!src || (block.decorative !== true && !alt)) return "";
  const image = '<img src="' + escapeAttribute(src) + '" alt="' + alt + '" />';
  const href = safeHref(block.href ?? block.url);
  const content = href ? linkOpenTag(href) + image + "</a>" : image;
  return section("media", heading(block.heading) + "<figure>" + content + figcaption(block) + "</figure>");
}

function renderDownload(block) {
  const label = plainText(block.label);
  const fileLabel = plainText(block.fileLabel);
  const link = renderLink(block.href ?? block.url, label, "article-block__download-link");
  return link && fileLabel
    ? section("download", heading(block.heading) + link + '<span class="article-block__file-label">File: ' + text(fileLabel) + "</span>")
    : "";
}

function renderCitations(block) {
  if (!Array.isArray(block.citations)) return "";
  const citations = block.citations.map((citation) => {
    if (!citation || typeof citation !== "object" || Array.isArray(citation)) return "";
    const link = renderLink(citation.href ?? citation.url, citation.label);
    return link ? "<li>" + link + "</li>" : "";
  }).filter(Boolean).join("");
  return section("citations", heading(block.heading) + (citations ? "<ol>" + citations + "</ol>" : ""));
}

const CALLOUT_TONES = {
  en: { info: "Information", warning: "Warning", expert: "Expert" },
  he: { info: "מידע", warning: "אזהרה", expert: "תובנה מקצועית" }
};

function renderCallout(block, locale) {
  const tone = Object.hasOwn(CALLOUT_TONES.en, block.tone) ? block.tone : "info";
  const body = text(block.body);
  return body
    ? section("callout callout--" + tone, heading(block.heading) + "<p><strong>" +
      CALLOUT_TONES[locale][tone] + ":</strong> " + body + "</p>")
    : "";
}

function renderFaq(block) {
  if (!Array.isArray(block.items)) return "";
  const items = block.items.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return "";
    const question = text(item.question);
    const answer = text(item.answer);
    return question && answer ? "<details><summary>" + question + "</summary><p>" + answer + "</p></details>" : "";
  }).filter(Boolean).join("");
  return section("faq", heading(block.heading) + items);
}

function renderConsultation(block, consultation) {
  if (!consultation || typeof consultation !== "object" || Array.isArray(consultation) ||
      typeof block.serviceId !== "string" || !SAFE_SERVICE_ID.test(block.serviceId) ||
      consultation.serviceId !== block.serviceId) return "";
  const action = renderLink(block.href ?? block.url, block.actionLabel, "article-block__consultation-action");
  if (!action) return "";
  const body = text(block.body);
  return '<section class="article-block article-block--consultation" data-consultation-service="' +
    escapeAttribute(block.serviceId) + '">' + heading(block.heading) + (body ? "<p>" + body + "</p>" : "") +
    action + "</section>";
}

/** Render normalized, structured article blocks without trusting authored HTML. */
export function renderBlocks(blocks, { locale = "en", resolveAsset, consultation } = {}) {
  if (!Array.isArray(blocks) || !["en", "he"].includes(locale)) return "";
  return blocks.map((block) => {
    if (!block || typeof block !== "object" || Array.isArray(block)) return "";
    switch (block.type) {
      case "keyTakeaways": return renderKeyTakeaways(block);
      case "richText": return renderRichText(block);
      case "figure": return renderFigure(block, resolveAsset);
      case "quote": return renderQuote(block);
      case "stat": return renderStat(block);
      case "checklist": return renderChecklist(block);
      case "steps": return renderSteps(block);
      case "table": return renderTable(block);
      case "media": return renderMedia(block, resolveAsset);
      case "download": return renderDownload(block);
      case "citations": return renderCitations(block);
      case "callout": return renderCallout(block, locale);
      case "faq": return renderFaq(block);
      case "consultation": return renderConsultation(block, consultation);
      default: return "";
    }
  }).filter(Boolean).join("\n");
}
