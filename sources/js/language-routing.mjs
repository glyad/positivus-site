export function landingBlogHref(language) {
  return language === "he" ? "he/blog/index.html" : "blog/index.html";
}

export function persistLanguagePreference(storage, language) {
  const locale = language === "he" ? "he" : "en";
  try {
    storage?.setItem("positivus-language", locale);
    return true;
  } catch {
    return false;
  }
}
