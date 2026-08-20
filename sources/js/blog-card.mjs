const copy = {
  en: { by: "By", level: "Level", format: "Format", read: "min read" },
  he: { by: "מאת", level: "רמה", format: "פורמט", read: "דקות קריאה" }
};

/** Build the text presentation shared by enhanced Blog cards. */
export function createBlogCardPresentation(article, locale = "en") {
  if (!["en", "he"].includes(locale)) throw new TypeError("locale must be en or he");
  const ui = copy[locale];
  const authors = [article.primaryAuthor, ...(article.coAuthors ?? [])]
    .map((author) => author?.name)
    .filter((name) => typeof name === "string" && name.trim());
  const date = new Date(article.publishedAt);
  if (Number.isNaN(date.valueOf()) || !authors.length) throw new TypeError("article card metadata is incomplete");
  return {
    category: article.categoryLabel,
    title: article.title,
    summary: article.summary,
    meta: `${ui.by} ${authors.join(", ")} · ${new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(date)}`,
    details: `${ui.level}: ${article.levelLabel} · ${ui.format}: ${article.formatLabel} · ${article.readingMinutes} ${ui.read}`
  };
}
