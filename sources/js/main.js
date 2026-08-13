(() => {
  const html = document.documentElement;
  const body = document.body;
  const languageToggle = document.querySelector("[data-language-toggle]");

  const hebrewText = {
    "Skip to content": "דילוג לתוכן",
    "About us": "אודותינו",
    Services: "שירותים",
    "Use Cases": "מקרי בוחן",
    Pricing: "תמחור",
    Blog: "בלוג",
    "Sign in": "התחברות",
    "Request a quote": "בקשת הצעת מחיר",
    "Navigating the digital landscape for success": "מנווטים בנוף הדיגיטלי להצלחה",
    "Our digital marketing agency helps businesses grow and succeed online through a range of services including SEO, PPC, social media marketing, and content creation.":
      "הסוכנות שלנו לשיווק דיגיטלי עוזרת לעסקים לצמוח ולהצליח אונליין באמצעות מגוון שירותים, בהם SEO, PPC, שיווק ברשתות חברתיות ויצירת תוכן.",
    "Book a consultation": "קביעת פגישת ייעוץ",
    "At our digital marketing agency, we offer a range of services to help businesses grow and succeed online. These services include:":
      "בסוכנות השיווק הדיגיטלי שלנו אנו מציעים מגוון שירותים שעוזרים לעסקים לצמוח ולהצליח אונליין. השירותים כוללים:",
    "Learn more": "מידע נוסף",
    "Let’s make things happen": "בואו נגרום לדברים לקרות",
    "Contact us today to learn more about how our digital marketing services can help your business grow and succeed online.":
      "צרו איתנו קשר עוד היום כדי לגלות כיצד שירותי השיווק הדיגיטלי שלנו יכולים לעזור לעסק שלכם לצמוח ולהצליח אונליין.",
    "Get your free proposal": "קבלת הצעה ללא עלות",
    "Case Studies": "מקרי בוחן",
    "Explore real-life examples of our proven digital marketing success through our case studies.":
      "גלו דוגמאות אמיתיות להצלחות המוכחות שלנו בשיווק דיגיטלי באמצעות מקרי הבוחן.",
    "For a local restaurant, we implemented a targeted PPC campaign that resulted in a 50% increase in website traffic and a 25% increase in sales.":
      "למסעדה מקומית יישמנו קמפיין PPC ממוקד שהוביל לעלייה של 50% בתנועת האתר ולעלייה של 25% במכירות.",
    "For a B2B software company, we developed an SEO strategy that resulted in a first page ranking for key keywords and a 200% increase in organic traffic.":
      "עבור חברת תוכנה B2B פיתחנו אסטרטגיית SEO שהשיגה דירוג בעמוד הראשון למילות מפתח מרכזיות ועלייה של 200% בתנועה האורגנית.",
    "For a national retail chain, we created a social media marketing campaign that increased followers by 25% and generated a 20% increase in online sales.":
      "עבור רשת קמעונאית ארצית יצרנו קמפיין שיווק ברשתות חברתיות שהגדיל את מספר העוקבים ב־25% והוביל לעלייה של 20% במכירות אונליין.",
    "Our Working Process": "תהליך העבודה שלנו",
    "Step-by-step guide to achieving your business goals.": "מדריך שלב אחר שלב להשגת היעדים העסקיים שלכם.",
    Consultation: "ייעוץ ראשוני",
    "Research and Strategy Development": "מחקר ופיתוח אסטרטגיה",
    Implementation: "יישום",
    "Monitoring and Optimization": "ניטור ואופטימיזציה",
    "Reporting and Communication": "דיווח ותקשורת",
    "Continual Improvement": "שיפור מתמשך",
    "During the initial consultation, we will discuss your business goals and objectives, target audience, and current marketing efforts. This will allow us to understand your needs and tailor our services to best fit your requirements.":
      "בפגישת הייעוץ הראשונית נדון ביעדים העסקיים שלכם, בקהל היעד ובפעילות השיווק הנוכחית. כך נוכל להבין את הצרכים שלכם ולהתאים את השירותים שלנו בצורה המדויקת ביותר.",
    "We research your market, audience, and competitors to create a focused digital marketing strategy with measurable goals and a clear execution plan.":
      "אנו חוקרים את השוק, הקהל והמתחרים שלכם כדי ליצור אסטרטגיית שיווק דיגיטלי ממוקדת, עם יעדים מדידים ותוכנית ביצוע ברורה.",
    "Once the strategy is approved, we launch the selected SEO, paid media, social, email, and content initiatives with clear ownership and timelines.":
      "לאחר אישור האסטרטגיה אנו משיקים את מהלכי ה־SEO, המדיה הממומנת, הרשתות החברתיות, הדוא״ל והתוכן, עם אחריות ולוחות זמנים ברורים.",
    "We monitor performance continuously and adjust targeting, creative, keywords, and budgets to improve results.":
      "אנו מנטרים את הביצועים באופן שוטף ומתאימים קהלים, קריאייטיב, מילות מפתח ותקציבים כדי לשפר את התוצאות.",
    "Regular reports connect activity to traffic, leads, conversions, and revenue while keeping your team informed about progress and next steps.":
      "דוחות שוטפים מחברים בין הפעילות לתנועה, לידים, המרות והכנסות, ומעדכנים את הצוות שלכם בהתקדמות ובצעדים הבאים.",
    "We test new opportunities, refine proven approaches, and evolve the strategy as your market and business goals change.":
      "אנו בוחנים הזדמנויות חדשות, משפרים שיטות מוכחות ומפתחים את האסטרטגיה בהתאם לשינויים בשוק וביעדים העסקיים שלכם.",
    Team: "הצוות",
    "Meet the skilled and experienced team behind our successful digital marketing strategies.":
      "הכירו את הצוות המיומן והמנוסה שמאחורי אסטרטגיות השיווק הדיגיטלי המצליחות שלנו.",
    "CEO and Founder": "מנכ״ל ומייסד",
    "Director of Operations": "מנהלת התפעול",
    "Senior SEO Specialist": "מומחה SEO בכיר",
    "PPC Manager": "מנהלת קמפייני PPC",
    "Social Media Specialist": "מומחה לרשתות חברתיות",
    "Content Creator": "יוצרת תוכן",
    "10+ years of experience in digital marketing. Expertise in SEO, PPC, and content strategy.":
      "יותר מ־10 שנות ניסיון בשיווק דיגיטלי. מומחיות ב־SEO, PPC ואסטרטגיית תוכן.",
    "7+ years of experience in project management and team leadership. Strong organizational and communication skills.":
      "יותר מ־7 שנות ניסיון בניהול פרויקטים ובהובלת צוותים. כישורי ארגון ותקשורת מצוינים.",
    "5+ years of experience in SEO and content creation. Proficient in keyword research and on-page optimization.":
      "יותר מ־5 שנות ניסיון ב־SEO וביצירת תוכן. מיומנות במחקר מילות מפתח ובאופטימיזציה בתוך האתר.",
    "3+ years of experience in paid search advertising. Skilled in campaign management and performance analysis.":
      "יותר מ־3 שנות ניסיון בפרסום ממומן בחיפוש. מיומנות בניהול קמפיינים ובניתוח ביצועים.",
    "4+ years of experience in social media marketing. Proficient in creating and scheduling content, analyzing metrics, and building engagement.":
      "יותר מ־4 שנות ניסיון בשיווק ברשתות חברתיות. מיומנות ביצירה ותזמון של תוכן, ניתוח מדדים ובניית מעורבות.",
    "2+ years of experience in writing and editing. Skilled in creating compelling, SEO-optimized content for various industries.":
      "יותר משנתיים של ניסיון בכתיבה ובעריכה. מיומנות ביצירת תוכן משכנע ומותאם ל־SEO עבור מגוון תחומים.",
    "See all team": "הצגת כל הצוות",
    "Show less": "הצגה מצומצמת",
    Testimonials: "המלצות",
    "Choose testimonial": "בחירת המלצה",
    "Previous testimonial": "ההמלצה הקודמת",
    "Next testimonial": "ההמלצה הבאה",
    "Hear from our satisfied clients: read our testimonials to learn more about our digital marketing services.":
      "שמעו מהלקוחות המרוצים שלנו וקראו את ההמלצות שלהם על שירותי השיווק הדיגיטלי שלנו.",
    "“We have been working with Positivus for the past year and have seen a significant increase in website traffic and leads as a result of their efforts. The team is professional, responsive, and truly cares about the success of our business.”":
      "״אנחנו עובדים עם Positivus כבר שנה, ובזכות הפעילות שלהם ראינו עלייה משמעותית בתנועת האתר ובלידים. הצוות מקצועי, זמין ובאמת אכפת לו מהצלחת העסק שלנו.״",
    "“Positivus brought clarity to our digital strategy and turned that plan into a campaign our whole team could understand. We now have stronger leads, cleaner reporting, and a reliable growth partner.”":
      "״Positivus יצרו בהירות באסטרטגיה הדיגיטלית שלנו והפכו אותה לקמפיין שכל הצוות הבין. היום יש לנו לידים איכותיים יותר, דיווח ברור ושותף אמין לצמיחה.״",
    "“Their SEO and content work helped us reach customers who had never found us before. Every recommendation was grounded in data, explained clearly, and delivered on time.”":
      "״עבודת ה־SEO והתוכן שלהם עזרה לנו להגיע ללקוחות שלא הכירו אותנו קודם. כל המלצה התבססה על נתונים, הוסברה בבירור ונמסרה בזמן.״",
    "“The team is proactive, thoughtful, and easy to work with. Our paid campaigns are more efficient and our internal team finally has reporting it can trust.”":
      "״הצוות יוזם, יסודי ונוח מאוד לעבודה. הקמפיינים הממומנים שלנו יעילים יותר, ולצוות הפנימי יש סוף סוף דוחות שאפשר לסמוך עליהם.״",
    "“From the first workshop to the latest optimization cycle, Positivus has kept our goals at the center of the work. The results speak for themselves.”":
      "״מהסדנה הראשונה ועד סבב האופטימיזציה האחרון, Positivus שמרו את היעדים שלנו במרכז העבודה. התוצאות מדברות בעד עצמן.״",
    "Marketing Director at XYZ Corp": "מנהל השיווק ב־XYZ Corp",
    "COO at Northstar Labs": "סמנכ״לית התפעול ב־Northstar Labs",
    "Founder at Field & Form": "מייסד Field & Form",
    "Growth Lead at Brightpath": "מנהלת הצמיחה ב־Brightpath",
    "VP Marketing at Arbor": "סמנכ״ל השיווק ב־Arbor",
    "Contact Us": "צרו קשר",
    "Connect with us: let’s discuss your digital marketing needs.":
      "דברו איתנו — נשמח להכיר את צרכי השיווק הדיגיטלי שלכם.",
    "Reason for contacting us": "סיבת הפנייה",
    "Say Hi": "רק לומר שלום",
    "Get a Quote": "קבלת הצעת מחיר",
    Name: "שם",
    "Email*": "דוא״ל*",
    "Message*": "הודעה*",
    "Send Message": "שליחת הודעה",
    "Contact us:": "צרו קשר:",
    "Email: info@positivus.com": "דוא״ל: info@positivus.com",
    "Phone: 555-567-8901": "טלפון: 555-567-8901",
    "Address: 1234 Main St": "כתובת: רחוב מיין 1234",
    "Moonstone City, Stardust State 12345": "מונסטון סיטי, מדינת סטארדסט 12345",
    "Email address": "כתובת דוא״ל",
    "Subscribe to news": "הרשמה לעדכונים",
    "© 2023 Positivus. All Rights Reserved.": "© 2023 Positivus. כל הזכויות שמורות.",
    "Privacy Policy": "מדיניות פרטיות",
    "Enter a valid email address.": "נא להזין כתובת דוא״ל תקינה.",
    "Tell us a little about what you need.": "ספרו לנו בקצרה במה נוכל לעזור.",
    "Please complete the highlighted fields.": "נא להשלים את השדות המסומנים.",
    "Thanks — your message is ready for our team. We’ll be in touch shortly.":
      "תודה — ההודעה מוכנה לצוות שלנו. נחזור אליכם בהקדם.",
    "Enter a valid email.": "נא להזין כתובת דוא״ל תקינה.",
    "You’re subscribed.": "נרשמתם בהצלחה."
  };

  const hebrewAttributes = {
    "aria-label": {
      "Positivus home": "עמוד הבית של Positivus",
      "Open navigation": "פתיחת הניווט",
      "Close navigation": "סגירת הניווט",
      "Dismiss navigation overlay": "סגירת שכבת הניווט",
      "Primary navigation": "ניווט ראשי",
      "Companies we have worked with": "חברות שעבדנו איתן",
      "Case studies": "מקרי בוחן",
      "Choose testimonial": "בחירת המלצה",
      "Previous testimonial": "ההמלצה הקודמת",
      "Next testimonial": "ההמלצה הבאה",
      "Footer navigation": "ניווט בתחתית האתר",
      "Social media": "רשתות חברתיות",
      "John Smith on LinkedIn": "הפרופיל של John Smith ב־LinkedIn",
      "Jane Doe on LinkedIn": "הפרופיל של Jane Doe ב־LinkedIn",
      "Michael Brown on LinkedIn": "הפרופיל של Michael Brown ב־LinkedIn",
      "Emily Johnson on LinkedIn": "הפרופיל של Emily Johnson ב־LinkedIn",
      "Brian Williams on LinkedIn": "הפרופיל של Brian Williams ב־LinkedIn",
      "Sarah Kim on LinkedIn": "הפרופיל של Sarah Kim ב־LinkedIn"
    },
    alt: {
      "Magnifier and search interface illustration": "איור של זכוכית מגדלת וממשק חיפוש",
      "Pay-per-click browser interface illustration": "איור של ממשק פרסום בתשלום לפי קליק",
      "Social media engagement illustration": "איור של מעורבות ברשתות חברתיות",
      "Email delivery illustration": "איור של שליחת דוא״ל",
      "Content creation browser windows illustration": "איור של חלונות דפדפן ליצירת תוכן",
      "Digital analytics dashboard illustration": "איור של לוח בקרה לניתוח נתונים דיגיטליים"
    },
    placeholder: {
      Name: "שם",
      Email: "דוא״ל",
      Message: "איך אפשר לעזור?"
    }
  };

  const serviceHeadings = [
    { en: ["Search engine", "optimization"], he: ["אופטימיזציה", "למנועי חיפוש"] },
    { en: ["Pay-per-click", "advertising"], he: ["פרסום בתשלום", "לפי קליק"] },
    { en: ["Social media", "marketing"], he: ["שיווק ברשתות", "חברתיות"] },
    { en: ["Email", "marketing"], he: ["שיווק", "בדוא״ל"] },
    { en: ["Content", "creation"], he: ["יצירת", "תוכן"] },
    { en: ["Analytics and", "tracking"], he: ["ניתוח נתונים", "ומעקב"] }
  ];

  const normalize = (value) => value.trim().replace(/\s+/g, " ");
  const reverseText = Object.fromEntries(Object.entries(hebrewText).map(([en, he]) => [he, en]));
  const reverseAttributes = Object.fromEntries(
    Object.entries(hebrewAttributes).map(([attribute, values]) => [
      attribute,
      Object.fromEntries(Object.entries(values).map(([en, he]) => [he, en]))
    ])
  );

  let currentLanguage = "en";

  const translateTextNodes = (language) => {
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node = walker.nextNode();

    while (node) {
      nodes.push(node);
      node = walker.nextNode();
    }

    nodes.forEach((textNode) => {
      const value = textNode.nodeValue ?? "";
      const normalized = normalize(value);
      if (!normalized) return;

      const english = reverseText[normalized] ?? normalized;
      if (!hebrewText[english]) return;

      const leadingWhitespace = value.match(/^\s*/)?.[0] ?? "";
      const trailingWhitespace = value.match(/\s*$/)?.[0] ?? "";
      const translated = language === "he" ? hebrewText[english] : english;
      textNode.nodeValue = `${leadingWhitespace}${translated}${trailingWhitespace}`;
    });
  };

  const translateAttributes = (language) => {
    Object.entries(hebrewAttributes).forEach(([attribute, values]) => {
      document.querySelectorAll(`[${attribute}]`).forEach((element) => {
        const currentValue = element.getAttribute(attribute);
        if (!currentValue) return;
        const english = reverseAttributes[attribute][currentValue] ?? currentValue;
        if (!values[english]) return;
        element.setAttribute(attribute, language === "he" ? values[english] : english);
      });
    });
  };

  const translateServiceHeadings = (language) => {
    document.querySelectorAll(".service-card .stacked-highlight").forEach((heading, index) => {
      const translation = serviceHeadings[index];
      if (!translation) return;
      const lines = heading.querySelectorAll(".highlight");
      lines.forEach((line, lineIndex) => {
        line.textContent = translation[language][lineIndex];
      });
    });
  };

  const t = (english) => (currentLanguage === "he" ? hebrewText[english] ?? english : english);

  const updateLanguageToggle = () => {
    if (!languageToggle) return;
    const switchingToHebrew = currentLanguage === "en";
    languageToggle.textContent = switchingToHebrew ? "עברית" : "English";
    languageToggle.lang = switchingToHebrew ? "he" : "en";
    languageToggle.setAttribute(
      "aria-label",
      switchingToHebrew ? "Switch to Hebrew" : "מעבר לאנגלית"
    );
    languageToggle.title = switchingToHebrew ? "Switch to Hebrew" : "מעבר לאנגלית";
  };

  const applyLanguage = (language, { persist = true } = {}) => {
    currentLanguage = language === "he" ? "he" : "en";
    html.lang = currentLanguage;
    html.dir = currentLanguage === "he" ? "rtl" : "ltr";
    html.dataset.language = currentLanguage;
    document.title =
      currentLanguage === "he"
        ? "Positivus — סוכנות לשיווק דיגיטלי"
        : "Positivus — Digital Marketing Agency";

    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute(
      "content",
      currentLanguage === "he"
        ? "Positivus היא סוכנות לשיווק דיגיטלי שעוזרת לעסקים לצמוח באמצעות SEO, PPC, רשתות חברתיות ושיווק תוכן."
        : "Positivus is a digital marketing agency helping businesses grow through SEO, PPC, social media, and content marketing."
    );

    translateTextNodes(currentLanguage);
    translateAttributes(currentLanguage);
    translateServiceHeadings(currentLanguage);
    updateLanguageToggle();

    if (persist) {
      try {
        localStorage.setItem("positivus-language", currentLanguage);
      } catch {
        // The language still changes when storage is unavailable.
      }
    }

    document.dispatchEvent(
      new CustomEvent("positivus:languagechange", { detail: { language: currentLanguage } })
    );
  };

  let savedLanguage = "en";
  try {
    savedLanguage = localStorage.getItem("positivus-language") === "he" ? "he" : "en";
  } catch {
    savedLanguage = "en";
  }

  languageToggle?.addEventListener("click", () => {
    applyLanguage(currentLanguage === "en" ? "he" : "en");
  });

  applyLanguage(savedLanguage, { persist: false });

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const backdrop = document.querySelector("[data-nav-backdrop]");

  const setMenuOpen = (open) => {
    if (!menuToggle || !nav || !backdrop) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute(
      "aria-label",
      currentLanguage === "he"
        ? open
          ? "סגירת הניווט"
          : "פתיחת הניווט"
        : open
          ? "Close navigation"
          : "Open navigation"
    );
    nav.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    body.classList.toggle("nav-open", open);
  };

  menuToggle?.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  backdrop?.addEventListener("click", () => setMenuOpen(false));

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  document.addEventListener("positivus:languagechange", () => {
    setMenuOpen(menuToggle?.getAttribute("aria-expanded") === "true");
  });

  const accordion = document.querySelector("[data-accordion]");

  accordion?.querySelectorAll("details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      accordion.querySelectorAll("details").forEach((otherItem) => {
        if (otherItem !== item) otherItem.open = false;
      });
    });
  });

  const teamGrid = document.querySelector(".team-grid");
  const teamToggle = document.querySelector("[data-team-toggle]");

  const updateTeamToggle = () => {
    if (!teamToggle) return;
    const expanded = teamGrid?.classList.contains("is-expanded") ?? false;
    teamToggle.textContent = t(expanded ? "Show less" : "See all team");
    teamToggle.setAttribute("aria-expanded", String(expanded));
  };

  teamToggle?.addEventListener("click", () => {
    teamGrid?.classList.toggle("is-expanded");
    updateTeamToggle();
  });

  document.addEventListener("positivus:languagechange", updateTeamToggle);
  updateTeamToggle();

  const carousel = document.querySelector("[data-carousel]");

  if (carousel) {
    const track = carousel.querySelector("[data-carousel-track]");
    const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
    const previousButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const dotsContainer = carousel.querySelector("[data-carousel-dots]");
    let index = 0;
    let pointerStart = null;

    const dots = slides.map((_, dotIndex) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("role", "tab");
      dot.addEventListener("click", () => setIndex(dotIndex));
      dotsContainer?.append(dot);
      return dot;
    });

    const slideStep = () => {
      if (!slides[0] || !track) return 0;
      const trackStyles = window.getComputedStyle(track);
      return slides[0].getBoundingClientRect().width + (Number.parseFloat(trackStyles.gap) || 0);
    };

    const updateCarouselLanguage = () => {
      previousButton?.setAttribute("aria-label", t("Previous testimonial"));
      nextButton?.setAttribute("aria-label", t("Next testimonial"));
      dotsContainer?.setAttribute("aria-label", t("Choose testimonial"));
      dots.forEach((dot, dotIndex) => {
        dot.setAttribute(
          "aria-label",
          currentLanguage === "he"
            ? `הצגת המלצה ${dotIndex + 1}`
            : `Show testimonial ${dotIndex + 1}`
        );
      });
    };

    const setIndex = (nextIndex) => {
      index = Math.max(0, Math.min(slides.length - 1, nextIndex));
      track.style.transform = `translate3d(${-index * slideStep()}px, 0, 0)`;

      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", String(active));
        dot.tabIndex = active ? 0 : -1;
      });

      previousButton.disabled = index === 0;
      nextButton.disabled = index === slides.length - 1;
    };

    previousButton?.addEventListener("click", () => setIndex(index - 1));
    nextButton?.addEventListener("click", () => setIndex(index + 1));

    carousel.addEventListener("pointerdown", (event) => {
      pointerStart = event.clientX;
    });

    carousel.addEventListener("pointerup", (event) => {
      if (pointerStart === null) return;
      const distance = event.clientX - pointerStart;
      if (Math.abs(distance) > 50) {
        const physicalDirection = distance < 0 ? 1 : -1;
        setIndex(index + physicalDirection);
      }
      pointerStart = null;
    });

    carousel.addEventListener("pointercancel", () => {
      pointerStart = null;
    });

    window.addEventListener("resize", () => setIndex(index));
    document.addEventListener("positivus:languagechange", () => {
      updateCarouselLanguage();
      setIndex(index);
    });
    updateCarouselLanguage();
    setIndex(0);
  }

  const contactForm = document.querySelector("[data-contact-form]");

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = contactForm.querySelector("[data-form-status]");
    const fields = [
      { name: "email", message: "Enter a valid email address." },
      { name: "message", message: "Tell us a little about what you need." }
    ];
    let firstInvalid = null;

    fields.forEach(({ name, message }) => {
      const input = contactForm.elements[name];
      const field = input.closest(".field");
      const error = contactForm.querySelector(`[data-error-for="${name}"]`);
      const isEmpty = !input.value.trim();
      const invalidEmail = name === "email" && input.value && !input.validity.valid;
      const invalid = isEmpty || invalidEmail;

      field.classList.toggle("is-invalid", invalid);
      input.setAttribute("aria-invalid", String(invalid));
      if (error) error.textContent = invalid ? t(message) : "";
      if (invalid && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      status.textContent = t("Please complete the highlighted fields.");
      status.classList.remove("is-success");
      firstInvalid.focus();
      return;
    }

    status.textContent = t("Thanks — your message is ready for our team. We’ll be in touch shortly.");
    status.classList.add("is-success");
    contactForm.reset();
  });

  const newsletter = document.querySelector("[data-newsletter-form]");

  newsletter?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = newsletter.elements.email;
    const status = newsletter.querySelector("[data-newsletter-status]");

    if (!input.validity.valid) {
      status.textContent = t("Enter a valid email.");
      input.focus();
      return;
    }

    status.textContent = t("You’re subscribed.");
    newsletter.reset();
  });
})();
